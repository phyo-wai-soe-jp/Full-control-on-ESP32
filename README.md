# Full Control on ESP

Remote control and live environment monitoring for a **MicroFan ESP32-C3M-TRY (4 MB)** board. A web dashboard sends commands through a Cloudflare Worker to an **EMQX Cloud MQTT broker**; the ESP32 stays subscribed over MQTT and reacts instantly, while continuously publishing its own state (LEDs, servo, sound, sensors) back for the dashboard to display live.

The board only needs USB for power after the firmware has been uploaded. The dashboard can be opened on a phone or computer from anywhere with Internet access — no router port forwarding required.

## What this project does

- Connects the ESP32-C3M-TRY to a 2.4 GHz Wi-Fi network and to an EMQX Cloud MQTT broker over TLS.
- Full-spectrum LED control via a color wheel + brightness slider (not just fixed colors), applied to all three NeoPixels or one at a time, with optional timed auto-off.
- "Random colors" mode and an instant "Turn off" for all LEDs.
- Servo control: direct angle (0–180°), a back-and-forth sweep pattern, and a hammer-style strike pattern.
- Plays a custom tone or one of five built-in songs (with LEDs synced to the melody) through the piezo sounder.
- Onboard SSD1306 OLED display shows live temperature/humidity (AHT21) and ambient brightness (phototransistor), independent of Wi-Fi/MQTT status.
- The web dashboard mirrors the board's live state (LED colors, servo angle, sound/song, sensor readings) in real time, without needing the PIN — only sending commands requires the PIN.
- Bilingual dashboard UI (English / Japanese, toggle in the top bar).
- No router port forwarding, no public inbound ports on the ESP32 — it only makes outbound connections.

## Hardware

| Board part | ESP32-C3 GPIO | Notes |
| --- | ---: | --- |
| Three WS2812 RGB LEDs (LED10–LED12) | 10 | One data pin drives all three LEDs as a chain. |
| Piezo speaker (SOUNDER) | 21 | Driven via PWM/`ledcWriteTone`; held silent unless a sound/song command is active. |
| Servo connector CN3 | 7 | Servo signal pin; CN3 also provides 5 V and GND. |
| OLED display + I2C bus | SDA 8 / SCL 9 | Shared I2C bus with the AHT21 temp/humidity sensor; SSD1306, 128×64, address `0x3C`. |
| Phototransistor (brightness) | 1 | Read via ADC (`analogRead`), normalized to 0–1. |
| Built-in monochrome LED (LED1) | 0 | Not currently used by the firmware. |
| SW1 / SW2 / SW3 | 2 / 3 / 6 | Active-low buttons; not currently read by the firmware. |
| SW4 / BOOT | 9 | Shared with I2C SCL — do not repurpose as a general input while I2C is in use. |

## Project layout

```text
full control on ESP/
├── README.md                 This guide (English)
├── README.ja.md              Japanese version of this guide
├── platformio.ini            PlatformIO board/build/upload settings
├── src/
│   └── main.cpp              ESP32 Arduino firmware (Wi-Fi, MQTT, LEDs, servo, sound, OLED, sensors)
└── cloudflare/
    ├── wrangler.toml         Cloudflare Worker configuration (vars, Durable Object binding)
    ├── src/worker.js         Command relay + live-state API (Worker + Durable Object)
    └── web/                  Phone/computer dashboard
        ├── index.html
        ├── app.js
        └── style.css
```

## How it works

**Commands (dashboard → board):**

```text
Dashboard  ──POST /api/command (PIN required)──▶  Cloudflare Worker
                                                        │  validates + publishes (retained, QoS 1)
                                                        ▼
                                              EMQX Cloud MQTT broker
                                                        │  topic: esp32/command
                                                        ▼
                                        ESP32-C3M-TRY (subscribed over MQTT)
```

Because the ESP32 keeps a live MQTT session open, commands are applied within milliseconds — there is no polling delay. The "retained" flag means a rebooting/reconnecting board immediately receives the last command sent.

**Live state (board → dashboard):**

```text
ESP32-C3M-TRY  ──publishes every ~250ms──▶  EMQX Cloud (topic: esp32/state)
                                                   │  Rule Engine → Webhook
                                                   ▼
                                     Cloudflare Worker → Durable Object
                                                   │  GET /api/state (no PIN needed)
                                                   ▼
                                              Dashboard (polls every ~400ms)
```

