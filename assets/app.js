// ===========================
// HumanCore.ai – app.js
// Basis-Logik für Navigation,
// Wizard, Workflows, Logs & Supervisor
// ===========================

// Globale Zustände
let hcConfig = null;
let hcWorkflows = [];
let hcLogs = [];

// Für andere Scripts zugänglich machen (falls nötig)
window.hcConfig = hcConfig;
window.hcWorkflows = hcWorkflows;
window.hcLogs = hcLogs;

function initHumanCore() {
  // ---------- Navigation ----------
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".page-section");

  function showSection(id) {
    sections.forEach((sec) => {
      if (sec.id === id) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) {
        showSection(target);
      }
    });
  });

  // ---------- Dashboard ----------
  const wfCounterEl = document.getElementById("wf-counter");

  function updateWorkflowCounter() {
    if (!wfCounterEl) return;
    if (!hcWorkflows.length) {
      wfCounterEl.textContent = "Keine Workflows gestartet";
    } else {
      const count = hcWorkflows.length;
      wfCounterEl.textContent = `${count} Workflow${count === 1 ? "" : "s"} aktiv/geplant (Demo)`;
    }
  }

  // ---------- Wizard ----------
  const wizName = document.getElementById("wiz-name");
  const wizAutonomy = document.getElementById("wiz-autonomy");
  const wizCritical = document.getElementById("wiz-critical");
  const wizGenerate = document.getElementById("wiz-generate");
  const wizOutput = document.getElementById("wiz-output");
  const configBox = document.getElementById("config-box");

  function generateConfig() {
    const displayName = wizName?.value?.trim() || "HumanCore Supervisor";
    const autonomy = wizAutonomy ? parseInt(wizAutonomy.value, 10) || 0 : 0;
    const confirmCritical = wizCritical ? wizCritical.value === "true" : true;

    hcConfig = {
      displayName,
      mode: "experte",
      autonomy,
      confirmCritical,
      explainWarnings: true,
      maxProcesses: 8,
      autoscale: "soft",
      enableGroups: false,
      logRetention: "6m",
      configRetention: "12m",
      anonLogs: true,
      updatedAt: new Date().toISOString(),
    };

    window.hcConfig = hcConfig;

    const pretty = JSON.stringify(hcConfig, null, 2);
    if (wizOutput) wizOutput.textContent = pretty;
    if (configBox) configBox.textContent = pretty;

    addLog("Wizard", "info", "Neue Konfiguration erzeugt.", { config: hcConfig });
  }

  if (wizGenerate) {
    wizGenerate.addEventListener("click", generateConfig);
  }

  // ---------- Logs ----------
  const logList = document.getElementById("log-list");

  function addLog(source, type, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      source,
      type,
      message,
      context,
    };
    hcLogs.push(entry);
    window.hcLogs = hcLogs;
    renderLogs(hcLogs);
  }

  function renderLogs(logs) {
    if (!logList) return;
    logList.innerHTML = "";

    if (!logs.length) {
      const p = document.createElement("p");
      p.textContent = "Keine Logs vorhanden.";
      logList.appendChild(p);
      return;
    }

    logs.slice().reverse().forEach((entry) => {
      const div = document.createElement("div");
      div.style.borderBottom = "1px solid rgba(148,163,184,0.3)";
      div.style.padding = "4px 0";
      const time = new Date(entry.timestamp).toLocaleString();
      div.innerHTML = `<strong>[${time}] ${entry.source}</strong> (${entry.type}): ${entry.message}`;
      logList.appendChild(div);
    });
  }

  window.renderLogs = renderLogs;

  // ---------- Workflows ----------
  const workflowList = document.getElementById("workflow-list");

  function addWorkflow(name, type, zone, origin, extra = {}) {
    const wf = {
      id: "wf-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      name,
      type,
      zone,
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin,
      ...extra,
    };
    hcWorkflows.push(wf);
    window.hcWorkflows = hcWorkflows;
    renderWorkflows(hcWorkflows);
    updateWorkflowCounter();
    addLog("Supervisor", "decision", `Workflow „${name}“ angelegt (Zone: ${zone}).`, { workflow: wf });
    return wf;
  }

  function renderWorkflows(workflows) {
    if (!workflowList) return;
    workflowList.innerHTML = "";

    if (!workflows.length) {
      const p = document.createElement("p");
      p.textContent = "Keine Workflows vorhanden.";
      workflowList.appendChild(p);
      return;
    }

    workflows
      .slice()
      .reverse()
      .forEach((wf) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "4px 0";
        row.style.borderBottom = "1px solid rgba(148,163,184,0.3)";

        const left = document.createElement("div");
        left.innerHTML = `<strong>${wf.name}</strong> <span style="color:#64748b;">(${wf.type})</span>`;

        const right = document.createElement("div");
        right.style.fontSize = "11px";
        right.style.color = "#94a3b8";
        right.textContent = `Zone: ${wf.zone} • Status: ${wf.status}`;

        row.appendChild(left);
        row.appendChild(right);
        workflowList.appendChild(row);
      });
  }

  window.renderWorkflows = renderWorkflows;

  // ---------- Supervisor Chat & Popup ----------

  const svToggleBtn = document.getElementById("sv-toggle-btn");
  const svPanel = document.getElementById("sv-chat-panel");
  const svCloseBtn = document.getElementById("sv-close-btn");
  const svMuteBtn = document.getElementById("sv-mute-btn");
  const svBody = document.getElementById("sv-chat-body");
  const svAttachmentInfo = document.getElementById("sv-attachment-info");
  const svInput = document.getElementById("sv-input");
  const svSendBtn = document.getElementById("sv-send-btn");
  const svFileInput = document.getElementById("sv-file-input");

  const svPopup = document.getElementById("sv-popup");
  const svPopupContent = document.getElementById("sv-popup-content");
  const svPopupText = document.getElementById("sv-popup-text");
  const svPopupClose = document.getElementById("sv-popup-close");

  let svMessages = [];
  let svMuted = false;
  let svAttachedFile = null;

  function toggleSvPanel(forceOpen) {
    if (!svPanel || !svToggleBtn) return;
    const isHidden = svPanel.classList.contains("hidden");
    const shouldOpen = forceOpen ? true : isHidden;
    if (shouldOpen) {
      svPanel.classList.remove("hidden");
      svToggleBtn.classList.add("sv-open");
    } else {
      svPanel.classList.add("hidden");
      svToggleBtn.classList.remove("sv-open");
    }
  }

  function playAlarm() {
    if (svMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // optional
    }
  }

  function renderSvMessages() {
    if (!svBody) return;
    svBody.innerHTML = "";
    svMessages.forEach((msg) => {
      const div = document.createElement("div");
      div.classList.add("sv-msg");
      if (msg.from === "user") {
        div.classList.add("sv-msg-user");
      } else {
        div.classList.add("sv-msg-sv");
        if (msg.severity === "success") {
          div.classList.add("sv-msg-sv-success");
        } else if (msg.severity === "ask") {
          div.classList.add("sv-msg-sv-ask");
        } else if (msg.severity === "alarm") {
          div.classList.add("sv-msg-sv-alarm");
        }
      }
      div.textContent = msg.text;
      svBody.appendChild(div);
    });
    svBody.scrollTop = svBody.scrollHeight;
  }

  function svAddLog(source, type, message, context = {}) {
    addLog(source, type, message, context);
  }

  function svShowPopup(severity, text) {
    if (!svPopup || !svPopupContent || !svPopupText) return;
    svPopupText.textContent = text;
    svPopupContent.classList.remove("success", "ask", "alarm");
    if (severity === "success") {
      svPopupContent.classList.add("success");
    } else if (severity === "ask") {
      svPopupContent.classList.add("ask");
    } else if (severity === "alarm") {
      svPopupContent.classList.add("alarm");
    }
    svPopup.classList.remove("hidden");

    if (severity === "success") {
      setTimeout(() => {
        svPopup.classList.add("hidden");
      }, 3000);
    }

    if (severity === "alarm") {
      playAlarm();
      toggleSvPanel(true);
    }
  }

  function svNotify(severity, text, options = {}) {
    const { popup = false, source = "Supervisor", logType = "info" } = options;
    svMessages.push({
      from: "sv",
      text,
      severity,
      timestamp: new Date().toISOString(),
    });
    renderSvMessages();
    svAddLog(source, logType, text);
    if (popup) svShowPopup(severity, text);
  }

  function handleSvUserInput() {
    if (!svInput) return;
    const raw = svInput.value.trim();
    if (!raw && !svAttachedFile) return;

    if (raw) {
      svMessages.push({
        from: "user",
        text: raw,
        severity: "normal",
        timestamp: new Date().toISOString(),
      });
      renderSvMessages();
    }

    const cmd = raw.toLowerCase();

    if (svAttachedFile) {
      const file = svAttachedFile;
      svAttachedFile = null;
      if (svAttachmentInfo) {
        svAttachmentInfo.classList.add("hidden");
        svAttachmentInfo.textContent = "";
      }

      const wfName = `Dokument: ${file.name}`;
      addWorkflow(wfName, "document", "yellow", "sv-chat", {
        fileName: file.name,
      });

      svNotify(
        "success",
        `Dokument „${file.name}“ übernommen. Entwurfs-Workflow „${wfName}“ wurde angelegt (Zone: gelb).`,
        { popup: true, logType: "decision" }
      );
    } else if (cmd.includes("workflow") || cmd.includes("bericht")) {
      const nameMatch = raw.match(/["“](.+?)["”]/);
      const wfName = nameMatch ? nameMatch[1] : "Allgemeiner Workflow";
      addWorkflow(wfName, "generic", "yellow", "sv-chat");
      svNotify(
        "success",
        `Workflow „${wfName}“ als Entwurf angelegt (Zone: gelb). Bitte prüfen, bevor etwas extern verwendet wird.`,
        { popup: true, logType: "decision" }
      );
    } else if (cmd.includes("behörde") || cmd.includes("finanz")) {
      svNotify(
        "alarm",
        "Kritische Aktion erkannt (Behörde/Finanzen). HumanCore 1.0 arbeitet nur im Entwurfsmodus – keine direkte Außenkommunikation.",
        { popup: true, logType: "warning" }
      );
    } else if (cmd.includes("auslastung") || cmd.includes("last")) {
      const load = 35 + Math.floor(Math.random() * 25);
      svNotify(
        "success",
        `Aktuelle geschätzte Supervisor-Auslastung: ${load} %. Alle Worker innerhalb des sicheren Bereichs.`,
        { popup: false, logType: "info" }
      );
    } else if (cmd.includes("hilfe") || cmd.includes("help")) {
      svNotify(
        "ask",
        "Du kannst z.B. sagen: „Starte Workflow „Kundenbericht““, „Wie ist die aktuelle Auslastung?“, oder eine Datei anhängen, die als Entwurf-Workflow übernommen wird.",
        { popup: false, logType: "info" }
      );
    } else if (cmd.includes("reset") || cmd.includes("zurücksetzen")) {
      svMessages = [];
      renderSvMessages();
      svNotify(
        "success",
        "Supervisor-Chatverlauf lokal zurückgesetzt (Demo-Modus, keine echten Daten).",
        { popup: false, logType: "info" }
      );
    } else if (cmd) {
      svNotify(
        "ask",
        "Unklarer Auftrag. Bitte konkreter formulieren oder das Wort „Workflow“, „Bericht“, „Auslastung“ oder „Behörde/Finanzen“ verwenden.",
        { popup: false, logType: "warning" }
      );
    }

    svInput.value = "";
  }

  // Supervisor Events

  if (svToggleBtn) {
    svToggleBtn.addEventListener("click", () => toggleSvPanel());
  }

  if (svCloseBtn) {
    svCloseBtn.addEventListener("click", () => toggleSvPanel(false));
  }

  if (svMuteBtn) {
    svMuteBtn.addEventListener("click", () => {
      svMuted = !svMuted;
      svMuteBtn.textContent = svMuted ? "🔕" : "🔔";
    });
  }

  if (svSendBtn) {
    svSendBtn.addEventListener("click", handleSvUserInput);
  }

  if (svInput) {
    svInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSvUserInput();
      }
    });
  }

  if (svFileInput) {
    svFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      svAttachedFile = file;
      if (svAttachmentInfo) {
        svAttachmentInfo.textContent = `Angehängte Datei: ${file.name} (Demo – es wird kein echter Upload durchgeführt)`;
        svAttachmentInfo.classList.remove("hidden");
      }
      svNotify(
        "success",
        `Datei „${file.name}“ beim Supervisor vorgemerkt. Sende jetzt einen Auftrag, z.B. „Entwurf für diesen Antrag vorbereiten“.`,
        { popup: false, logType: "info" }
      );
    });
  }

  if (svPopupClose) {
    svPopupClose.addEventListener("click", () => {
      svPopup.classList.add("hidden");
    });
  }

  // Initiale Meldungen
  addLog("System", "info", "HumanCore 1.0 UI initialisiert.");
  svNotify(
    "success",
    "Supervisor bereit. Du kannst Workflows starten, Dokumente als Entwurf übernehmen und die aktuelle Auslastung abfragen. HumanCore 1.0 arbeitet im sicheren Demo-Modus – keine echte Außenkommunikation.",
    { popup: false, logType: "info" }
  );

  updateWorkflowCounter();
}

// Init ausführen – Script ist am Ende von <body>, aber wir sichern trotzdem ab
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHumanCore);
} else {
  initHumanCore();
}
