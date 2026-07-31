// Publishes a message to the EMQX Cloud deployment via its HTTP API, so the
// Worker never has to hold open an MQTT session of its own.
async function publishToEmqx(env, topic, payloadObj, { qos = 1, retain = false } = {}) {
  const auth = btoa(`${env.EMQX_API_KEY}:${env.EMQX_API_SECRET}`);
  const res = await fetch(`${env.EMQX_API_BASE}/publish`, {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ topic, payload: JSON.stringify(payloadObj), qos, retain }),
  });
  if (!res.ok) {
    throw new Error(`EMQX publish to ${topic} failed: ${res.status} ${await res.text()}`);
  }
}

const DEFAULT_STATE = '{"led0":0,"led1":0,"led2":0,"servoAngle":90,"sound":false,"song":null,"updatedAt":0}';

// Holds the board's latest reported state in a single global instance, so
// every edge reads/writes the same data. Plain `caches.default` won't do
// here — that cache is per-datacenter, and the EMQX webhook (posting from
// wherever EMQX Cloud is) and the dashboard (reading from the browser's
// nearest edge) almost never land on the same datacenter.
export class StateStore {
  constructor(ctx) {
    this.ctx = ctx;
    this.current = null;
  }

  async fetch(request) {
    if (this.current === null) {
      this.current = (await this.ctx.storage.get("state")) || DEFAULT_STATE;
    }
    if (request.method === "POST") {
      this.current = await request.text();
      await this.ctx.storage.put("state", this.current);
    }
    return new Response(this.current, { headers: { "content-type": "application/json" } });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/command" && request.method === "POST") {
      if (request.headers.get("x-pin") !== env.DASHBOARD_PIN) {
        return new Response("Unauthorized", { status: 401 });
      }
      const body = await request.json();
      const allowed = new Set([
        "red", "green", "blue", "white", "random", "off", "set",
        "servo", "servo_sweep", "servo_strike", "sound", "song", "display_text",
      ]);
      if (!allowed.has(body.command)) return new Response("Bad command", { status: 400 });
      if (body.command === "set") {
        if (!Number.isInteger(body.r) || body.r < 0 || body.r > 255 ||
            !Number.isInteger(body.g) || body.g < 0 || body.g > 255 ||
            !Number.isInteger(body.b) || body.b < 0 || body.b > 255 ||
            !Number.isInteger(body.led) || body.led < -1 || body.led > 2 ||
            !Number.isInteger(body.duration) || body.duration < 0 || body.duration > 600) {
          return new Response("Bad LED settings", { status: 400 });
        }
      }
      if (body.command === "servo" &&
          (!Number.isInteger(body.angle) || body.angle < 0 || body.angle > 180)) {
        return new Response("Bad servo angle", { status: 400 });
      }
      if (body.command === "servo_sweep" &&
          (!Number.isInteger(body.from) || body.from < 0 || body.from > 180 ||
           !Number.isInteger(body.to) || body.to < 0 || body.to > 180 ||
           !Number.isInteger(body.step) || body.step < 1 || body.step > 90 ||
           !Number.isInteger(body.interval) || body.interval < 50 || body.interval > 10000 ||
           !Number.isInteger(body.passes) || body.passes < -1 || body.passes > 20)) {
        return new Response("Bad sweep settings", { status: 400 });
      }
      if (body.command === "servo_strike" &&
          (!Number.isInteger(body.low) || body.low < 0 || body.low > 180 ||
           !Number.isInteger(body.high) || body.high < 0 || body.high > 180 ||
           !Number.isInteger(body.interval) || body.interval < 50 || body.interval > 5000 ||
           !Number.isInteger(body.times) || body.times < 1 || body.times > 100)) {
        return new Response("Bad strike settings", { status: 400 });
      }
      if (body.command === "sound" &&
          (!Number.isInteger(body.frequency) || body.frequency < 100 || body.frequency > 5000 ||
           !Number.isInteger(body.duration) || body.duration < 50 || body.duration > 10000)) {
        return new Response("Bad sound settings", { status: 400 });
      }
      if (body.command === "song") {
        const songs = new Set(["perfect", "twinkle", "birthday", "fur_elise", "mario"]);
        if (!songs.has(body.name)) return new Response("Bad song name", { status: 400 });
      }
      if (body.command === "display_text") {
        const aligns = new Set(["left", "center", "right"]);
        if (typeof body.text !== "string" || body.text.length > 200 || !aligns.has(body.align)) {
          return new Response("Bad display settings", { status: 400 });
        }
      }

      // Retained so a rebooting/reconnecting ESP32 gets the last command the
      // moment it subscribes, without the Worker needing to track device state.
      await publishToEmqx(env, env.EMQX_COMMAND_TOPIC, { ...body, id: Date.now() % 1000000000 },
        { qos: 1, retain: true });
      return Response.json({ ok: true });
    }

    // Live state is published by the board to EMQX roughly every 700ms; an
    // EMQX Rule Engine webhook forwards each message here.
    if (url.pathname === "/api/state/mqtt" && request.method === "POST") {
      if (request.headers.get("x-webhook-token") !== env.EMQX_WEBHOOK_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }
      // EMQX's connector "test connection" probe sends a request with no
      // (or non-JSON) body, just to check reachability/auth — treat that as
      // a harmless no-op rather than letting the JSON parse throw a 500.
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ ok: true });
      }
      // Stamp with the Worker's own clock, not the device's — the ESP32 has
      // no synced RTC, so this is the only reliable "last heard from" time.
      const payload = JSON.stringify({ ...body, updatedAt: Date.now() });
      const store = env.STATE.get(env.STATE.idFromName("global"));
      await store.fetch("https://state/", { method: "POST", body: payload });
      return Response.json({ ok: true });
    }

    // Unauthenticated by design: this is read-only telemetry (LED colors,
    // servo angle, sound/song), not a control surface — the PIN guards
    // /api/command instead, so anyone can watch the live view but nobody can
    // act on it without the PIN.
    if (url.pathname === "/api/state" && request.method === "GET") {
      // A short per-datacenter cache in front of the Durable Object. This
      // isn't a correctness fix like the DO itself (staleness here is
      // bounded to ~1s, fine for a dashboard already polling every 1.5s) —
      // it exists purely to absorb repeat/concurrent polls from the same
      // edge, since the DO's free-tier request volume is limited.
      const cacheKey = new Request("https://state.internal/api/state");
      const cached = await caches.default.match(cacheKey);
      if (cached) return cached;

      const store = env.STATE.get(env.STATE.idFromName("global"));
      const stateRes = await store.fetch("https://state/");
      const body = await stateRes.text();
      const response = new Response(body, {
        headers: { "content-type": "application/json", "cache-control": "public, max-age=1" },
      });
      await caches.default.put(cacheKey, response.clone());
      return response;
    }

    // The static-assets binding only serves GET/HEAD; anything else that
    // didn't match a route above (e.g. a misconfigured webhook URL) would
    // otherwise throw instead of returning a clean 404.
    if (request.method === "GET" || request.method === "HEAD") {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
