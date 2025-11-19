// ==============================
// Aqua Sentinel – dashboard.js
// Updated to save to Firebase in background (non-breaking)
// ==============================

// ----- Utility: random generator -----
function generateRandom(min, max, fixed = 2) {
  return +(Math.random() * (max - min) + min).toFixed(fixed);
}

// ----- Parameter definitions (canonical keys) -----
const parameters = [
  { id: "ph", name: "pH", unit: "", min: 6.0, max: 9.0, idealMin: 6.5, idealMax: 8.5 },
  { id: "tds", name: "TDS", unit: " ppm", min: 0, max: 1200, idealMax: 500 },
  { id: "turbidity", name: "Turbidity", unit: " NTU", min: 0, max: 50, idealMax: 5 },
  { id: "temp", name: "Temperature", unit: " °C", min: 0, max: 50, idealMin: 20, idealMax: 30 },
  { id: "do", name: "Dissolved O₂", unit: " mg/L", min: 0, max: 14, idealMin: 5 },
  { id: "metal", name: "Heavy Metals", unit: " ppm", min: 0, max: 0.5, idealMax: 0.01 }
];

// ----- Chart setup for main dashboard (6-series) -----
const chartCanvas = document.getElementById("liveChart");
let liveChart = null;
if (chartCanvas) {
  const ctx = chartCanvas.getContext("2d");

  const gradPH = ctx.createLinearGradient(0, 0, 0, 400);
  gradPH.addColorStop(0, "rgba(0,255,255,0.7)");
  gradPH.addColorStop(1, "rgba(0,100,255,0.06)");
  const gradTDS = ctx.createLinearGradient(0, 0, 0, 400);
  gradTDS.addColorStop(0, "rgba(255,230,0,0.85)");
  gradTDS.addColorStop(1, "rgba(255,180,0,0.06)");
  const gradTurb = ctx.createLinearGradient(0, 0, 0, 400);
  gradTurb.addColorStop(0, "rgba(255,100,0,0.85)");
  gradTurb.addColorStop(1, "rgba(255,50,0,0.06)");
  const gradDO = ctx.createLinearGradient(0, 0, 0, 400);
  gradDO.addColorStop(0, "rgba(80,255,160,0.8)");
  gradDO.addColorStop(1, "rgba(80,200,120,0.06)");
  const gradTemp = ctx.createLinearGradient(0, 0, 0, 400);
  gradTemp.addColorStop(0, "rgba(255,120,200,0.8)");
  gradTemp.addColorStop(1, "rgba(255,120,200,0.06)");
  const gradMetal = ctx.createLinearGradient(0, 0, 0, 400);
  gradMetal.addColorStop(0, "rgba(255,80,80,0.8)");
  gradMetal.addColorStop(1, "rgba(255,80,80,0.04)");

  liveChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "pH Level", data: [], borderColor: "#00ffff", backgroundColor: gradPH, yAxisID: "yLeft", fill: true, tension: 0.35, borderWidth: 2 },
        { label: "TDS (ppm)", data: [], borderColor: "#ffee00", backgroundColor: gradTDS, yAxisID: "yRight", fill: true, tension: 0.35, borderWidth: 2 },
        { label: "Turbidity (NTU)", data: [], borderColor: "#ff6a00", backgroundColor: gradTurb, yAxisID: "yLeft", fill: true, tension: 0.35, borderWidth: 2 },
        { label: "DO (mg/L)", data: [], borderColor: "#4fffa0", backgroundColor: gradDO, yAxisID: "yLeft", fill: true, tension: 0.35, borderWidth: 2 },
        { label: "Temperature (°C)", data: [], borderColor: "#ff80d0", backgroundColor: gradTemp, yAxisID: "yLeft", fill: true, tension: 0.35, borderWidth: 2 },
        { label: "Heavy Metals (ppm)", data: [], borderColor: "#ff6a6a", backgroundColor: gradMetal, yAxisID: "yRight", fill: true, tension: 0.35, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#e6f7ff" } },
        yLeft: { type: "linear", position: "left", grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#e6f7ff" }, suggestedMin: 0 },
        yRight: { type: "linear", position: "right", grid: { drawOnChartArea: false }, ticks: { color: "#e6f7ff" }, suggestedMin: 0 }
      },
      plugins: { legend: { labels: { color: "#dff6ff" } } }
    }
  });

  for (let i = 0; i < 6; i++) {
    const p = generateRandom(6.8, 7.6, 2);
    const td = generateRandom(200, 450, 0);
    const tu = generateRandom(1, 4, 2);
    const d = generateRandom(5, 9, 2);
    const t = generateRandom(22, 28, 1);
    const m = generateRandom(0.005, 0.06, 3);
    const time = new Date(Date.now() - (6 - i) * 4000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
    liveChart.data.labels.push(time);
    liveChart.data.datasets[0].data.push(p);
    liveChart.data.datasets[1].data.push(td);
    liveChart.data.datasets[2].data.push(tu);
    liveChart.data.datasets[3].data.push(d);
    liveChart.data.datasets[4].data.push(t);
    liveChart.data.datasets[5].data.push(m);
  }
  liveChart.update();
}

