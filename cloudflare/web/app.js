// --- Translations -----------------------------------------------------
const translations = {
  ja: {
    eyebrow: "リモート操作",
    title: "ESP32 パネル",
    tabs: { display: "ディスプレイ", lights: "ライト", servo: "サーボ", sound: "サウンド", songs: "曲" },
    status: {
      idle: "準備完了",
      sending: "送信中…",
      sentPrefix: "送信: ",
      pinError: "PINが違います",
      networkError: "通信エラー",
      serverError: "サーバーエラー。しばらくして再試行してください",
      offlineBadge: "オフライン",
      queuedOffline: "保留中 — デバイスがオフラインです",
    },
    sensors: {
      temp: "気温:",
      hum: "湿度:",
      light: "明るさ:",
    },
    commandLabel: {
      set: "色を変更",
      random: "ランダムカラー",
      off: "消灯",
      servo: "サーボ移動",
      servo_sweep: "スイープ開始",
      servo_strike: "打撃開始",
      sound: "音を再生",
      song: "曲を再生",
      display_text: "ディスプレイを更新",
    },
    display: {
      title: "ディスプレイ",
      placeholder: "何か書いてください…",
      left: "左揃え",
      center: "中央揃え",
      right: "右揃え",
      keep: "確定",
      edit: "編集",
      currentlyShowing: "現在の画面表示:",
      hint: "入力するとリアルタイムで実機の OLED に表示されます。絵文字はここでは表示されますが、実機の画面は文字のみ描画できます。",
    },
    lights: {
      target: "対象",
      all: "全部",
      led1: "LED 1",
      led2: "LED 2",
      led3: "LED 3",
      color: "カラー",
      colorWheel: "カラーホイール",
      brightness: "明るさ",
      random: "ランダムカラー",
      off: "消灯",
      duration: "点灯時間",
      lightingTime: "点灯時間",
      stayOn: "点灯したまま",
      seconds: (v) => `${v} 秒`,
    },
    servo: {
      angle: "角度",
      move: "サーボを動かす",
      hintMove: "選択した角度までサーボが動きます。大きいサーボの場合、追加の電源が必要になることがあります。",
      sweep: "スイープ",
      hintSweep: "2つの角度の間を一定の刻みで往復します。",
      from: "開始",
      to: "終了",
      step: "刻み幅",
      speed: "速度",
      passes: "回数",
      forever: "無限",
      hintPasses: "回数を -1 にすると、次のコマンドが届くまで無限に繰り返します。",
      startSweep: "スイープ開始",
      strike: "打撃",
      hintStrike: "ハンマーのように2つの角度の間を素早く往復します。",
      low: "低角度",
      high: "高角度",
      times: "回数",
      startStrike: "打撃開始",
      deg: (v) => `${v}°`,
      ms: (v) => `${v} ms`,
    },
    sound: {
      tone: "トーン",
      frequency: "周波数",
      length: "長さ",
      beep: "ビープ",
      alert: "アラート",
      chime: "チャイム",
      play: "音を鳴らす",
      hz: (v) => `${v} Hz`,
      ms: (v) => `${v} ms`,
    },
    songs: {
      hint: "各曲は短いブザーのメロディーと、それに合わせたLEDの点灯を再生します。",
    },
    pin: {
      title: "PINを入力",
      hint: "6桁のダッシュボードPIN。このブラウザタブにのみ保存されます。",
      unlock: "解除",
    },
  },
  en: {
    eyebrow: "Remote control",
    title: "ESP32 Panel",
    tabs: { display: "Display", lights: "Lights", servo: "Servo", sound: "Sound", songs: "Songs" },
    status: {
      idle: "Ready",
      sending: "Sending…",
      sentPrefix: "Sent: ",
      pinError: "Incorrect PIN",
      networkError: "Network error",
      serverError: "Server error, try again shortly",
      offlineBadge: "Offline",
      queuedOffline: "Queued — the device is offline",
    },
    sensors: {
      temp: "Temp:",
      hum: "Hum:",
      light: "Light:",
    },
    commandLabel: {
      set: "Color set",
      random: "Random colors",
      off: "Turned off",
      servo: "Servo moved",
      servo_sweep: "Sweep started",
      servo_strike: "Strike started",
      sound: "Sound played",
      song: "Song playing",
      display_text: "Display updated",
    },
    display: {
      title: "Display",
      placeholder: "Write something…",
      left: "Left",
      center: "Center",
      right: "Right",
      keep: "Keep",
      edit: "Edit",
      currentlyShowing: "Currently on the screen:",
      hint: "Updates the physical OLED live as you type. Emoji show here but the board's screen can only draw plain text.",
    },
    lights: {
      target: "Target",
      all: "All",
      led1: "LED 1",
      led2: "LED 2",
      led3: "LED 3",
      color: "Color",
      colorWheel: "Color wheel",
      brightness: "Brightness",
      random: "Random colors",
      off: "Turn off",
      duration: "Duration",
      lightingTime: "Lighting time",
      stayOn: "Stay on",
      seconds: (v) => `${v} seconds`,
    },
    servo: {
      angle: "Angle",
      move: "Move servo",
      hintMove: "Moves the servo to the chosen angle. Larger servos may need extra power to move smoothly.",
      sweep: "Sweep",
      hintSweep: "Rocks back and forth between two angles in fixed steps.",
      from: "From",
      to: "To",
      step: "Step",
      speed: "Speed",
      passes: "Passes",
      forever: "Forever",
      hintPasses: "Passes: -1 repeats forever until another command is sent.",
      startSweep: "Start sweep",
      strike: "Strike",
      hintStrike: "Snaps between two angles like a hammer, a set number of times.",
      low: "Low",
      high: "High",
      times: "Times",
      startStrike: "Start strike",
      deg: (v) => `${v}°`,
      ms: (v) => `${v} ms`,
    },
    sound: {
      tone: "Tone",
      frequency: "Frequency",
      length: "Length",
      beep: "Beep",
      alert: "Alert",
      chime: "Chime",
      play: "Play sound",
      hz: (v) => `${v} Hz`,
      ms: (v) => `${v} ms`,
    },
    songs: {
      hint: "Each plays a short buzzer melody with LEDs synced to it.",
    },
    pin: {
      title: "Enter PIN",
      hint: "6-digit dashboard PIN. Kept only in this browser tab.",
      unlock: "Unlock",
    },
  },
};

