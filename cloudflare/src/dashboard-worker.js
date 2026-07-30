const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32 Control</title><style>
:root { color-scheme: dark; font-family: system-ui,sans-serif; background:#101827; color:#fff; }
body { margin:0; padding:28px; } .panel { max-width:520px; margin:0 auto; } .eyebrow { color:#93c5fd; text-transform:uppercase; letter-spacing:.12em; font-size:.8rem; }
h1 { margin:0 0 8px; } h2 { margin:0; font-size:1.05rem; } #status { min-height:1.5em; color:#bfdbfe; }
.settings { display:grid; gap:14px; padding:16px; margin:18px 0; border-radius:14px; background:#1f2937; }
label { display:grid; gap:7px; font-weight:600; } select,input { width:100%; box-sizing:border-box; } select { padding:10px; border-radius:8px; font:inherit; }
small { color:#cbd5e1; font-weight:400; } .commands { display:grid; gap:10px; }
button { padding:18px; border:0; border-radius:14px; color:#fff; background:#2563eb; font:inherit; font-size:1.1rem; cursor:pointer; } button:active { transform:scale(.98); }
.red { background:#dc2626; } .green { background:#16a34a; } .blue { background:#2563eb; } .white { background:#e5e7eb; color:#111827; } .off { background:#374151; }
</style></head><body><main class="panel">
<p class="eyebrow">Remote control</p><h1>ESP32 Control</h1><p id="status" role="status">Ready</p>
<section class="settings" aria-label="LED settings"><label>LED<select id="led"><option value="-1">All three LEDs</option><option value="0">LED 1</option><option value="1">LED 2</option><option value="2">LED 3</option></select></label><label>Lighting duration: <output id="duration-value">5 seconds</output><input id="duration" type="range" min="0" max="60" value="5"><small>0 means stay on</small></label></section>
<section class="commands" aria-label="LED commands"><button data-color="red" class="red">Red</button><button data-color="green" class="green">Green</button><button data-color="blue" class="blue">Blue</button><button data-color="white" class="white">White</button><button data-command="random">Random colors</button><button data-command="off" class="off">Turn off</button></section>
<section class="settings" aria-label="Servo control"><h2>Servo</h2><label>Angle: <output id="servo-angle-value">90°</output><input id="servo-angle" type="range" min="0" max="180" value="90"></label><button id="servo-send">Move servo</button><small>Connect the signal wire to CN3 / GPIO 7. Use separate 5 V power for a larger servo, with common ground.</small></section>
<section class="settings" aria-label="Sounder control"><h2>Sounder</h2><label>Frequency: <output id="sound-frequency-value">1000 Hz</output><input id="sound-frequency" type="range" min="100" max="5000" step="50" value="1000"></label><label>Length: <output id="sound-duration-value">250 ms</output><input id="sound-duration" type="range" min="50" max="2000" step="50" value="250"></label><button id="sound-send">Play sound</button></section>
</main><script>
let pin=sessionStorage.pin||""; const status=document.querySelector("#status"), led=document.querySelector("#led"), duration=document.querySelector("#duration"), servoAngle=document.querySelector("#servo-angle"), soundFrequency=document.querySelector("#sound-frequency"), soundDuration=document.querySelector("#sound-duration");
duration.addEventListener("input",()=>document.querySelector("#duration-value").textContent=duration.value==="0"?"Stay on":duration.value+" seconds");
servoAngle.addEventListener("input",()=>document.querySelector("#servo-angle-value").textContent=servoAngle.value+"°"); soundFrequency.addEventListener("input",()=>document.querySelector("#sound-frequency-value").textContent=soundFrequency.value+" Hz"); soundDuration.addEventListener("input",()=>document.querySelector("#sound-duration-value").textContent=soundDuration.value+" ms");
async function send(command,settings={}) { if(!pin){pin=prompt("Enter your 6-digit PIN");if(!pin)return;sessionStorage.pin=pin;} status.textContent="Sending…";const response=await fetch("/api/command",{method:"POST",headers:{"content-type":"application/json","x-pin":pin},body:JSON.stringify({command,...settings})});if(response.ok)status.textContent="Sent: "+command;else{sessionStorage.removeItem("pin");pin="";status.textContent="Incorrect PIN";} }
document.querySelectorAll("[data-command]").forEach(button=>button.addEventListener("click",()=>send(button.dataset.command))); document.querySelectorAll("[data-color]").forEach(button=>button.addEventListener("click",()=>send("set",{color:button.dataset.color,led:Number(led.value),duration:Number(duration.value)}))); document.querySelector("#servo-send").addEventListener("click",()=>send("servo",{angle:Number(servoAngle.value)})); document.querySelector("#sound-send").addEventListener("click",()=>send("sound",{frequency:Number(soundFrequency.value),duration:Number(soundDuration.value)}));
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/poll") {
      if (request.headers.get("x-device-token") !== env.DEVICE_TOKEN) return new Response("Unauthorized", { status: 401 });
      return new Response((await env.COMMANDS.get("command")) || '{"command":"off"}', { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    if (url.pathname === "/api/command" && request.method === "POST") {
      if (request.headers.get("x-pin") !== env.DASHBOARD_PIN) return new Response("Unauthorized", { status: 401 });
      const body = await request.json();
      const allowed = new Set(["red", "green", "blue", "white", "random", "off", "set", "servo", "sound"]);
      if (!allowed.has(body.command)) return new Response("Bad command", { status: 400 });
      if (body.command === "set") {
        const colors = new Set(["red", "green", "blue", "white", "off"]);
        if (!colors.has(body.color) || !Number.isInteger(body.led) || body.led < -1 || body.led > 2 || !Number.isInteger(body.duration) || body.duration < 0 || body.duration > 600) return new Response("Bad LED settings", { status: 400 });
      }
      if (body.command === "servo" && (!Number.isInteger(body.angle) || body.angle < 0 || body.angle > 180)) return new Response("Bad servo angle", { status: 400 });
      if (body.command === "sound" && (!Number.isInteger(body.frequency) || body.frequency < 100 || body.frequency > 5000 || !Number.isInteger(body.duration) || body.duration < 50 || body.duration > 10000)) return new Response("Bad sound settings", { status: 400 });
      await env.COMMANDS.put("command", JSON.stringify({ ...body, id: Date.now() % 1000000000 }));
      return Response.json({ ok: true });
    }
    if (url.pathname === "/") return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    return new Response("Not found", { status: 404 });
  },
};
