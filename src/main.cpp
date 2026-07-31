#include <Arduino.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_GFX.h>
#include <Adafruit_NeoPixel.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

constexpr int neoPixelPin = 10;
constexpr int ledCount = 3;
constexpr int buzzerPin = 21;
constexpr int servoPin = 7;
// ESP32Servo takes its PWM channel automatically. Keep the piezo sounder on
// a different channel so it stays silent unless a sound command is received.
constexpr int buzzerChannel = 5;
Adafruit_NeoPixel leds(ledCount, neoPixelPin, NEO_GRB + NEO_KHZ800);
Servo servo;

// Onboard I2C bus (shared with the AHT21 temp/humidity sensor) per the
// ESP32-C3M-TRY board manual.
constexpr int i2cSdaPin = 8;
constexpr int i2cSclPin = 9;
constexpr int oledWidth = 128;
constexpr int oledHeight = 64;
constexpr uint8_t oledAddress = 0x3C;
constexpr int brightnessPin = 1;  // phototransistor, analog

Adafruit_SSD1306 display(oledWidth, oledHeight, &Wire, -1);
Adafruit_AHTX0 aht;
bool ahtReady = false;
unsigned long lastSensorDisplay = 0;
// Cached from the OLED's own 1s sensor refresh, so reportState() (called far
// more often) doesn't re-trigger an AHT21 read every time.
float lastTemp = 0;
float lastHum = 0;
float lastLight = 0;

// Custom text overrides the sensor readout on the OLED while active — set by
// the Display tab's "display_text" command, cleared by sending empty text.
bool noteActive = false;
String noteText = "";
String noteAlign = "left";

// Packs an LED color the same way Adafruit_NeoPixel::Color() does, usable
// in constexpr song tables built before the `leds` object is set up.
#define RGB(r, g, b) (((uint32_t)(r) << 16) | ((uint32_t)(g) << 8) | (uint32_t)(b))
#define REST 0

#define NOTE_C4 262
#define NOTE_D4 294
#define NOTE_DS4 311
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_G4 392
#define NOTE_A4 440
#define NOTE_AS4 466
#define NOTE_B4 494
#define NOTE_C5 523
#define NOTE_D5 587
#define NOTE_DS5 622
#define NOTE_E5 659
#define NOTE_G5 784

struct Note {
  uint16_t frequency;  // 0 = rest (LEDs still step, buzzer stays silent)
  uint16_t durationMs;
  uint32_t color;
};

// Each song is a short, simplified melody motif (not a full transcription)
// paired with LED colors chosen to match its mood, played back note-by-note.
const Note songPerfect[] = {
    {NOTE_G4, 400, RGB(255, 180, 40)}, {NOTE_B4, 400, RGB(255, 60, 20)},
    {NOTE_D5, 400, RGB(255, 50, 120)}, {NOTE_B4, 400, RGB(255, 60, 20)},
    {NOTE_G4, 400, RGB(255, 180, 40)}, {NOTE_A4, 400, RGB(255, 120, 20)},
    {NOTE_B4, 500, RGB(255, 50, 120)}, {NOTE_G4, 600, RGB(255, 180, 40)},
};

const Note songTwinkle[] = {
    {NOTE_C4, 300, RGB(255, 255, 255)}, {NOTE_C4, 300, RGB(255, 255, 255)},
    {NOTE_G4, 300, RGB(80, 140, 255)},  {NOTE_G4, 300, RGB(80, 140, 255)},
    {NOTE_A4, 300, RGB(255, 255, 255)}, {NOTE_A4, 300, RGB(255, 255, 255)},
    {NOTE_G4, 500, RGB(80, 140, 255)},  {REST, 200, 0},
    {NOTE_F4, 300, RGB(255, 255, 255)}, {NOTE_F4, 300, RGB(255, 255, 255)},
    {NOTE_E4, 300, RGB(80, 140, 255)},  {NOTE_E4, 300, RGB(80, 140, 255)},
    {NOTE_D4, 300, RGB(255, 255, 255)}, {NOTE_D4, 300, RGB(255, 255, 255)},
    {NOTE_C4, 600, RGB(80, 140, 255)},
};