let lang = localStorage.lang || "ja";
let t = translations[lang];

function t_(path) {
  return path.split(".").reduce((obj, key) => obj?.[key], t);
}

function resolveIn(code, path) {
  return path.split(".").reduce((obj, key) => obj?.[key], translations[code]);
}

// Multi-line hint text wraps to a different number of lines in each
// language, which otherwise makes the surrounding card grow or shrink when
// switching. Measure both language variants once and lock in the taller
// one as a fixed min-height so the layout never shifts after that.
function lockBilingualHeights() {
  // Hidden (non-active) tab panels — and nested sub-panels, like Servo's
  // Sweep/Strike — report zero height, so reveal them off-screen just long
  // enough to measure, then restore.
  const hiddenPanels = [...panels, ...subpanels].filter((panel) => panel.hidden);
  hiddenPanels.forEach((panel) => {
    panel.hidden = false;
    panel.style.position = "absolute";
    panel.style.visibility = "hidden";
    panel.style.pointerEvents = "none";
  });

  document.querySelectorAll(".hint[data-i18n]").forEach((el) => {
    const path = el.dataset.i18n;
    const original = el.textContent;
    let maxHeight = 0;
    ["ja", "en"].forEach((code) => {
      const value = resolveIn(code, path);
      if (typeof value !== "string") return;
      el.textContent = value;
      maxHeight = Math.max(maxHeight, el.getBoundingClientRect().height);
    });
    el.textContent = original;
    el.style.minHeight = `${maxHeight}px`;
  });

  hiddenPanels.forEach((panel) => {
    panel.hidden = true;
    panel.style.position = "";
    panel.style.visibility = "";
    panel.style.pointerEvents = "";
  });
}

