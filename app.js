// ============================================================================
// HumanCore.ai – Frontend-Logik (UI-only Demo)
// ============================================================================

(function () {
  "use strict";

  // ===========================
  // Globale Datenstrukturen
  // ===========================

  var hcWorkflows = [];
  var hcLogs = [];

  // ===========================
  // Logging
  // ===========================

  function addLog(source, type, message, context) {
    var entry = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      source: source || "System",
      type: type || "info",
      message: message || "",
      context: context || {},
      createdAt: new Date().toISOString()
    };

    hcLogs.push(entry);
    if (typeof window.renderLogs === "function") {
      window.renderLogs(hcLogs);
    }
  }

  // ===========================
  // Workflows
  // ===========================

  function addWorkflow(name, type, zone, origin, extra) {
    if (!extra) extra = {};

    var wf = {
      id: "wf-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      name: name || "Unbenannter Workflow",
      type: type || "generic",
      zone: zone || "yellow",
      status: "planned",
      origin: origin || "SV",
      meta: extra,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    hcWorkflows.push(wf);
    if (typeof window.renderWorkflows === "function") {
      window.renderWorkflows(hcWorkflows);
    }

    addLog("Supervisor", "workflow", "Workflow angelegt: " + wf.name, {
      workflowId: wf.id,
      zone: wf.zone
    });

    return wf;
  }

  // ===========================
  // Workflow-Rendering
  // ===========================

  window.renderWorkflows = function (workflows) {
    var tbody = document.getElementById("workflow-table-body");
    var empty = document.getElementById("workflow-empty");
    var wrapper = document.getElementById("workflow-table-wrapper");
    var badge = document.getElementById("workflow-count-badge");
    var wfCounter = document.getElementById("wf-counter");

    if (!tbody) return;

    tbody.innerHTML = "";

    var list = Array.isArray(workflows) ? workflows.slice() : [];

    if (list.length === 0) {
      if (empty) empty.style.display = "block";
      if (wrapper) wrapper.style.display = "none";
      if (badge) badge.textContent = "0 Workflows";
      if (wfCounter) wfCounter.textContent = "Keine Workflows gestartet";
      return;
    }

    list.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    list.forEach(function (wf) {
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      tdName.textContent = wf.name || "Unbenannter Workflow";
      tr.appendChild(tdName);

      var tdZone = document.createElement("td");
      var zoneSpan = document.createElement("span");
      zoneSpan.classList.add("zone-pill");
      var zone = (wf.zone || "yellow").toLowerCase();
      if (zone === "red") {
        zoneSpan.classList.add("zone-red");
        zoneSpan.textContent = "Rot";
      } else if (zone === "green") {
        zoneSpan.classList.add("zone-green");
        zoneSpan.textContent = "Grün";
      } else {
        zoneSpan.classList.add("zone-yellow");
        zoneSpan.textContent = "Gelb";
      }
      tdZone.appendChild(zoneSpan);
      tr.appendChild(tdZone);

      var tdStatus = document.createElement("td");
      var statusSpan = document.createElement("span");
      statusSpan.classList.add("status-pill");
      var status = (wf.status || "planned").toLowerCase();
      if (status === "running") {
        statusSpan.textContent = "Laufend";
      } else if (status === "waiting") {
        statusSpan.textContent = "Wartet";
      } else if (status === "done") {
        statusSpan.textContent = "Fertig";
      } else {
        statusSpan.textContent = "Geplant";
      }
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      var tdDate = document.createElement("td");
      var created = wf.createdAt ? new Date(wf.createdAt) : null;
      tdDate.textContent =
        created && !isNaN(created)
          ? created.toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short"
            })
          : "–";
      tr.appendChild(tdDate);

      var tdOrigin = document.createElement("td");
      tdOrigin.textContent = wf.origin || "SV";
      tr.appendChild(tdOrigin);

      tbody.appendChild(tr);
    });

    if (empty) empty.style.display = "none";
    if (wrapper) wrapper.style.display = "block";
    if (badge) {
      var count = list.length;
      badge.textContent = count === 1 ? "1 Workflow" : count + " Workflows";
    }
    if (wfCounter) {
      var c = list.length;
      wfCounter.textContent =
        c === 0
          ? "Keine Workflows gestartet"
          : c === 1
          ? "1 Workflow aktiv/geplant"
          : c + " Workflows aktiv/geplant";
    }
  };

  // ===========================
  // Logs-Rendering
  // ===========================

  window.renderLogs = function (logs) {
    var tbody = document.getElementById("logs-table-body");
    var empty = document.getElementById("logs-empty");
    var wrapper = document.getElementById("logs-table-wrapper");

    if (!tbody) return;

    tbody.innerHTML = "";

    var list = Array.isArray(logs) ? logs.slice() : [];

    if (list.length === 0) {
      if (empty) empty.style.display = "block";
      if (wrapper) wrapper.style.display = "none";
      return;
    }

    list.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    list.forEach(function (log) {
      var tr = document.createElement("tr");

      var tdTime = document.createElement("td");
      var t = log.createdAt ? new Date(log.createdAt) : null;
      tdTime.textContent =
        t && !isNaN(t) ? t.toLocaleTimeString(undefined, { timeStyle: "short" }) : "–";
      tr.appendChild(tdTime);

      var tdSource = document.createElement("td");
      tdSource.textContent = log.source || "System";
      tr.appendChild(tdSource);

      var tdType = document.createElement("td");
      tdType.textContent = log.type || "info";
      tr.appendChild(tdType);

      var tdMsg = document.createElement("td");
      tdMsg.textContent = log.message || "";
      tr.appendChild(tdMsg);

      tbody.appendChild(tr);
    });

    if (empty) empty.style.display = "none";
    if (wrapper) wrapper.style.display = "block";
  };

  // ===========================
  // DOM-Setup
  // ===========================

  document.addEventListener("DOMContentLoaded", function () {
    // ---------- Tabs / Navigation ----------
    var navButtons = document.querySelectorAll(".nav-btn");
    var sections = document.querySelectorAll(".page-section");

    function activateSection(id) {
      sections.forEach(function (sec) {
        if (sec.id === id) {
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
        }
      });

      navButtons.forEach(function (btn) {
        var target = btn.getAttribute("data-target");
        if (target === id) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-target");
        if (target) activateSection(target);
      });
    });

    activateSection("dashboard");

    // ---------- Wizard ----------
    var wizName = document.getElementById("wiz-name");
    var wizAutonomy = document.getElementById("wiz-autonomy");
    var wizCritical = document.getElementById("wiz-critical");
    var wizGenerate = document.getElementById("wiz-generate");
    var wizOutput = document.getElementById("wiz-output");
    var configBox = document.getElementById("config-box");

    if (wizGenerate && wizOutput && configBox) {
      wizGenerate.addEventListener("click", function () {
        var profileName = (wizName && wizName.value.trim()) || "Standard-Profil";
        var autonomy = wizAutonomy ? wizAutonomy.value : "0";
        var critical = wizCritical ? wizCritical.value === "true" : true;

        var cfg = {
          profileName: profileName,
          autonomyLevel: Number(autonomy),
          confirmCriticalActions: critical,
          createdAt: new Date().toISOString(),
          notes:
            "Demo-Konfiguration. Keine echten Schreibrechte, nur Entwurfs-/Simulationslogik."
        };

        var json = JSON.stringify(cfg, null, 2);
        wizOutput.textContent = json;
        configBox.textContent = json;

        addLog("Wizard", "config", "Neue Demo-Konfiguration erzeugt.", {
          profileName: profileName,
          autonomyLevel: autonomy
        });
      });
    }

    // ---------- Supervisor Chat ----------
    var svToggleBtn = document.getElementById("sv-toggle-btn");
    var svPanel = document.getElementById("sv-chat-panel");
    var svCloseBtn = document.getElementById("sv-close-btn");
    var svMuteBtn = document.getElementById("sv-mute-btn");
    var svBody = document.getElementById("sv-chat-body");
    var svAttachmentInfo = document.getElementById("sv-attachment-info");
    var svInput = document.getElementById("sv-input");
    var svSendBtn = document.getElementById("sv-send-btn");
    var svFileInput = document.getElementById("sv-file-input");
    var svFileBtn = document.getElementById("sv-file-btn");

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
      } else {
        svPanel.classList.add("hidden");
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
      svMessages.forEach(function (msg) {
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
      });
      svBody.scrollTop = svBody.scrollHeight;
    }

    function svShowPopup(severity, text) {
      if (!svPopup || !svPopupContent || !svPopupText) return;
      svPopupText.textContent = text;
      svPopupContent.className = "sv-popup-content";
      if (severity === "success") {
        // optional: extra Styling
      } else if (severity === "ask") {
        // optional
      } else if (severity === "alarm") {
        // optional
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
      addLog(source, logType, text, options.context || {});
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
        addWorkflow(wfName, "document", "yellow", "SV (Datei)", {
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
        addWorkflow(wfName2, "generic", "yellow", "SV (Chat)");
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

    if (svFileBtn && svFileInput) {
      svFileBtn.addEventListener("click", function () {
        svFileInput.click();
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
            "“ beim Supervisor vorgemerkt. Sende jetzt einen Auftrag, z.B. „Entwurf für diesen Antrag vorbereiten“. ",
          { popup: false, logType: "info" }
        );
      });
    }

    if (svPopupClose && svPopup) {
      svPopupClose.addEventListener("click", function () {
        svPopup.classList.add("hidden");
      });
    }

    // Initiales Rendern
    window.renderWorkflows(hcWorkflows);
    window.renderLogs(hcLogs);
  });
})();
