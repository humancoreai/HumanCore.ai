// ===========================
// HumanCore.ai – app.js (ES5-kompatibel)
// ===========================

var hcConfig = null;
var hcWorkflows = [];
var hcLogs = [];

window.hcConfig = hcConfig;
window.hcWorkflows = hcWorkflows;
window.hcLogs = hcLogs;

function initHumanCore() {
  // ---------- Navigation ----------
  var navButtons = document.querySelectorAll(".nav-btn");
  var sections = document.querySelectorAll(".page-section");

  function showSection(id) {
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (sec.id === id) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    }
  }

  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", (function () {
      var target = navButtons[i].getAttribute("data-target");
      return function () {
        if (target) showSection(target);
      };
    })());
  }

  // ---------- Dashboard ----------
  var wfCounterEl = document.getElementById("wf-counter");

  function updateWorkflowCounter() {
    if (!wfCounterEl) return;
    if (!hcWorkflows.length) {
      wfCounterEl.textContent = "Keine Workflows gestartet";
    } else {
      var count = hcWorkflows.length;
      wfCounterEl.textContent =
        count + " Workflow" + (count === 1 ? "" : "s") + " aktiv/geplant (Demo)";
    }
  }

  // ---------- Wizard ----------
  var wizName = document.getElementById("wiz-name");
  var wizAutonomy = document.getElementById("wiz-autonomy");
  var wizCritical = document.getElementById("wiz-critical");
  var wizGenerate = document.getElementById("wiz-generate");
  var wizOutput = document.getElementById("wiz-output");
  var configBox = document.getElementById("config-box");

  function generateConfig() {
    var displayName =
      wizName && wizName.value && wizName.value.trim()
        ? wizName.value.trim()
        : "HumanCore Supervisor";
    var autonomy =
      wizAutonomy && wizAutonomy.value
        ? parseInt(wizAutonomy.value, 10) || 0
        : 0;
    var confirmCritical =
      wizCritical && wizCritical.value
        ? wizCritical.value === "true"
        : true;

    hcConfig = {
      displayName: displayName,
      mode: "experte",
      autonomy: autonomy,
      confirmCritical: confirmCritical,
      explainWarnings: true,
      maxProcesses: 8,
      autoscale: "soft",
      enableGroups: false,
      logRetention: "6m",
      configRetention: "12m",
      anonLogs: true,
      updatedAt: new Date().toISOString()
    };

    window.hcConfig = hcConfig;

    var pretty = JSON.stringify(hcConfig, null, 2);
    if (wizOutput) wizOutput.textContent = pretty;
    if (configBox) configBox.textContent = pretty;

    addLog("Wizard", "info", "Neue Konfiguration erzeugt.", { config: hcConfig });
  }

  if (wizGenerate) {
    wizGenerate.addEventListener("click", generateConfig);
  }

  // ---------- Logs ----------
  var logList = document.getElementById("log-list");

  function addLog(source, type, message, context) {
    if (!context) context = {};
    var entry = {
      timestamp: new Date().toISOString(),
      source: source,
      type: type,
      message: message,
      context: context
    };
    hcLogs.push(entry);
    window.hcLogs = hcLogs;
    renderLogs(hcLogs);
  }

  function renderLogs(logs) {
    if (!logList) return;
    logList.innerHTML = "";

    if (!logs.length) {
      var p = document.createElement("p");
      p.textContent = "Keine Logs vorhanden.";
      logList.appendChild(p);
      return;
    }

    for (var i = logs.length - 1; i >= 0; i--) {
      var entry = logs[i];
      var div = document.createElement("div");
      div.style.borderBottom = "1px solid rgba(148,163,184,0.3)";
      div.style.padding = "4px 0";
      var time = new Date(entry.timestamp).toLocaleString();
      div.innerHTML =
        "<strong>[" +
        time +
        "] " +
        entry.source +
        "</strong> (" +
        entry.type +
        "): " +
        entry.message;
      logList.appendChild(div);
    }
  }

  window.renderLogs = renderLogs;

  // ---------- Workflows ----------
  var workflowList = document.getElementById("workflow-list");

  function addWorkflow(name, type, zone, origin, extra) {
    if (!extra) extra = {};
    var wf = {
      id: "wf-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      name: name,
      type: type,
      zone: zone,
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin: origin
    };
    // extra-Eigenschaften dranhängen
    for (var k in extra) {
      if (extra.hasOwnProperty(k)) {
        wf[k] = extra[k];
      }
    }

    hcWorkflows.push(wf);
    window.hcWorkflows = hcWorkflows;
    renderWorkflows(hcWorkflows);
    updateWorkflowCounter();
    addLog(
      "Supervisor",
      "decision",
      'Workflow „' + name + "“ angelegt (Zone: " + zone + ").",
      { workflow: wf }
    );
    return wf;
  }

  function renderWorkflows(workflows) {
    if (!workflowList) return;
    workflowList.innerHTML = "";

    if (!workflows.length) {
      var p = document.createElement("p");
      p.textContent = "Keine Workflows vorhanden.";
      workflowList.appendChild(p);
      return;
    }

    for (var i = workflows.length - 1; i >= 0; i--) {
      var wf = workflows[i];
      var row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "4px 0";
      row.style.borderBottom = "1px solid rgba(148,163,184,0.3)";

      var left = document.createElement("div");
      left.innerHTML =
        "<strong>" +
        wf.name +
        "</strong> <span style=\"color:#64748b;\">(" +
        wf.type +
        ")</span>";

      var right = document.createElement("div");
      right.style.fontSize = "11px";
      right.style.color = "#94a3b8";
      right.textContent =
        "Zone: " + wf.zone + " • Status: " + wf.status;

      row.appendChild(left);
      row.appendChild(right);
      workflowList.appendChild(row);
    }
  }

  window.renderWorkflows = renderWorkflows;

  // ---------- Supervisor Chat & Popup ----------

  var svToggleBtn = document.getElementById("sv-toggle-btn");
  var svPanel = document.getElementById("sv-chat-panel");
  var svCloseBtn = document.getElementById("sv-close-btn");
  var svMuteBtn = document.getElementById("sv-mute-btn");
  var svBody = document.getElementById("sv-chat-body");
  var svAttachmentInfo = document.getElementById("sv-attachment-info");
  var svInput = document.getElementById("sv-input");
  var svSendBtn = document.getElementById("sv-send-btn");
  var svFileInput = document.getElementById("sv-file-input");

  var svPopup = document.getElementById("sv-popup");
  var svPopupContent = document.getElementById("sv-popup-content");
  var svPopupText = document.getElementById("sv-popup-text");
  var svPopupClose = document.getElementById("sv-popup-close");

  var svMessages = [];
  var svMuted = false;
  var svAttachedFile = null;

  function toggleSvPanel(forceOpen) {
    if (!svPanel || !svToggleBtn) return;
    var isHidden = svPanel.classList.contains("hidden");
    var shouldOpen = forceOpen ? true : isHidden;
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
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // ignorieren
    }
  }

  function renderSvMessages() {
    if (!svBody) return;
    svBody.innerHTML = "";
    for (var i = 0; i < svMessages.length; i++) {
      var msg = svMessages[i];
      var div = document.createElement("div");
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
    }
    svBody.scrollTop = svBody.scrollHeight;
  }

  function svAddLog(source, type, message, context) {
    addLog(source, type, message, context || {});
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
      setTimeout(function () {
        svPopup.classList.add("hidden");
      }, 3000);
    }

    if (severity === "alarm") {
      playAlarm();
      toggleSvPanel(true);
    }
  }

  function svNotify(severity, text, options) {
    if (!options) options = {};
    var source = options.source || "Supervisor";
    var logType = options.logType || "info";
    var popup = !!options.popup;

    svMessages.push({
      from: "sv",
      text: text,
      severity: severity,
      timestamp: new Date().toISOString()
    });
    renderSvMessages();
    svAddLog(source, logType, text);
    if (popup) svShowPopup(severity, text);
  }

  function handleSvUserInput() {
    if (!svInput) return;
    var raw = svInput.value ? svInput.value.trim() : "";
    if (!raw && !svAttachedFile) return;

    if (raw) {
      svMessages.push({
        from: "user",
        text: raw,
        severity: "normal",
        timestamp: new Date().toISOString()
      });
      renderSvMessages();
    }

    var cmd = raw.toLowerCase();

    if (svAttachedFile) {
      var file = svAttachedFile;
      svAttachedFile = null;
      if (svAttachmentInfo) {
        svAttachmentInfo.classList.add("hidden");
        svAttachmentInfo.textContent = "";
      }

      var wfName = "Dokument: " + file.name;
      addWorkflow(wfName, "document", "yellow", "sv-chat", {
        fileName: file.name
      });

      svNotify(
        "success",
        "Dokument „" +
          file.name +
          "“ übernommen. Entwurfs-Workflow „" +
          wfName +
          "“ wurde angelegt (Zone: gelb).",
        { popup: true, logType: "decision" }
      );
    } else if (cmd.indexOf("workflow") !== -1 || cmd.indexOf("bericht") !== -1) {
      var nameMatch = raw.match(/["“](.+?)["”]/);
      var wfName2 = nameMatch ? nameMatch[1] : "Allgemeiner Workflow";
      addWorkflow(wfName2, "generic", "yellow", "sv-chat");
      svNotify(
        "success",
        "Workflow „" +
          wfName2 +
          "“ als Entwurf angelegt (Zone: gelb). Bitte prüfen, bevor etwas extern verwendet wird.",
        { popup: true, logType: "decision" }
      );
    } else if (cmd.indexOf("behörde") !== -1 || cmd.indexOf("finanz") !== -1) {
      svNotify(
        "alarm",
        "Kritische Aktion erkannt (Behörde/Finanzen). HumanCore 1.0 arbeitet nur im Entwurfsmodus – keine direkte Außenkommunikation.",
        { popup: true, logType: "warning" }
      );
    } else if (cmd.indexOf("auslastung") !== -1 || cmd.indexOf("last") !== -1) {
      var load = 35 + Math.floor(Math.random() * 25);
      svNotify(
        "success",
        "Aktuelle geschätzte Supervisor-Auslastung: " +
          load +
          " %. Alle Worker innerhalb des sicheren Bereichs.",
        { popup: false, logType: "info" }
      );
    } else if (cmd.indexOf("hilfe") !== -1 || cmd.indexOf("help") !== -1) {
      svNotify(
        "ask",
        "Du kannst z.B. sagen: „Starte Workflow „Kundenbericht““, „Wie ist die aktuelle Auslastung?“, oder eine Datei anhängen, die als Entwurf-Workflow übernommen wird.",
        { popup: false, logType: "info" }
      );
    } else if (cmd.indexOf("reset") !== -1 || cmd.indexOf("zurücksetzen") !== -1) {
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

  // Events Supervisor
  if (svToggleBtn) {
    svToggleBtn.addEventListener("click", function () {
      toggleSvPanel();
    });
  }

  if (svCloseBtn) {
    svCloseBtn.addEventListener("click", function () {
      toggleSvPanel(false);
    });
  }

  if (svMuteBtn) {
    svMuteBtn.addEventListener("click", function () {
      svMuted = !svMuted;
      svMuteBtn.textContent = svMuted ? "🔕" : "🔔";
    });
  }

  if (svSendBtn) {
    svSendBtn.addEventListener("click", handleSvUserInput);
  }

  if (svInput) {
    svInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSvUserInput();
      }
    });
  }

  if (svFileInput) {
    svFileInput.addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      svAttachedFile = file;
      if (svAttachmentInfo) {
        svAttachmentInfo.textContent =
          "Angehängte Datei: " +
          file.name +
          " (Demo – es wird kein echter Upload durchgeführt)";
        svAttachmentInfo.classList.remove("hidden");
      }
      svNotify(
        "success",
        "Datei „" +
          file.name +
          "“ beim Supervisor vorgemerkt. Sende jetzt einen Auftrag, z.B. „Entwurf für diesen Antrag vorbereiten“.",
        { popup: false, logType: "info" }
      );
    });
  }

  if (svPopupClose) {
    svPopupClose.addEventListener("click", function () {
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

// Init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHumanCore);
} else {
  initHumanCore();
}