let pin = sessionStorage.pin || "";

const statusEl = document.querySelector("#status");
const statusText = statusEl.querySelector(".status-text");
let statusResetTimer;

function setStatus(state, text) {
  clearTimeout(statusResetTimer);
  statusEl.className = `status status--${state}`;
  statusText.textContent = text;
  if (state === "success" || state === "warning") {
    statusResetTimer = setTimeout(() => {
      statusEl.className = "status status--idle";
      statusText.textContent = t.status.idle;
    }, 2500);
  }
}

// --- PIN modal -------------------------------------------------------
const pinModal = document.querySelector("#pin-modal");
const pinForm = document.querySelector("#pin-form");
const pinInput = document.querySelector("#pin-input");

// Tapping a second button while the PIN dialog is already open used to call
// showModal() on an open <dialog>, which throws — and since that happened
// outside any try/catch, the second command silently vanished. Sharing one
// in-flight request means every concurrent caller just awaits the same
// prompt instead of trying to open it again.
let pendingPinRequest = null;
function askForPin() {
  if (pendingPinRequest) return pendingPinRequest;
  pendingPinRequest = new Promise((resolve) => {
    pinInput.value = "";
    pinModal.showModal();
    requestAnimationFrame(() => pinInput.focus());
    const onSubmit = (event) => {
      event.preventDefault();
      const value = pinInput.value.trim();
      if (!value) return;
      pinModal.close();
      pinForm.removeEventListener("submit", onSubmit);
      resolve(value);
    };
    pinForm.addEventListener("submit", onSubmit);
  }).finally(() => { pendingPinRequest = null; });
  return pendingPinRequest;
}

// Tracked live from the same recency check that drives the livebar/sensorbar
// "Offline" badge (see renderLiveState below) — a 200 from /api/command only
// means the Worker accepted and retained the command on the broker, not that
// the board actually applied it, so the status text shouldn't claim "Sent"
// when we already know the board hasn't reported in a while.
let deviceOnline = false;

async function send(command, settings = {}) {
  try {
    if (!pin) {
      pin = await askForPin();
      sessionStorage.pin = pin;
    }
  } catch {
    setStatus("error", t.status.networkError);
    return;
  }

  setStatus("sending", t.status.sending);
  try {
    const response = await fetch("/api/command", {
      method: "POST",
      headers: { "content-type": "application/json", "x-pin": pin },
      body: JSON.stringify({ command, ...settings }),
    });

    if (response.ok && deviceOnline) {
      setStatus("success", `${t.status.sentPrefix}${t.commandLabel[command] || command}`);
    } else if (response.ok) {
      // Still retained on the broker, so it'll apply the moment the board
      // reconnects — just not delivered right now.
      setStatus("warning", t.status.queuedOffline);
    } else if (response.status === 401) {
      // Only a real auth rejection means the PIN itself was wrong — any
      // other failure (e.g. a 500) has nothing to do with the PIN and
      // shouldn't wipe out an otherwise-correct one.
      sessionStorage.removeItem("pin");
      pin = "";
      setStatus("error", t.status.pinError);
    } else {
      setStatus("error", t.status.serverError);
    }
  } catch {
    setStatus("error", t.status.networkError);
  }
}