const Note songBirthday[] = {
    {NOTE_C4, 250, RGB(255, 0, 0)},   {NOTE_C4, 250, RGB(255, 120, 0)},
    {NOTE_D4, 500, RGB(255, 255, 0)}, {NOTE_C4, 500, RGB(0, 200, 0)},
    {NOTE_F4, 500, RGB(0, 120, 255)}, {NOTE_E4, 800, RGB(160, 0, 220)},
    {REST, 200, 0},
    {NOTE_C4, 250, RGB(255, 0, 0)},   {NOTE_C4, 250, RGB(255, 120, 0)},
    {NOTE_D4, 500, RGB(255, 255, 0)}, {NOTE_C4, 500, RGB(0, 200, 0)},
    {NOTE_G4, 500, RGB(0, 120, 255)}, {NOTE_F4, 800, RGB(160, 0, 220)},
};

const Note songFurElise[] = {
    {NOTE_E5, 250, RGB(150, 0, 220)},  {NOTE_DS5, 250, RGB(190, 120, 255)},
    {NOTE_E5, 250, RGB(150, 0, 220)},  {NOTE_DS5, 250, RGB(190, 120, 255)},
    {NOTE_E5, 250, RGB(150, 0, 220)},  {NOTE_B4, 250, RGB(255, 255, 255)},
    {NOTE_D5, 250, RGB(190, 120, 255)}, {NOTE_C5, 250, RGB(150, 0, 220)},
    {NOTE_A4, 600, RGB(255, 255, 255)},
};

const Note songMario[] = {
    {NOTE_E5, 150, RGB(220, 0, 0)}, {NOTE_E5, 150, RGB(220, 0, 0)},
    {REST, 150, 0},                 {NOTE_E5, 150, RGB(220, 0, 0)},
    {REST, 150, 0},                 {NOTE_C5, 150, RGB(0, 80, 220)},
    {NOTE_E5, 150, RGB(220, 0, 0)}, {REST, 150, 0},
    {NOTE_G5, 300, RGB(255, 200, 0)}, {REST, 300, 0},
    {NOTE_AS4, 300, RGB(0, 180, 0)},
};

struct Song {
  const char *name;
  const Note *notes;
  int length;
};

const Song songs[] = {
    {"perfect", songPerfect, sizeof(songPerfect) / sizeof(Note)},
    {"twinkle", songTwinkle, sizeof(songTwinkle) / sizeof(Note)},
    {"birthday", songBirthday, sizeof(songBirthday) / sizeof(Note)},
    {"fur_elise", songFurElise, sizeof(songFurElise) / sizeof(Note)},
    {"mario", songMario, sizeof(songMario) / sizeof(Note)},
};
const int songCount = sizeof(songs) / sizeof(Song);

const char *wifiName = "BFW6K-G-ED910";
const char *wifiPassword = "ibpi4f2h5scf";

const char *mqttHost = "c89d81bf.ala.asia-southeast1.emqxsl.com";
const int mqttPort = 8883;
const char *mqttClientId = "esp32-device";
const char *mqttUser = "esp32-device";
const char *mqttPassword = "phyo1500";
const char *commandTopic = "esp32/command";
const char *stateTopic = "esp32/state";

WiFiClientSecure mqttSecureClient;
PubSubClient mqttClient(mqttSecureClient);
unsigned long lastMqttAttempt = 0;
unsigned long lastStateReport = 0;
int lastConnStatus = -1;  // -1 = unset, 0 = Wi-Fi down, 1 = broker down, 2 = connected
int currentServoAngle = 90;
const char *activeSongName = nullptr;