// ----- Helper: safe DOM setter -----
function setIfExists(ids, value, color) {
  if (!Array.isArray(ids)) ids = [ids];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      if (color) el.style.color = color;
      el.textContent = value;
      break;
    }
  }
}

// ----- Build readings and store to localStorage + Firebase -----
function buildAndStoreReadings() {
  const readings = {
    ph: generateRandom(6.0, 8.5, 2),
    tds: generateRandom(100, 700, 0),
    turbidity: generateRandom(0, 8, 2),
    temp: generateRandom(18, 30, 1),
    do: generateRandom(4, 10, 2),
    metal: generateRandom(0.000, 0.12, 3)
  };

  readings.temperature = readings.temp;
  readings.metals = readings.metal;

  // Store LATEST reading (existing behavior)
  localStorage.setItem("aquaReadings", JSON.stringify(readings));
  
  // 🆕 ALSO STORE ALL READINGS with timestamp
  const timestamp = new Date().toISOString();
  const readingWithTime = {
    ...readings,
    timestamp: timestamp,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false })
  };

  // Get existing history
  let history = [];
  try {
    const stored = localStorage.getItem("aquaReadingsHistory");
    if (stored) {
      history = JSON.parse(stored);
    }
  } catch (e) {
    history = [];
  }

  // Add new reading to history (keep last 1000 readings)
  history.push(readingWithTime);
  if (history.length > 1000) {
    history.shift();
  }

  // Save history back
  localStorage.setItem("aquaReadingsHistory", JSON.stringify(history));
  
  window.dispatchEvent(new Event("storage"));

  // 🆕 FIREBASE: Save in background (non-blocking)
  if (typeof saveReadingToFirebase === 'function') {
    saveReadingToFirebase(readings).catch(err => {
      console.warn('Firebase save failed (using localStorage only):', err);
    });
  }

  return readings;
}

// ----- Status evaluation -----
function evaluateStatus(id, val) {
  const p = parameters.find(x => x.id === id);
  if (!p) return { text: "Unknown", color: "#ffffff" };

  if (id === "tds" && val > 800) return { text: "❌ Unsafe (Very High TDS)", color: "#ff6a6a" };
  if (id === "turbidity" && val > 7) return { text: "❌ Unsafe (High Turbidity)", color: "#ff6a6a" };
  if (id === "metal" && val > 0.1) return { text: "❌ Unsafe (Heavy Metals)", color: "#ff6a6a" };
  if (id === "do" && val < 5) return { text: "❌ Unsafe (Low DO)", color: "#ff6a6a" };

  if ((p.idealMin !== undefined && val < p.idealMin) || (p.idealMax !== undefined && val > p.idealMax)) {
    return { text: "⚠️ Warning (Deviation)", color: "#ffd60a" };
  }
  return { text: "✅ Safe", color: "#00ff88" };
}

// ----- Insights logic -----
function analyzeReadings(r) {
  let message = "✅ Water quality stable and safe.";
  let color = "#00ff88";

  if ((r.metal || r.metals) > 0.05) {
    message = "🚨 Heavy metal concentration critical – unsafe for use!";
    color = "#ff6a6a";
  } else if ((r.turbidity || 0) > 7 || (r.tds || 0) > 800) {
    message = "⚠️ High turbidity or TDS – possible sediment contamination.";
    color = "#ffd60a";
  } else if ((r.ph || 7) < 6.5 || (r.ph || 7) > 8.5) {
    message = "⚠️ pH deviation detected – may affect taste and safety.";
    color = "#ffd60a";
  }
  return { message, color };
}