// --- Tabs --------------------------------------------------------------
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t2) => { t2.classList.remove("active"); t2.setAttribute("aria-selected", "false"); });
    panels.forEach((p) => { p.classList.remove("active"); p.hidden = true; });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const panel = document.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`);
    panel.classList.add("active");
    panel.hidden = false;
  });
});

// --- Servo sub-tabs (Angle / Sweep / Strike) ------------------------------
const subtabs = document.querySelectorAll(".subtab");
const subpanels = document.querySelectorAll(".subpanel");
subtabs.forEach((subtab) => {
  subtab.addEventListener("click", () => {
    subtabs.forEach((s) => { s.classList.remove("active"); s.setAttribute("aria-selected", "false"); });
    subpanels.forEach((p) => { p.classList.remove("active"); p.hidden = true; });
    subtab.classList.add("active");
    subtab.setAttribute("aria-selected", "true");
    const subpanel = document.querySelector(`.subpanel[data-subpanel="${subtab.dataset.subtab}"]`);
    subpanel.classList.add("active");
    subpanel.hidden = false;
  });
});

// --- Language switcher ---------------------------------------------------
// The button always shows the language a tap would switch TO, not the
// current one: on Japanese it reads "ENG"; tap it and it becomes "日本"
// while the app switches to English.
const langToggle = document.querySelector("#lang-toggle");
const langCurrent = document.querySelector("#lang-current");
const otherLangLabel = { ja: "ENG", en: "日本" };
const rangeBindings = [];

function applyLanguage() {
  t = translations[lang];
  document.documentElement.lang = lang;
  langCurrent.textContent = otherLangLabel[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t_(el.dataset.i18n);
    if (typeof value === "string") el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = t_(el.dataset.i18nPlaceholder);
    if (typeof value === "string") el.placeholder = value;
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const value = t_(el.dataset.i18nTitle);
    if (typeof value === "string") { el.title = value; el.setAttribute("aria-label", value); }
  });
  if (statusEl.classList.contains("status--idle")) statusText.textContent = t.status.idle;
  rangeBindings.forEach((update) => update());
}

function setLanguage(next) {
  lang = next;
  localStorage.lang = next;
  applyLanguage();
}

langToggle.addEventListener("click", () => {
  setLanguage(lang === "ja" ? "en" : "ja");
});

// --- Generic single-slider fill + live label ---------------------------
function bindRange(inputId, outputId, formatter) {
  const input = document.querySelector(`#${inputId}`);
  const output = document.querySelector(`#${outputId}`);
  const update = () => {
    output.textContent = formatter(input.value);
    const percent = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
    input.style.setProperty("--fill", `${percent}%`);
  };
  input.addEventListener("input", update);
  rangeBindings.push(update);
  update();
  return input;
}

// --- Dual-handle range (sweep / strike) ---------------------------------
function bindDualRange(lowId, highId, fillId) {
  const low = document.querySelector(`#${lowId}`);
  const high = document.querySelector(`#${highId}`);
  const fill = document.querySelector(`#${fillId}`);
  const min = Number(low.min);
  const max = Number(low.max);
  const update = () => {
    const a = ((Number(low.value) - min) / (max - min)) * 100;
    const b = ((Number(high.value) - min) / (max - min)) * 100;
    fill.style.left = `${Math.min(a, b)}%`;
    fill.style.right = `${100 - Math.max(a, b)}%`;
  };
  low.addEventListener("input", update);
  high.addEventListener("input", update);
  update();
  return { low, high };
}

// --- Display tab -----------------------------------------------------------
// A live "notebook page" mirrored onto the board's physical OLED as you type.
// The board's font can only draw plain ASCII, so emoji show here but never
// reach the screen itself (the firmware just skips characters it can't draw).
const oledNote = document.querySelector("#oled-note");
const oledAlignButtons = document.querySelectorAll("#oled-align .align-option");
const oledKeepBtn = document.querySelector("#oled-keep");
const oledEditBtn = document.querySelector("#oled-edit");

let oledAlign = localStorage.oledAlign || "left";
oledNote.value = localStorage.oledNote || "";
oledNote.style.textAlign = oledAlign;
oledAlignButtons.forEach((b) => b.classList.toggle("active", b.dataset.align === oledAlign));
oledEditBtn.disabled = true; // starts unlocked for editing already

// Continuous typing would otherwise send a command per keystroke; throttle
// mid-typing sends and always flush the latest text on blur/Keep so nothing
// typed is ever silently lost.
let lastOledSendAt = 0;
function sendOledNote(immediate = false) {
  const now = Date.now();
  if (!immediate && now - lastOledSendAt < 300) return;
  lastOledSendAt = now;
  send("display_text", { text: oledNote.value, align: oledAlign });
}