String currentCommand = "off";
unsigned long lastRandom = 0;
unsigned long lightUntil = 0;
unsigned long soundUntil = 0;
int timedLed = -2;
unsigned long lastCommandId = 0;
bool servoAttached = false;
bool sounderAttached = false;

const Note *activeSong = nullptr;
int activeSongLength = 0;
int songIndex = 0;
unsigned long songNextStepAt = 0;

struct ServoPattern {
  bool active = false;
  String type;              // "sweep" or "strike"
  int current = 0;          // sweep: absolute angle (0..180)
  int from = 0;
  int to = 0;
  int stepSize = 0;
  int lowAngle = 0;         // strike: absolute angle (0..180)
  int highAngle = 0;
  bool strikeHigh = true;
  int stepsLeft = 0;        // sweep: passes left (-1 = infinite); strike: half-moves left
  unsigned long intervalMs = 0;
  unsigned long nextStepAt = 0;
} servoPattern;

void showColor(uint32_t color) {
  for (int i = 0; i < ledCount; i++) leds.setPixelColor(i, color);
  leds.show();
}

void stopSound() {
  if (!sounderAttached) return;
  ledcWriteTone(buzzerChannel, 0);
  digitalWrite(buzzerPin, LOW);
  soundUntil = 0;
}

void playSound(int frequency, int durationMs) {
  if (!sounderAttached) {
    ledcSetup(buzzerChannel, 1000, 10);
    ledcAttachPin(buzzerPin, buzzerChannel);
    sounderAttached = true;
  }
  ledcWriteTone(buzzerChannel, frequency);
  soundUntil = millis() + durationMs;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.println("Connecting to Wi-Fi...");
  showColor(leds.Color(0, 0, 255));  // Blue: connecting to Wi-Fi
  WiFi.begin(wifiName, wifiPassword);
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 15000) delay(250);
  if (WiFi.status() == WL_CONNECTED) {
    WiFi.setSleep(false);  // disable modem sleep so the MQTT session stays responsive
    Serial.print("Wi-Fi connected: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi connection failed");
    showColor(leds.Color(180, 0, 180));  // Purple: Wi-Fi failed
  }
}

void applyRemoteCommand(const String &body);  // defined below; needed by the MQTT callback

// Invoked by PubSubClient whenever a message arrives on a subscribed topic.
// Commands now arrive pushed from the broker instead of being polled for.
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String body;
  body.reserve(length);
  for (unsigned int i = 0; i < length; i++) body += (char)payload[i];
  applyRemoteCommand(body);
}

void connectMqtt() {
  if (mqttClient.connected()) return;
  Serial.println("Connecting to MQTT broker...");
  if (mqttClient.connect(mqttClientId, mqttUser, mqttPassword)) {
    Serial.println("MQTT connected");
    // QoS 1 + the Worker publishing commands with retain=true means a
    // reconnecting device gets the last command immediately on subscribe.
    mqttClient.subscribe(commandTopic, 1);
  } else {
    Serial.print("MQTT connect failed, rc=");
    Serial.println(mqttClient.state());
  }
}

// Reports the board's actual current state (LED colors, servo angle, what
// is playing) so the control page can show a live status view instead of
// just guessing from the last command it sent. Checked on a fast timer but
// only actually published when something changed, plus a periodic heartbeat
// even when nothing has — the Cloudflare Durable Object behind this has a
// limited free-tier request volume, and publishing unconditionally on every
// tick (even while completely idle) blew through it. The heartbeat still
// has to happen, though, or an idle-but-connected board would look offline
// to the dashboard once its last report ages past OFFLINE_AFTER_MS there.
String lastReportedPayload;
unsigned long lastReportPublishAt = 0;
constexpr unsigned long reportHeartbeatMs = 5000;