// ----- Core update function -----
let liveMode = true;
function updateDashboardCore() {
  const readings = buildAndStoreReadings();
  
  // Log to console so you can verify it's saving
  console.log('💾 Saved reading:', {
    ph: readings.ph,
    tds: readings.tds,
    turbidity: readings.turbidity,
    temp: readings.temp,
    do: readings.do,
    metal: readings.metal,
    time: new Date().toLocaleTimeString()
  });

  setIfExists(["ph-value", "ph-value-text", "ph-value-display"], (readings.ph).toFixed(2) + parameters.find(p => p.id==="ph").unit);
  setIfExists(["tds-value", "tds-value-text"], (readings.tds).toFixed(0) + parameters.find(p => p.id==="tds").unit);
  setIfExists(["turbidity-value", "turbidity-value-text"], (readings.turbidity).toFixed(2) + parameters.find(p => p.id==="turbidity").unit);
  setIfExists(["temperature-value", "temp-value", "temp-value-text", "temp-value-display"], (readings.temp).toFixed(1) + parameters.find(p => p.id==="temp").unit);
  setIfExists(["do-value", "do-value-text"], (readings.do).toFixed(2) + parameters.find(p => p.id==="do").unit);
  setIfExists(["metals-value", "metal-value", "metal-value-text"], (readings.metal).toFixed(3) + parameters.find(p => p.id==="metal").unit);

  let unsafeCount = 0, warnCount = 0;
  parameters.forEach(p => {
    const cardEl = document.getElementById(`${p.id}-card`) || document.getElementById(`${p.id}Card`)||null;
    const statusEl = document.getElementById(`${p.id}-status`) || document.getElementById(`${p.id}Status`)||null;
    const val = readings[p.id] !== undefined ? readings[p.id] : (p.id === 'temp' ? readings.temp : (p.id === 'metal' ? readings.metal : undefined));
    const evaluation = evaluateStatus(p.id, val);

    if (evaluation.text.includes("Unsafe")) unsafeCount++;
    else if (evaluation.text.includes("⚠️")) warnCount++;

    if (statusEl) {
      statusEl.textContent = evaluation.text;
      statusEl.style.color = evaluation.color;
    }

    if (cardEl) {
      if (evaluation.text.includes("Unsafe")) {
        cardEl.style.border = "1px solid rgba(255,80,80,0.12)";
        cardEl.style.boxShadow = "0 8px 20px rgba(255,80,80,0.06)";
      } else if (evaluation.text.includes("⚠️")) {
        cardEl.style.border = "1px solid rgba(255,215,64,0.12)";
        cardEl.style.boxShadow = "0 8px 20px rgba(255,215,64,0.04)";
      } else {
        cardEl.style.border = "1px solid rgba(0,255,136,0.12)";
        cardEl.style.boxShadow = "0 8px 20px rgba(0,255,136,0.05)";
      }
    }
  });

  if (liveChart) {
    const t = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
    const maxPoints = 12;
    liveChart.data.labels.push(t);
    liveChart.data.datasets[0].data.push(readings.ph);
    liveChart.data.datasets[1].data.push(readings.tds);
    liveChart.data.datasets[2].data.push(readings.turbidity);
    liveChart.data.datasets[3].data.push(readings.do);
    liveChart.data.datasets[4].data.push(readings.temp);
    liveChart.data.datasets[5].data.push(readings.metal);
    if (liveChart.data.labels.length > maxPoints) {
      liveChart.data.labels.shift();
      liveChart.data.datasets.forEach(d => d.data.shift());
    }
    liveChart.update();
  }

  const overallEl = document.getElementById("overall-status") || document.getElementById("quality-summary")||null;
  if (overallEl) {
    if (unsafeCount > 0) { overallEl.textContent = "❌ Unsafe – action required"; overallEl.style.color = "#ff6a6a"; }
    else if (warnCount > 0) { overallEl.textContent = "⚠️ Moderate – check warnings"; overallEl.style.color = "#ffd60a"; }
    else { overallEl.textContent = "✅ Safe & Stable"; overallEl.style.color = "#00ff88"; }
  }

  const insightEl = document.getElementById("insight-text");
  if (insightEl) {
    const analysis = analyzeReadings(readings);
    insightEl.style.opacity = 0;
    setTimeout(() => {
      insightEl.textContent = analysis.message;
      insightEl.style.color = analysis.color;
      insightEl.style.opacity = 1;
    }, 150);
  }
}

// ----- Controlled update -----
function controlledUpdate() {
  if (liveMode) updateDashboardCore();
}

const toggleEl = document.getElementById("live-toggle");
const indicator = document.getElementById("live-indicator");
const liveStatusText = document.getElementById("live-status");

if (toggleEl) {
  toggleEl.addEventListener("change", () => {
    liveMode = toggleEl.checked;
    if (indicator) {
      if (liveMode) {
        indicator.classList.add("active");
        indicator.style.background = "#00ff88";
        indicator.style.boxShadow = "0 0 10px #00ff88";
      } else {
        indicator.classList.remove("active");
        indicator.style.background = "#ff4d4d";
        indicator.style.boxShadow = "0 0 8px #ff4d4d";
      }
    }
    if (liveStatusText) {
      liveStatusText.textContent = liveMode ? "Live Mode: ON" : "Live Mode: OFF";
      liveStatusText.style.color = liveMode ? "#00ff88" : "#c92020ff";
    }
  });
}

if (liveStatusText) {
  liveStatusText.textContent = liveMode ? "Live Mode: ON" : "Live Mode: OFF";
  liveStatusText.style.color = liveMode ? "#00ff88" : "#ff4d4d";
}

// ----- Start update loop (runs continuously) -----
console.log('🚀 Starting dashboard update loop...');
updateDashboardCore(); // First update immediately
const updateInterval = setInterval(() => {
  controlledUpdate();
  console.log('📊 Reading saved:', new Date().toLocaleTimeString());
}, 4000);

// Log to confirm it's running
setTimeout(() => {
  console.log('✅ Update loop is active and saving data every 4 seconds');
}, 100);

// ----- Live clock -----
function updateCurrentTime() {
  const el = document.getElementById("current-time");
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Modal variables
const paramModal = document.getElementById("param-modal");
const closeModal = document.getElementById("close-modal");
const paramTitle = document.getElementById("param-title");
const paramCurrent = document.getElementById("param-current");
const paramAverage = document.getElementById("param-average");
const paramStatus = document.getElementById("param-status");
const paramAIText = document.getElementById("param-ai-text");
let paramChart = null;