oledNote.addEventListener("input", () => {
  localStorage.oledNote = oledNote.value;
  sendOledNote();
});
oledNote.addEventListener("blur", () => sendOledNote(true));

oledAlignButtons.forEach((button) => {
  button.addEventListener("click", () => {
    oledAlign = button.dataset.align;
    localStorage.oledAlign = oledAlign;
    oledNote.style.textAlign = oledAlign;
    oledAlignButtons.forEach((b) => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", b === button ? "true" : "false");
    });
    sendOledNote(true);
  });
});

oledKeepBtn.addEventListener("click", () => {
  sendOledNote(true);
  oledNote.disabled = true;
  oledKeepBtn.disabled = true;
  oledEditBtn.disabled = false;
});

oledEditBtn.addEventListener("click", () => {
  oledNote.disabled = false;
  oledNote.focus();
  oledKeepBtn.disabled = false;
  oledEditBtn.disabled = true;
});

// --- Lights tab ----------------------------------------------------------
let selectedLed = -1;
const ledButtons = document.querySelectorAll("#led-target .segmented-option");
ledButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ledButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    selectedLed = Number(button.dataset.led);
  });
});

const duration = bindRange("duration", "duration-value", (v) => (v === "0" ? t.lights.stayOn : t.lights.seconds(v)));

// --- Color wheel + brightness ---------------------------------------------
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const colorWheelCanvas = document.querySelector("#color-wheel");
const colorWheelPointer = document.querySelector("#color-wheel-pointer");
const brightnessSlider = document.querySelector("#brightness");
const wheelCtx = colorWheelCanvas.getContext("2d");
const wheelSize = colorWheelCanvas.width;
const wheelRadius = wheelSize / 2;

// Drawn once: for every pixel inside the circle, angle-from-center gives hue
// and distance-from-center gives saturation. Brightness is handled by the
// separate vertical slider, not baked into this bitmap.
function drawColorWheel() {
  const image = wheelCtx.createImageData(wheelSize, wheelSize);
  for (let y = 0; y < wheelSize; y++) {
    for (let x = 0; x < wheelSize; x++) {
      const dx = x - wheelRadius;
      const dy = y - wheelRadius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * wheelSize + x) * 4;
      if (dist <= wheelRadius) {
        const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const sat = Math.min(1, dist / wheelRadius);
        const [r, g, b] = hsvToRgb(hue, sat, 1);
        image.data[idx] = r;
        image.data[idx + 1] = g;
        image.data[idx + 2] = b;
        image.data[idx + 3] = 255;
      }
    }
  }
  wheelCtx.putImageData(image, 0, 0);
}
drawColorWheel();

let hue = 0;
let saturation = 0;

function updatePointer() {
  const angle = (hue * Math.PI) / 180;
  const dist = saturation * wheelRadius;
  const x = wheelRadius + Math.cos(angle) * dist;
  const y = wheelRadius + Math.sin(angle) * dist;
  colorWheelPointer.style.left = `${(x / wheelSize) * 100}%`;
  colorWheelPointer.style.top = `${(y / wheelSize) * 100}%`;
}
updatePointer();

function currentColor() {
  const value = Number(brightnessSlider.value) / 100;
  const [r, g, b] = hsvToRgb(hue, saturation, value);
  return { r, g, b };
}

// Continuous drag would otherwise fire a command on every pixel of movement;
// throttle mid-drag sends and always flush the final value on release/change.
let lastColorSendAt = 0;
function sendColor(immediate = false) {
  const now = Date.now();
  if (!immediate && now - lastColorSendAt < 150) return;
  lastColorSendAt = now;
  const { r, g, b } = currentColor();
  send("set", { r, g, b, led: selectedLed, duration: Number(duration.value) });
}

function setFromPointerEvent(event) {
  const rect = colorWheelCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  const dist = Math.min(rect.width / 2, Math.sqrt(x * x + y * y));
  hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  saturation = dist / (rect.width / 2);
  updatePointer();
  sendColor();
}

