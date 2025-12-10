// ============================================================================
// HumanCore.ai – Frontend-Logik (Version 1.1 mit Worker-Simulation B1)
// ============================================================================

(function () {
  "use strict";

  // ===========================
  // Globale Datenstrukturen
  // ===========================

  var hcWorkflows = [];
  var hcLogs = [];

  // B1: Worker-Grundmodell
  var hcWorkers = [
    {
      id: "worker-writer",
      name: "Writer",
      role: "writer",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-planner",
      name: "Planner",
      role: "planner",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-data",
      name: "Data",
      role: "data",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-research",
      name: "Research",
      role: "research",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-support",
      name: "Support",
      role: "support",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-workflow",
      name: "Workflow",
      role: "workflow",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-creative",
      name: "Creative",
      role: "creative",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    },
    {
      id: "worker-tech",
      name: "Tech",
      role: "tech",
      status: "idle",
      currentTaskId: null,
      queue: [],
      taskStartedAt: null,
      taskDurationMs: 0
    }
    // Supervisor ist hier bewusst nicht als Worker modelliert
  ];

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
    window.hcLogs = hcLogs.slice();

    renderLogs();
  }

  function renderLogs() {
    var tbody = document.getElementById("logs-table-body");
    var wrapper = document.getElementById("logs-table-wrapper");
    var empty = document.getElementById("logs-empty");
    var listDiv = document.getElementById("log-list");

    var list = hcLogs
      .slice()
      .sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

    // Tabellenansicht
    if (tbody) {
      tbody.innerHTML = "";

      if (list.length === 0) {
        if (empty) empty.style.display = "block";
        if (wrapper) wrapper.style.display = "none";
      } else {
        if (empty) empty.style.display = "none";
        if (wrapper) wrapper.style.display = "block";

        list.forEach(function (log) {
          var tr = document.createElement("tr");

          var tdTime = document.createElement("td");
          var t = log.createdAt ? new Date(log.createdAt) : null;
          tdTime.textContent = t && !isNaN(t) ? t.toLocaleTimeString() : "–";
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
      }
    }

    // Fallback-Liste
    if (listDiv) {
      if (list.length === 0) {
        listDiv.innerHTML = "<p>Keine Logs vorhanden.</p>";
      } else {
        var html = "<ul>";
        list.forEach(function (log) {
          var t2 = log.createdAt ? new Date(log.createdAt) : null;
          var timeStr =
            t2 && !isNaN(t2) ? t2.toLocaleTimeString() : "–";
          html +=
            "<li><strong>" +
            timeStr +
            " [" +
            (log.source || "System") +
            " / " +
            (log.type || "info") +
            "]</strong>: " +
            (log.message || "") +
            "</li>";
        });
        html += "</ul>";
        listDiv.innerHTML = html;
      }
    }
  }

  // ===========================
  // Workflows
  // ===========================

  function addWorkflow(name, type, zone, origin, extra) {
    if (!extra) extra = {};

    var wf = {
      id:
        "wf-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 9999),
      name: name || "Unbenannter Workflow",
      type: type || "generic",
      zone: (zone || "yellow").toLowerCase(),
      status: "planned", // B3 später: State-Maschine
      origin: origin || "SV",
      meta: extra,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedWorkerId: null
    };

    hcWorkflows.push(wf);
    window.hcWorkflows = hcWorkflows.slice();

    addLog("Supervisor", "workflow", "Workflow angelegt: " + wf.name, {
      workflowId: wf.id,
      zone: wf.zone
    });

    // B1: erste automatische Zuweisung versuchen
    autoAssignWorkflowToWorker(wf);

    renderWorkflows();
    renderWorkers();
    return wf;
  }

  function getWorkflowById(id) {
    for (var i = 0; i < hcWorkflows.length; i++) {
      if (hcWorkflows[i].id === id) return hcWorkflows[i];
    }
    return null;
  }

  function renderWorkflows() {
    var tbody = document.getElementById("workflow-table-body");
    var empty = document.getElementById("workflow-empty");
    var wrapper = document.getElementById("workflow-table-wrapper");
    var badge = document.getElementById("workflow-count-badge");
    var counter = document.getElementById("wf-counter");

    if (!tbody) return;

    tbody.innerHTML = "";

    var list = hcWorkflows
      .slice()
      .sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

    if (list.length === 0) {
      if (empty) empty.style.display = "block";
      if (wrapper) wrapper.style.display = "none";
      if (badge) badge.textContent = "0 Workflows";
      if (counter) counter.textContent = "Keine Workflows gestartet";
      return;
    }

    list.forEach(function (wf) {
      var tr = document.createElement("tr");

      // Name
      var tdName = document.createElement("td");
      tdName.textContent = wf.name || "Unbenannter Workflow";
      tr.appendChild(tdName);

      // Zone
      var tdZone = document.createElement("td");
      var zoneSpan = document.createElement("span");
      zoneSpan.classList.add("zone-pill");
      if (wf.zone === "red") {
        zoneSpan.classList.add("zone-red");
        zoneSpan.textContent = "Rot";
      } else if (wf.zone === "green") {
        zoneSpan.classList.add("zone-green");
        zoneSpan.textContent = "Grün";
      } else {
        zoneSpan.classList.add("zone-yellow");
        zoneSpan.textContent = "Gelb";
      }
      tdZone.appendChild(zoneSpan);
      tr.appendChild(tdZone);

      // Status
      var tdStatus = document.createElement("td");
      var statusSpan = document.createElement("span");
      statusSpan.classList.add("status-pill");
      var status = (wf.status || "planned").toLowerCase();

      // B1: queued als eigener Zustand anzeigen
      if (status === "running") {
        statusSpan.textContent = "Laufend";
      } else if (status === "waiting") {
        statusSpan.textContent = "Wartet";
      } else if (status === "done") {
        statusSpan.textContent = "Fertig";
      } else if (status === "failed") {
        statusSpan.textContent = "Fehlgeschlagen";
      } else if (status === "cancelled") {
        statusSpan.textContent = "Abgebrochen";
      } else if (status === "queued") {
        statusSpan.textContent = "In Warteschlange";
      } else {
        statusSpan.textContent = "Geplant";
      }

      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      // Datum
      var tdDate = document.createElement("td");
      var created = wf.createdAt ? new Date(wf.createdAt) : null;
      if (created && !isNaN(created)) {
        tdDate.textContent = created.toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short"
        });
      } else {
        tdDate.textContent = "–";
      }
      tr.appendChild(tdDate);

      // Quelle
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
    if (counter) {
      counter.textContent =
        list.length === 1
          ? "1 Workflow aktiv / geplant"
          : list.length + " Workflows aktiv / geplant";
    }
  }

  // ===========================
  // B1: Worker-Simulation
  // ===========================

  function chooseWorkerRoleForWorkflow(wf) {
    var t = (wf.type || "").toLowerCase();

    if (t === "document") return "writer";
    if (t === "data") return "data";
    if (t === "research") return "research";
    if (t === "creative") return "creative";

    // generische Workflows → Planner / Workflow
    return "workflow";
  }

  function autoAssignWorkflowToWorker(wf) {
    // Nur zuweisen, wenn noch kein Worker und Status "planned"
    if (wf.assignedWorkerId || wf.status !== "planned") {
      return;
    }

    var role = chooseWorkerRoleForWorkflow(wf);

    // 1. passenden, idle Worker suchen
    var candidate = null;
    for (var i = 0; i < hcWorkers.length; i++) {
      var w = hcWorkers[i];
      if (w.role === role && w.status === "idle" && !w.currentTaskId) {
        candidate = w;
        break;
      }
    }

    // 2. Fallback: irgendeinen Worker der Rolle nehmen
    if (!candidate) {
      for (var j = 0; j < hcWorkers.length; j++) {
        var w2 = hcWorkers[j];
        if (w2.role === role) {
          candidate = w2;
          break;
        }
      }
    }

    // Wenn immer noch kein Worker → nicht zuweisen (Demo-Sicherheit)
    if (!candidate) {
      addLog(
        "Supervisor",
        "info",
        "Kein geeigneter Worker für Workflow „" + wf.name + "“ gefunden."
      );
      return;
    }

    // Workflow in Worker-Queue legen
    candidate.queue.push(wf.id);
    wf.assignedWorkerId = candidate.id;
    wf.status = "queued";
    wf.updatedAt = new Date().toISOString();

    addLog(
      "Supervisor",
      "info",
      "Workflow „" + wf.name + "“ Worker „" + candidate.name + "“ zugewiesen.",
      { workflowId: wf.id, workerId: candidate.id }
    );

    // Falls Worker idle → sofort starten
    if (candidate.status === "idle" && !candidate.currentTaskId) {
      startWorkerTask(candidate);
    }
  }

  function startWorkerTask(worker) {
    if (worker.queue.length === 0) return;

    var wfId = worker.queue.shift();
    var wf = getWorkflowById(wfId);
    if (!wf) return;

    worker.currentTaskId = wf.id;
    worker.status = "busy";
    worker.taskStartedAt = Date.now();
    // Simulierte Bearbeitungszeit: 3–7 Sekunden
    worker.taskDurationMs = 3000 + Math.floor(Math.random() * 4000);

    wf.status = "running";
    wf.updatedAt = new Date().toISOString();

    addLog(
      "Worker:" + worker.name,
      "info",
      "Workflow „" + wf.name + "“ in Bearbeitung.",
      { workflowId: wf.id }
    );
  }

  function completeWorkerTask(worker) {
    var wf = worker.currentTaskId ? getWorkflowById(worker.currentTaskId) : null;
    if (wf) {
      wf.status = "done";
      wf.updatedAt = new Date().toISOString();
      addLog(
        "Worker:" + worker.name,
        "info",
        "Workflow „" + wf.name + "“ abgeschlossen.",
        { workflowId: wf.id }
      );
    }
    worker.currentTaskId = null;
    worker.taskStartedAt = null;
    worker.taskDurationMs = 0;
    worker.status = "idle";
  }

  function workerTick() {
    var now = Date.now();

    // 0. Sicherheitsnetz: alle noch nicht zugewiesenen Workflows zuweisen
    hcWorkflows.forEach(function (wf) {
      if (!wf.assignedWorkerId && wf.status === "planned") {
        autoAssignWorkflowToWorker(wf);
      }
    });

    // 1. Laufende Tasks prüfen
    hcWorkers.forEach(function (w) {
      if (w.status === "busy" && w.currentTaskId && w.taskStartedAt != null) {
        var elapsed = now - w.taskStartedAt;
        if (elapsed >= w.taskDurationMs) {
          // Task abschließen
          completeWorkerTask(w);
          // evtl. nächsten Task starten
          if (w.queue.length > 0) {
            startWorkerTask(w);
          }
        }
      } else if (w.status === "idle" && !w.currentTaskId && w.queue.length > 0) {
        // Worker hat noch Aufgaben in der Queue, aber keine aktive → starten
        startWorkerTask(w);
      }
    });

    renderWorkflows();
    renderWorkers();
  }

  function renderWorkers() {
    var listEl = document.getElementById("worker-status-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    hcWorkers.forEach(function (w) {
      var li = document.createElement("li");
      var statusLabel = "";
      var statusText = (w.status || "idle").toLowerCase();

      if (statusText === "busy") {
        statusLabel = "🟡 beschäftigt";
      } else if (statusText === "idle") {
        statusLabel = "🟢 bereit";
      } else if (statusText === "offline") {
        statusLabel = "🔴 offline";
      } else {
        statusLabel = statusText;
      }

      var currentInfo = "";
      if (w.currentTaskId) {
        var wf = getWorkflowById(w.currentTaskId);
        if (wf) {
          currentInfo = " – „" + wf.name + "“";
        }
      } else if (w.queue.length > 0) {
        currentInfo = " – Warteschlange: " + w.queue.length;
      }

      li.textContent = w.name + ": " + statusLabel + currentInfo;
      listEl.appendChild(li);
    });
  }

  // ===========================
  // DOM-Setup nach Laden
  // ===========================

  document.addEventListener("DOMContentLoaded", function () {
    // Navigation (Tabs)
    var navButtons = document.querySelectorAll(".nav-btn");
    var sections = document.querySelectorAll(".page-section");

    function showSection(targetId) {
      sections.forEach(function (sec) {
        if (!sec.id) return;
        if (sec.id === targetId) {
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
        }
      });

      navButtons.forEach(function (btn) {
        var t = btn.getAttribute("data-target");
        if (t === targetId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-target");
        if (targetId) {
          showSection(targetId);
        }
      });
    });

    showSection("dashboard");

    // Wizard
    var wizName = document.getElementById("wiz-name");
    var wizAutonomy = document.getElementById("wiz-autonomy");
    var wizCritical = document.getElementById("wiz-critical");
    var wizGenerate = document.getElementById("wiz-generate");
    var wizOutput = document.getElementById("wiz-output");
    var configBox = document.getElementById("config-box");

    if (wizGenerate) {
      wizGenerate.addEventListener("click", function () {
        var profileName = (wizName && wizName.value.trim()) || "Standard";
        var autonomy = wizAutonomy ? wizAutonomy.value : "0";
        var critical = wizCritical ? wizCritical.value === "true" : true;

        var config = {
          profileName: profileName,
          autonomyLevel: autonomy,
          requireConfirmationForCritical: critical,
          generatedAt: new Date().toISOString()
        };

        var json = JSON.stringify(config, null, 2);

        if (wizOutput) {
          wizOutput.textContent = json;
        }
        if (configBox) {
          configBox.textContent = json;
        }

        addLog("Wizard", "config", "Neue Demo-Konfiguration erzeugt.", {
          profileName: profileName,
          autonomyLevel: autonomy
        });
      });
    }

    // Supervisor Chat & Popup
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
        // Sound ist optional
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
      addLog(source, logType, text);
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
      } else if (
        cmd.indexOf("workflow") !== -1 ||
        cmd.indexOf("bericht") !== -1
      ) {
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
      } else if (
        cmd.indexOf("behörde") !== -1 ||
        cmd.indexOf("finanz") !== -1
      ) {
        svNotify(
          "alarm",
          "Kritische Aktion erkannt (Behörde/Finanzen). HumanCore 1.1 arbeitet nur im Entwurfsmodus – keine direkte Außenkommunikation.",
          { popup: true, logType: "warning" }
        );
      } else if (
        cmd.indexOf("auslastung") !== -1 ||
        cmd.indexOf("last") !== -1
      ) {
        var busyCount = hcWorkers.filter(function (w) {
          return w.status === "busy";
        }).length;
        var load = Math.round((busyCount / hcWorkers.length) * 100);
        svNotify(
          "success",
          "Aktuelle geschätzte Supervisor-/Worker-Auslastung: " +
            load +
            " %. (Demo-Simulation)",
          { popup: false, logType: "info" }
        );
      } else if (cmd.indexOf("hilfe") !== -1 || cmd.indexOf("help") !== -1) {
        svNotify(
          "ask",
          "Du kannst z.B. sagen: „Starte Workflow „Kundenbericht““, „Wie ist die aktuelle Auslastung?“, oder eine Datei anhängen, die als Entwurf-Workflow übernommen wird.",
          { popup: false, logType: "info" }
        );
      } else if (
        cmd.indexOf("reset") !== -1 ||
        cmd.indexOf("zurücksetzen") !== -1
      ) {
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

    // Initial-Rendering
    renderWorkflows();
    renderLogs();
    renderWorkers();

    // B1: Worker-Tick (alle 1 Sekunde)
    setInterval(workerTick, 1000);
  });
})();