// Escapes a String for embedding as a JSON string value — the counterpart to
// jsonString()'s decoding below, needed because noteText is free-form (may
// contain quotes/backslashes/newlines) unlike the other fields reported here.
String jsonEscape(const String &value) {
  String result;
  result.reserve(value.length());
  for (unsigned int i = 0; i < value.length(); i++) {
    char c = value[i];
    if (c == '"' || c == '\\') { result += '\\'; result += c; }
    else if (c == '\n') result += "\\n";
    else if (c == '\r') result += "\\r";
    else if (c == '\t') result += "\\t";
    else if ((uint8_t)c < 0x20) continue;  // drop other control chars
    else result += c;
  }
  return result;
}

void reportState() {
  if (!mqttClient.connected()) return;

  String payload = "{";
  payload += "\"led0\":" + String((unsigned long)leds.getPixelColor(0)) + ",";
  payload += "\"led1\":" + String((unsigned long)leds.getPixelColor(1)) + ",";
  payload += "\"led2\":" + String((unsigned long)leds.getPixelColor(2)) + ",";
  payload += "\"servoAngle\":" + String(currentServoAngle) + ",";
  payload += "\"sound\":" + String(soundUntil != 0 ? "true" : "false") + ",";
  payload += "\"song\":" + (activeSongName ? ("\"" + String(activeSongName) + "\"") : String("null")) + ",";
  payload += "\"temp\":" + (ahtReady ? String(lastTemp, 1) : String("null")) + ",";
  payload += "\"hum\":" + (ahtReady ? String(lastHum, 1) : String("null")) + ",";
  payload += "\"light\":" + String(lastLight, 3) + ",";
  payload += "\"note\":" + (noteActive ? ("\"" + jsonEscape(noteText) + "\"") : String("null")) + ",";
  payload += "\"noteAlign\":\"" + noteAlign + "\"";
  payload += "}";

  bool changed = payload != lastReportedPayload;
  bool heartbeatDue = millis() - lastReportPublishAt > reportHeartbeatMs;
  if (!changed && !heartbeatDue) return;

  lastReportedPayload = payload;
  lastReportPublishAt = millis();
  mqttClient.publish(stateTopic, payload.c_str(), true);
}