let draggingWheel = false;
colorWheelCanvas.addEventListener("pointerdown", (event) => {
  draggingWheel = true;
  colorWheelCanvas.setPointerCapture(event.pointerId);
  setFromPointerEvent(event);
});
colorWheelCanvas.addEventListener("pointermove", (event) => {
  if (draggingWheel) setFromPointerEvent(event);
});
colorWheelCanvas.addEventListener("pointerup", () => {
  draggingWheel = false;
  sendColor(true);
});
colorWheelCanvas.addEventListener("pointercancel", () => { draggingWheel = false; });

brightnessSlider.addEventListener("input", () => sendColor());
brightnessSlider.addEventListener("change", () => sendColor(true));

document.querySelector("#random-btn").addEventListener("click", () => send("random"));
document.querySelector("#off-btn").addEventListener("click", () => send("off"));

// --- Servo tab -------------------------------------------------------------
const servoAngle = bindRange("servo-angle", "servo-angle-value", (v) => t.servo.deg(v));
const dialFill = document.querySelector("#dial-fill");
const dialNeedle = document.querySelector("#dial-needle");
const dialLength = dialFill.getTotalLength();
dialFill.style.strokeDasharray = dialLength;

function updateDial() {
  const value = Number(servoAngle.value);
  dialFill.style.strokeDashoffset = dialLength * (1 - value / 180);
  dialNeedle.style.transform = `rotate(${value - 90}deg)`;
}
servoAngle.addEventListener("input", updateDial);
updateDial();

// Let the dial itself be dragged/tapped near its arc, not just the slider.
const dialSvg = document.querySelector(".dial");
const dialHit = document.querySelector("#dial-hit");

function angleFromPointer(event) {
  const point = dialSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const svgPoint = point.matrixTransform(dialSvg.getScreenCTM().inverse());
  const degrees = 180 - (Math.atan2(-(svgPoint.y - 100), svgPoint.x - 100) * 180) / Math.PI;
  return Math.max(0, Math.min(180, Math.round(degrees)));
}

function setAngleFromPointer(event) {
  servoAngle.value = angleFromPointer(event);
  servoAngle.dispatchEvent(new Event("input"));
}

let draggingDial = false;
dialHit.addEventListener("pointerdown", (event) => {
  draggingDial = true;
  dialHit.setPointerCapture(event.pointerId);
  setAngleFromPointer(event);
});
dialHit.addEventListener("pointermove", (event) => {
  if (draggingDial) setAngleFromPointer(event);
});
dialHit.addEventListener("pointerup", () => { draggingDial = false; });
dialHit.addEventListener("pointercancel", () => { draggingDial = false; });

document.querySelector("#servo-send").addEventListener("click", () => {
  send("servo", { angle: Number(servoAngle.value) });
});

const sweepFrom = bindRange("sweep-from", "sweep-from-value", (v) => t.servo.deg(v));
const sweepTo = bindRange("sweep-to", "sweep-to-value", (v) => t.servo.deg(v));
bindDualRange("sweep-from", "sweep-to", "sweep-fill");
const sweepStep = bindRange("sweep-step", "sweep-step-value", (v) => t.servo.deg(v));
const sweepInterval = bindRange("sweep-interval", "sweep-interval-value", (v) => t.servo.ms(v));
const sweepPasses = bindRange("sweep-passes", "sweep-passes-value", (v) => (v === "-1" ? t.servo.forever : v));

document.querySelector("#sweep-send").addEventListener("click", () => {
  send("servo_sweep", {
    from: Number(sweepFrom.value),
    to: Number(sweepTo.value),
    step: Number(sweepStep.value),
    interval: Number(sweepInterval.value),
    passes: Number(sweepPasses.value),
  });
});