The Durable Object exists because Cloudflare's plain edge cache is per-datacenter — without it, state published from EMQX Cloud's servers and read from a browser's nearest edge could land in different, unsynchronized caches. The Durable Object gives every request a single consistent source of truth.

Live state is intentionally readable without the PIN (it's just telemetry — LED colors, servo angle, sound/song, sensor readings). The PIN only guards `/api/command`, so viewing the dashboard never requires unlocking anything, but nothing can be controlled without it.

## Open the dashboard

Open the deployed Worker URL in any browser. The live simulation bar and sensor bar populate immediately — no PIN needed to just watch. Tap any control and you'll be asked for the six-digit dashboard PIN once per browser tab/session.

The dashboard provides:

- **Lights tab:** LED target (all / LED 1 / LED 2 / LED 3), a color wheel + vertical brightness slider for full-spectrum color, a duration slider for timed auto-off, "Random colors", and "Turn off".
- **Servo tab:** direct angle control (0–180°) via a dial, a Sweep pattern (from/to angle, step size, speed, pass count), and a Strike pattern (low/high angle, speed, times).
- **Sound tab:** a frequency/duration tone generator with quick presets (Beep, Alert, Chime).
- **Songs tab:** five short buzzer melodies with LEDs synced to the tune (Perfect, Twinkle Twinkle Little Star, Happy Birthday, Für Elise, Super Mario Bros theme).
- **Live simulation bar:** mirrors the board's actual LED colors, servo angle, and sound/song activity in real time; shows an "Offline" badge if the board hasn't reported in the last 1.5 seconds.
- **Sensor bar:** live temperature, humidity, and brightness readings, with the same offline indicator.
- **Language toggle:** switches the whole UI between English and Japanese.

### Servo wiring

Connect the servo to **CN3**: signal is GPIO 7, with 5 V and GND beside it. Small servos may work from the board's USB power, but larger servos need their own regulated 5 V supply — always connect the external supply ground to the ESP32 ground.

## Firmware configuration

In `src/main.cpp`, set these to match your network and EMQX Cloud deployment:

```cpp
const char *wifiName = "YOUR_WIFI_NAME";
const char *wifiPassword = "YOUR_WIFI_PASSWORD";

const char *mqttHost = "YOUR_DEPLOYMENT.ala.REGION.emqxsl.com";
const char *mqttUser = "YOUR_MQTT_USERNAME";
const char *mqttPassword = "YOUR_MQTT_PASSWORD";
```

ESP32-C3 supports 2.4 GHz Wi-Fi only. For a phone hotspot, enable its 2.4 GHz / compatibility mode if the phone offers that option.

### Status LED colors

| LED color | Meaning |
| --- | --- |
| Blue | Connecting to Wi-Fi. |
| Purple | Wi-Fi connection failed. Check network name, password, and 2.4 GHz compatibility. |
| Yellow | Wi-Fi is up but the MQTT broker is unreachable. |
| Requested color / off | Everything is connected; the board is showing the last command it received. |

## Build and upload with VS Code

1. Open the **full control on ESP** folder in VS Code with the PlatformIO extension.
2. Plug the board in with USB-C.
3. In PlatformIO, select the environment `esp32-c3-devkitm-1`.
4. Choose **Upload** (this also pulls in the required libraries automatically).
5. After upload completes, the board restarts, connects to Wi-Fi, and connects to the MQTT broker.

Libraries used (declared in `platformio.ini`, installed automatically by PlatformIO):

- `adafruit/Adafruit NeoPixel` — the three onboard WS2812 LEDs
- `madhephaestus/ESP32Servo` — servo control
- `knolleary/PubSubClient` — MQTT client
- `adafruit/Adafruit SSD1306` + `adafruit/Adafruit GFX Library` — OLED display
- `adafruit/Adafruit AHTX0` — AHT21 temperature/humidity sensor

If the serial port changes, update or remove `upload_port` in `platformio.ini`, then pick the detected USB port.

### Serial Monitor

Use 115200 baud. The firmware prints Wi-Fi connection status, the local IP address, and MQTT connect/disconnect messages.

## Cloudflare Worker + EMQX Cloud setup

### 1. EMQX Cloud deployment

1. Create a Serverless deployment on [EMQX Cloud](https://www.emqx.com/en/cloud). Note its MQTT host and TLS port (`8883`).
2. Under **アクセス制御 (Access Control) → 認証 (Authentication)**, create an MQTT username/password for the ESP32.
3. Under the deployment overview, generate a **deployment API key** (App ID + App Secret) — this is what the Worker uses to publish commands via the HTTP API.
4. Under **データ統合 (Data Integration)**, create an **HTTP サービス (HTTP Service)** connector pointing at your Worker's `/api/state/mqtt` endpoint (with TLS enabled, and a custom header carrying a shared secret token), then a rule with SQL `SELECT payload FROM "esp32/state"` and an action using that connector with body template `${payload}`. This forwards every state message the board publishes to the Worker.

### 2. Cloudflare Worker

1. Create a Cloudflare Worker (`wrangler deploy` from `cloudflare/`).
2. Set `EMQX_API_BASE` and `EMQX_COMMAND_TOPIC` in `cloudflare/wrangler.toml` (`[vars]` — not secret, just configuration).
3. Set these Worker secrets (`wrangler secret put <NAME>`, never commit them):

   ```text
   EMQX_API_KEY        = EMQX Cloud deployment API key (App ID)
   EMQX_API_SECRET     = EMQX Cloud deployment API secret
   EMQX_WEBHOOK_TOKEN  = a random token you choose; must match the header configured on the EMQX webhook
   DASHBOARD_PIN       = private six-digit dashboard PIN
   ```

4. The Durable Object binding (`STATE` → `StateStore`) and its migration are already declared in `wrangler.toml`; no manual setup needed beyond deploying.
5. Deploy: `wrangler deploy` from the `cloudflare/` directory.

## Security notes

- Treat the Wi-Fi password, MQTT username/password, `EMQX_API_KEY`/`EMQX_API_SECRET`, `EMQX_WEBHOOK_TOKEN`, and `DASHBOARD_PIN` as private credentials.
- Do not post them in screenshots, chat messages, or a public repository.
- The firmware contains local Wi-Fi and MQTT credentials for this working setup — replace them with placeholders before sharing the project.
- `/api/state` (live LED/servo/sound/sensor telemetry) is intentionally readable without the PIN; only `/api/command` (anything that controls the board) requires it.
- Rotate the EMQX API key/MQTT password if either is ever exposed (e.g. pasted somewhere it shouldn't be).
- Never expose the ESP32 directly with router port forwarding — it only makes outbound connections to Wi-Fi and the MQTT broker, which is the safer design.

## Troubleshooting

### The LEDs stay blue

The board is trying to connect to Wi-Fi. Confirm the network is on, is 2.4 GHz, and the name/password in `main.cpp` are correct. Press **RST** once after updating Wi-Fi settings.

### The LEDs become purple

Wi-Fi failed. Recheck the Wi-Fi settings and phone-hotspot compatibility mode.

### The LEDs become yellow

Wi-Fi is up but the board can't reach the MQTT broker. Check the `mqttHost`/`mqttUser`/`mqttPassword` values, that the EMQX deployment is running, and that the MQTT credential hasn't been disabled or changed in the EMQX console.

### The dashboard shows "Offline" even though the board is connected

Check the EMQX Rule Engine webhook (データ統合) — if its URL is misconfigured or the shared token doesn't match `EMQX_WEBHOOK_TOKEN`, state messages never reach the Worker's Durable Object, so the dashboard has nothing fresh to show even though the device itself is online.

### The buzzer makes noise unexpectedly

The piezo speaker is on GPIO 21, driven via a dedicated PWM channel that only activates during a `sound`/`song` command. If it's buzzing outside of that, check for other code writing to GPIO 21 or its PWM channel.

## Main firmware behavior

- State is published to MQTT roughly every 250 ms; the OLED sensor readout refreshes every 1 second (AHT21 sampling doesn't need to be faster than that).
- Each command carries an ID so the board doesn't reapply the same (possibly retained) command twice.
- Timed lighting and servo patterns use `millis()` and never block the MQTT/Wi-Fi loop.
- Random mode runs independently, changing one LED every 500 ms.
- The board starts with all LEDs off.

## References

- [MicroFan ESP32-C3M-TRY documentation](https://www.microfan.jp/document/ESP32-C3M-TRY-R1-20230701.pdf)
- [MicroFan ESP32-C3M-TRY MicroPython guide](https://www.microfan.jp/2023/08/esp32-c3m-try-micropython/)
- [EMQX Cloud documentation](https://docs.emqx.com/en/cloud/latest/)