// Renders noteText/noteAlign onto the OLED: splits on the user's own line
// breaks, then word-wraps each paragraph to fit the display's fixed-width
// font (6px advance, 8px line height at text size 1 => 21 cols x 8 rows),
// applying the chosen alignment per rendered line. Overflow past 8 lines is
// silently dropped rather than scrolled — this is a small status screen, not
// a full text viewer.
void renderNoteToDisplay() {
  constexpr int charWidth = 6;
  constexpr int charHeight = 8;
  constexpr int maxCols = oledWidth / charWidth;
  constexpr int maxRows = oledHeight / charHeight;

  String lines[maxRows];
  int lineCount = 0;
  int paraStart = 0;
  while (paraStart <= (int)noteText.length() && lineCount < maxRows) {
    int paraEnd = noteText.indexOf('\n', paraStart);
    if (paraEnd < 0) paraEnd = noteText.length();
    String paragraph = noteText.substring(paraStart, paraEnd);

    int pos = 0;
    do {
      int take = min((int)(paragraph.length() - pos), maxCols);
      if (pos + take < (int)paragraph.length()) {
        int lastSpace = paragraph.lastIndexOf(' ', pos + take);
        if (lastSpace > pos) take = lastSpace - pos;
      }
      lines[lineCount++] = paragraph.substring(pos, pos + take);
      pos += take;
      while (pos < (int)paragraph.length() && paragraph[pos] == ' ') pos++;
    } while (pos < (int)paragraph.length() && lineCount < maxRows);

    paraStart = paraEnd + 1;
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  for (int i = 0; i < lineCount; i++) {
    int width = lines[i].length() * charWidth;
    int x = 0;
    if (noteAlign == "center") x = max(0, (oledWidth - width) / 2);
    else if (noteAlign == "right") x = max(0, oledWidth - width);
    display.setCursor(x, i * charHeight);
    display.print(lines[i]);
  }
  display.display();
}

// Shows temperature/humidity (AHT21) and ambient brightness (phototransistor)
// on the onboard OLED, turning the board into a standalone environment
// monitor independent of the Wi-Fi/dashboard/MQTT side of things. Skipped
// while a Display-tab note is active — that has taken over the screen.
void updateSensorDisplay() {
  if (noteActive) return;

  display.clearDisplay();
  display.setCursor(0, 0);

  if (ahtReady) {
    sensors_event_t humidity, temp;
    aht.getEvent(&humidity, &temp);
    lastTemp = temp.temperature;
    lastHum = humidity.relative_humidity;
    display.printf("Temp: %.1fC\n", lastTemp);
    display.printf("Hum:  %.1f%%\n", lastHum);
  } else {
    display.println("AHT21 not found");
  }

  lastLight = analogRead(brightnessPin) / 4095.0;
  display.printf("Light: %.3f\n", lastLight);
  display.display();
}

// Handles JSON escape sequences (\", \\, \n, \t, \r) so free-form text (the
// OLED note) survives round-tripping through quotes/newlines intact. Other
// callers only ever pass short identifier-like strings, so this is a
// deliberately small subset of full JSON string decoding, not a general parser.
String jsonString(const String &body, const String &name) {
  String marker = "\"" + name + "\":\"";
  int start = body.indexOf(marker);
  if (start < 0) return "";
  start += marker.length();

  String result;
  int i = start;
  while (i < body.length() && body[i] != '"') {
    if (body[i] == '\\' && i + 1 < body.length()) {
      i++;
      switch (body[i]) {
        case 'n': result += '\n'; break;
        case 't': result += '\t'; break;
        case 'r': result += '\r'; break;
        default: result += body[i]; break;  // \" \\ \/ etc. collapse to the literal char
      }
    } else {
      result += body[i];
    }
    i++;
  }
  return result;
}

long jsonNumber(const String &body, const String &name, long fallback = 0) {
  String marker = "\"" + name + "\":";
  int start = body.indexOf(marker);
  if (start < 0) return fallback;
  start += marker.length();
  int end = start;
  while (end < body.length() && (body[end] == '-' || isDigit(body[end]))) end++;
  return body.substring(start, end).toInt();
}

void ensureServoAttached() {
  if (servoAttached) return;
  servo.setPeriodHertz(50);
  servo.attach(servoPin, 500, 2400);
  servoAttached = true;
}

void startSong(const char *name) {
  for (int i = 0; i < songCount; i++) {
    if (strcmp(songs[i].name, name) != 0) continue;
    activeSong = songs[i].notes;
    activeSongLength = songs[i].length;
    activeSongName = songs[i].name;
    songIndex = 0;
    songNextStepAt = 0;  // step immediately on the next loop()
    return;
  }
}

void stepSong() {
  if (!activeSong || millis() < songNextStepAt) return;

  if (songIndex >= activeSongLength) {
    activeSong = nullptr;
    activeSongName = nullptr;
    stopSound();
    showColor(0);
    return;
  }

  Note step = activeSong[songIndex++];
  showColor(step.color);
  if (step.frequency > 0) playSound(step.frequency, step.durationMs);
  else stopSound();
  songNextStepAt = millis() + step.durationMs;
}

// Sweeps back and forth between two absolute angles (0..180) in fixed-degree
// steps. passes: -1 = forever, 0 = stop after reaching `to` once, N = that
// many additional back-and-forth passes.
void startServoSweep(int fromAngle, int toAngle, int stepDegrees, unsigned long intervalMs, int passes) {
  ensureServoAttached();
  servoPattern.active = true;
  servoPattern.type = "sweep";
  servoPattern.current = fromAngle;
  servoPattern.from = fromAngle;
  servoPattern.to = toAngle;
  servoPattern.stepSize = max(1, stepDegrees);
  servoPattern.intervalMs = intervalMs;
  servoPattern.stepsLeft = passes;
  servoPattern.nextStepAt = 0;
  currentServoAngle = constrain(fromAngle, 0, 180);
  servo.write(currentServoAngle);
}

// Alternates between lowAngle and highAngle; each reach of highAngle counts
// as one "strike". Ends resting at lowAngle.
void startServoStrike(int lowAngle, int highAngle, unsigned long intervalMs, int times) {
  ensureServoAttached();
  servoPattern.active = true;
  servoPattern.type = "strike";
  servoPattern.lowAngle = lowAngle;
  servoPattern.highAngle = highAngle;
  servoPattern.strikeHigh = true;
  servoPattern.intervalMs = intervalMs;
  servoPattern.stepsLeft = times * 2;
  servoPattern.nextStepAt = 0;
  currentServoAngle = lowAngle;
  servo.write(currentServoAngle);
}

void stepServoPattern() {
  if (!servoPattern.active || millis() < servoPattern.nextStepAt) return;
  servoPattern.nextStepAt = millis() + servoPattern.intervalMs;

  if (servoPattern.type == "sweep") {
    bool goingUp = servoPattern.to >= servoPattern.from;
    int next = servoPattern.current + (goingUp ? servoPattern.stepSize : -servoPattern.stepSize);
    bool reachedEnd = goingUp ? next >= servoPattern.to : next <= servoPattern.to;
    servoPattern.current = reachedEnd ? servoPattern.to : next;
    currentServoAngle = constrain(servoPattern.current, 0, 180);
    servo.write(currentServoAngle);

    if (reachedEnd) {
      if (servoPattern.stepsLeft == 0) {
        servoPattern.active = false;
      } else {
        if (servoPattern.stepsLeft > 0) servoPattern.stepsLeft--;
        int swap = servoPattern.from;
        servoPattern.from = servoPattern.to;
        servoPattern.to = swap;
      }
    }
  } else if (servoPattern.type == "strike") {
    currentServoAngle = servoPattern.strikeHigh ? servoPattern.highAngle : servoPattern.lowAngle;
    servo.write(currentServoAngle);
    servoPattern.strikeHigh = !servoPattern.strikeHigh;
    if (servoPattern.stepsLeft > 0 && --servoPattern.stepsLeft == 0) servoPattern.active = false;
  }
}

void applyCommand() {
  if (currentCommand == "red") showColor(leds.Color(255, 0, 0));
  else if (currentCommand == "green") showColor(leds.Color(0, 255, 0));
  else if (currentCommand == "blue") showColor(leds.Color(0, 0, 255));
  else if (currentCommand == "white") showColor(leds.Color(255, 255, 255));
  else if (currentCommand == "off") showColor(0);
}

void applyRemoteCommand(const String &body) {
  unsigned long commandId = jsonNumber(body, "id", 0);
  if (commandId == 0 || commandId == lastCommandId) return;
  lastCommandId = commandId;

  currentCommand = jsonString(body, "command");
  lightUntil = 0;
  activeSong = nullptr;  // any new command interrupts a playing song
  activeSongName = nullptr;

  if (currentCommand == "servo") {
    servoPattern.active = false;
    ensureServoAttached();
    currentServoAngle = constrain(jsonNumber(body, "angle", 90), 0, 180);
    servo.write(currentServoAngle);
    return;
  }
  if (currentCommand == "servo_sweep") {
    startServoSweep(constrain(jsonNumber(body, "from", 180), 0, 180),
                     constrain(jsonNumber(body, "to", 0), 0, 180),
                     constrain(jsonNumber(body, "step", 6), 1, 90),
                     constrain(jsonNumber(body, "interval", 2000), 50, 10000),
                     constrain((int)jsonNumber(body, "passes", 1), -1, 20));
    return;
  }
  if (currentCommand == "servo_strike") {
    startServoStrike(constrain(jsonNumber(body, "low", 0), 0, 180),
                      constrain(jsonNumber(body, "high", 180), 0, 180),
                      constrain(jsonNumber(body, "interval", 200), 50, 5000),
                      constrain((int)jsonNumber(body, "times", 10), 1, 100));
    return;
  }
  if (currentCommand == "sound") {
    playSound(constrain(jsonNumber(body, "frequency", 1000), 100, 5000),
              constrain(jsonNumber(body, "duration", 250), 50, 10000));
    return;
  }
  if (currentCommand == "song") {
    startSong(jsonString(body, "name").c_str());
    return;
  }
  if (currentCommand == "display_text") {
    noteText = jsonString(body, "text");
    String align = jsonString(body, "align");
    noteAlign = (align == "center" || align == "right") ? align : "left";
    noteActive = noteText.length() > 0;
    if (noteActive) renderNoteToDisplay();
    else updateSensorDisplay();  // empty text means "clear" — revert immediately
    return;
  }
  if (currentCommand != "set") {
    applyCommand();
    return;
  }

  int selectedLed = jsonNumber(body, "led", -1);
  uint32_t color = leds.Color(constrain(jsonNumber(body, "r", 0), 0, 255),
                               constrain(jsonNumber(body, "g", 0), 0, 255),
                               constrain(jsonNumber(body, "b", 0), 0, 255));
  if (selectedLed < 0) showColor(color);
  else if (selectedLed < ledCount) {
    leds.setPixelColor(selectedLed, color);
    leds.show();
  }
  long durationSeconds = jsonNumber(body, "duration", 0);
  if (durationSeconds > 0) {
    timedLed = selectedLed;
    lightUntil = millis() + durationSeconds * 1000UL;
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  leds.begin();
  leds.clear();
  leds.show();
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
  randomSeed(esp_random());

  Wire.begin(i2cSdaPin, i2cSclPin);
  if (display.begin(SSD1306_SWITCHCAPVCC, oledAddress)) {
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.clearDisplay();
    display.display();
  } else {
    Serial.println("OLED init failed");
  }
  ahtReady = aht.begin(&Wire);

  connectWiFi();

  // TLS posture matches the previous HTTPS calls: no cert pinning/validation.
  mqttSecureClient.setInsecure();
  mqttClient.setServer(mqttHost, mqttPort);
  mqttClient.setBufferSize(512);  // default 256 is tight for the JSON payloads here
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  bool wifiUp = WiFi.status() == WL_CONNECTED;
  bool mqttUp = wifiUp && mqttClient.connected();
  int connStatus = !wifiUp ? 0 : (!mqttUp ? 1 : 2);
  if (connStatus != lastConnStatus) {
    lastConnStatus = connStatus;
    if (connStatus == 0) showColor(leds.Color(180, 0, 180));       // Purple: Wi-Fi failed
    else if (connStatus == 1) showColor(leds.Color(180, 120, 0));  // Yellow: broker unreachable
  }

  if (wifiUp && !mqttUp && millis() - lastMqttAttempt > 3000) {
    lastMqttAttempt = millis();
    connectMqtt();
  } else if (mqttUp) {
    mqttClient.loop();  // processes incoming messages and keep-alive pings
  }

  if (lightUntil && millis() >= lightUntil) {
    if (timedLed < 0) showColor(0);
    else if (timedLed < ledCount) {
      leds.setPixelColor(timedLed, 0);
      leds.show();
    }
    lightUntil = 0;
    timedLed = -2;
  }

  if (soundUntil && millis() >= soundUntil && !activeSong) stopSound();

  stepSong();
  stepServoPattern();

  if (currentCommand == "random" && millis() - lastRandom > 500) {
    lastRandom = millis();
    leds.clear();
    leds.setPixelColor(random(ledCount), leds.Color(random(256), random(256), random(256)));
    leds.show();
  }

  if (millis() - lastStateReport > 250) {
    lastStateReport = millis();
    reportState();
  }

  if (millis() - lastSensorDisplay > 1000) {
    lastSensorDisplay = millis();
    updateSensorDisplay();
  }
}