const strikeLow = bindRange("strike-low", "strike-low-value", (v) => t.servo.deg(v));
const strikeHigh = bindRange("strike-high", "strike-high-value", (v) => t.servo.deg(v));
bindDualRange("strike-low", "strike-high", "strike-fill");
const strikeInterval = bindRange("strike-interval", "strike-interval-value", (v) => t.servo.ms(v));
const strikeTimes = bindRange("strike-times", "strike-times-value", (v) => v);

document.querySelector("#strike-send").addEventListener("click", () => {
  send("servo_strike", {
    low: Number(strikeLow.value),
    high: Number(strikeHigh.value),
    interval: Number(strikeInterval.value),
    times: Number(strikeTimes.value),
  });
});

// --- Sound tab ---------------------------------------------------------
const soundFrequency = bindRange("sound-frequency", "sound-frequency-value", (v) => t.sound.hz(v));
const soundDuration = bindRange("sound-duration", "sound-duration-value", (v) => t.sound.ms(v));

document.querySelectorAll("[data-preset-freq]").forEach((chip) => {
  chip.addEventListener("click", () => {
    soundFrequency.value = chip.dataset.presetFreq;
    soundDuration.value = chip.dataset.presetDur;
    soundFrequency.dispatchEvent(new Event("input"));
    soundDuration.dispatchEvent(new Event("input"));
  });
});

document.querySelector("#sound-send").addEventListener("click", () => {
  send("sound", {
    frequency: Number(soundFrequency.value),
    duration: Number(soundDuration.value),
  });
});

// --- Songs tab -----------------------------------------------------------
document.querySelectorAll("[data-song]").forEach((button) => {
  button.addEventListener("click", () => send("song", { name: button.dataset.song }));
});

// --- Local audio feedback (mirrors the ESP32's buzzer, on this device) ---
// Plays instantly on tap so the control feels responsive even before the
// command round-trips to the board; it's feedback, not a status readout.
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(frequency, durationMs, wave = "square", peakGain = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = frequency;
  const now = ctx.currentTime;
  const duration = durationMs / 1000;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playSweepTone(startFreq, endFreq, durationMs, peakGain = 0.1) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  const now = ctx.currentTime;
  const duration = durationMs / 1000;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playServoMoveSound() {
  playSweepTone(220, 440, 220); // short rising motor whir
}

function playServoStrikeSound() {
  playTone(900, 60, "square", 0.18);
  setTimeout(() => playTone(500, 90, "square", 0.18), 70);
}

// Same note/duration data as the firmware's song tables in src/main.cpp,
// so what you hear on the phone matches what plays on the board.
const SONG_NOTES = {
  perfect: [[392, 400], [494, 400], [587, 400], [494, 400], [392, 400], [440, 400], [494, 500], [392, 600]],
  twinkle: [[262, 300], [262, 300], [392, 300], [392, 300], [440, 300], [440, 300], [392, 500], [0, 200],
             [349, 300], [349, 300], [330, 300], [330, 300], [294, 300], [294, 300], [262, 600]],
  birthday: [[262, 250], [262, 250], [294, 500], [262, 500], [349, 500], [330, 800], [0, 200],
              [262, 250], [262, 250], [294, 500], [262, 500], [392, 500], [349, 800]],
  fur_elise: [[659, 250], [622, 250], [659, 250], [622, 250], [659, 250], [494, 250], [587, 250], [523, 250], [440, 600]],
  mario: [[659, 150], [659, 150], [0, 150], [659, 150], [0, 150], [523, 150], [659, 150], [0, 150],
           [784, 300], [0, 300], [466, 300]],
};

function playSongLocally(name) {
  const notes = SONG_NOTES[name];
  if (!notes) return;
  let elapsed = 0;
  notes.forEach(([frequency, durationMs]) => {
    if (frequency > 0) setTimeout(() => playTone(frequency, durationMs * 0.9), elapsed);
    elapsed += durationMs;
  });
}

document.querySelector("#servo-send").addEventListener("click", playServoMoveSound);
document.querySelector("#sweep-send").addEventListener("click", playServoMoveSound);
document.querySelector("#strike-send").addEventListener("click", playServoStrikeSound);
document.querySelector("#sound-send").addEventListener("click", () => {
  playTone(Number(soundFrequency.value), Number(soundDuration.value));
});
document.querySelectorAll("[data-song]").forEach((button) => {
  button.addEventListener("click", () => playSongLocally(button.dataset.song));
});

// --- Live board-state bar -------------------------------------------------
const songTitles = {
  perfect: "Perfect",
  twinkle: "Twinkle",
  birthday: "Birthday",
  fur_elise: "Für Elise",
  mario: "Mario",
};

const stateLedEls = [0, 1, 2].map((i) => document.querySelector(`#state-led-${i}`));
const stateServoNeedle = document.querySelector("#state-servo-needle");
const stateServoAngle = document.querySelector("#state-servo-angle");
const stateSoundBlock = document.querySelector("#state-sound");
const stateSongName = document.querySelector("#state-song-name");
const livebarEl = document.querySelector(".livebar");
const offlineBadge = document.querySelector("#offline-badge");
const sensorbarEl = document.querySelector(".sensorbar");
const sensorOfflineBadge = document.querySelector("#sensor-offline-badge");
const sensorTempEl = document.querySelector("#sensor-temp");
const sensorHumEl = document.querySelector("#sensor-hum");
const sensorLightEl = document.querySelector("#sensor-light");
const oledLiveStatus = document.querySelector("#oled-live-status");
const oledLiveText = document.querySelector("#oled-live-text");
// The board only publishes on change now, plus a 5s heartbeat while idle (see
// reportHeartbeatMs in main.cpp) — this must stay comfortably above that or
// an idle-but-connected board would flicker "offline" between heartbeats.
const OFFLINE_AFTER_MS = 7000;

function colorFromPacked(value) {
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function renderLiveState(state) {
  const online = typeof state.updatedAt === "number" && Date.now() - state.updatedAt < OFFLINE_AFTER_MS;
  deviceOnline = online;
  livebarEl.classList.toggle("is-offline", !online);
  offlineBadge.hidden = online;
  sensorbarEl.classList.toggle("is-offline", !online);
  sensorOfflineBadge.hidden = online;

  stateLedEls.forEach((dot, i) => {
    const value = Number(state[`led${i}`]) || 0;
    if (value) {
      const color = colorFromPacked(value);
      dot.style.background = color;
      dot.style.boxShadow = `0 0 8px ${color}`;
    } else {
      dot.style.background = "";
      dot.style.boxShadow = "none";
    }
  });

  const angle = Number.isFinite(state.servoAngle) ? state.servoAngle : 90;
  stateServoNeedle.style.transform = `rotate(${angle - 90}deg)`;
  stateServoAngle.textContent = `${angle}°`;

  stateSoundBlock.classList.toggle("is-active", Boolean(state.sound));
  stateSongName.textContent = state.song ? (songTitles[state.song] || state.song) : "";

  sensorTempEl.textContent = typeof state.temp === "number" ? `${state.temp.toFixed(1)}°C` : "--";
  sensorHumEl.textContent = typeof state.hum === "number" ? `${state.hum.toFixed(1)}%` : "--";
  sensorLightEl.textContent = typeof state.light === "number" ? state.light.toFixed(3) : "--";

  // No PIN needed to read this either — it's just what's already visibly on
  // the physical screen, not a control surface.
  oledLiveStatus.hidden = typeof state.note !== "string" || state.note.length === 0;
  oledLiveText.textContent = oledLiveStatus.hidden ? "" : state.note;
  oledLiveText.style.textAlign = state.noteAlign || "left";
}

// No PIN needed — this is read-only telemetry, so the live view works
// immediately on load without waiting for the visitor to unlock anything.
async function pollState() {
  try {
    const response = await fetch("/api/state");
    if (!response.ok) return;
    renderLiveState(await response.json());
  } catch {
    // transient network hiccup — keep showing the last known state
  }
}

setInterval(pollState, 1500);
pollState();

// --- Initial render --------------------------------------------------------
applyLanguage();
lockBilingualHeights();
