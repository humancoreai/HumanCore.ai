const DEFAULT_CONFIG = {
  displayName: "HumanCore Supervisor",
  mode: "experte",
  autonomy: 0,
  confirmCritical: true,
  explainWarnings: true,
  maxProcesses: 6,
  autoscale: "soft",
  enableGroups: true,
  logRetention: "6m",
  configRetention: "12m",
  anonLogs: true,
  updatedAt: null
};

function loadConfig() {
  try {
    const raw = localStorage.getItem("humancore_config");
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(cfg) {
  const withTs = { ...cfg, updatedAt: new Date().toISOString() };
  localStorage.setItem("humancore_config", JSON.stringify(withTs));
  return withTs;
}

const config = loadConfig();

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initWizard();
  fillDashboard();
  fillAgents();
  fillWorkflows();
  fillLogs();
  updateConfigPreview();
});

function initNav() {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");
  const title = document.getElementById("view-title");
  const subtitle = document.getElementById("view-subtitle");

  const map = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Zentrale Übersicht für Supervisor & Agenten."
    },
    agents: {
      title: "Agenten",
      subtitle: "Rollen, Auslastung und Gruppierung der Worker-Agenten."
    },
    workflows: {
      title: "Workflows",
      subtitle: "Standardprozesse und wiederkehrende Abläufe."
    },
    config: {
      title: "Konfiguration",
      subtitle: "Aktive Supervisor- und Agenten-Regeln."
    },
    logs: {
      title: "Logs & Audit",
      subtitle: "Audit- und Systemereignisse (Demo-Daten)."
    }
  };

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewName = btn.dataset.view;
      navItems.forEach(n => n.classList.toggle("active", n === btn));
      views.forEach(v => v.classList.toggle("active", v.id === `view-${viewName}`));
      if (map[viewName]) {
        title.textContent = map[viewName].title;
        subtitle.textContent = map[viewName].subtitle;
      }
    });
  });

  document.getElementById("btn-open-wizard-secondary")
    ?.addEventListener("click", openWizard);
  document.getElementById("open-wizard-btn")
    ?.addEventListener("click", openWizard);

  document.getElementById("btn-quick-add")
    ?.addEventListener("click", () => {
      alert("In dieser Demo können noch keine echten Aufgaben angelegt werden.");
    });
  document.getElementById("btn-sync")
    ?.addEventListener("click", () => {
      alert("Demo-Sync ausgeführt. (In einer echten Version würde hier eine API aufgerufen.)");
    });
}

/* WIZARD */

let wizardStep = 1;
const MAX_STEP = 5;

function initWizard() {
  const overlay = document.getElementById("wizard-overlay");
  const closeBtn = document.getElementById("wizard-close-btn");
  const backBtn = document.getElementById("wizard-back-btn");
  const nextBtn = document.getElementById("wizard-next-btn");

  closeBtn.addEventListener("click", closeWizard);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeWizard();
  });

  backBtn.addEventListener("click", () => {
    if (wizardStep > 1) {
      wizardStep -= 1;
      updateWizardStep();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (wizardStep < MAX_STEP) {
      wizardStep += 1;
      if (wizardStep === MAX_STEP) {
        nextBtn.textContent = "Speichern & aktivieren";
      } else {
        nextBtn.textContent = "Weiter";
      }
      updateWizardStep();
    } else {
      const updated = readWizardToConfig();
      const saved = saveConfig(updated);
      Object.assign(config, saved);
      updateConfigPreview();
      updateConfigStatus();
      fillDashboard();
      closeWizard();
    }
  });

  // Prefill wizard from config
  document.getElementById("cfg-display-name").value = config.displayName || "";
  document.getElementById("cfg-mode").value = config.mode;
  document.getElementById("cfg-autonomy").value = String(config.autonomy);
  document.getElementById("cfg-confirm-critical").checked = !!config.confirmCritical;
  document.getElementById("cfg-explain-warnings").checked = !!config.explainWarnings;
  document.getElementById("cfg-max-processes").value = config.maxProcesses;
  document.getElementById("cfg-autoscale").value = config.autoscale;
  document.getElementById("cfg-enable-groups").checked = !!config.enableGroups;
  document.getElementById("cfg-log-retention").value = config.logRetention;
  document.getElementById("cfg-config-retention").value = config.configRetention;
  document.getElementById("cfg-anon-logs").checked = !!config.anonLogs;

  updateWizardSummary();
  updateConfigStatus();
  updateWizardStep();
}

function openWizard() {
  document.getElementById("wizard-overlay").classList.remove("hidden");
  wizardStep = 1;
  document.getElementById("wizard-next-btn").textContent = "Weiter";
  updateWizardStep();
}

function closeWizard() {
  document.getElementById("wizard-overlay").classList.add("hidden");
}

function updateWizardStep() {
  document.querySelectorAll(".wizard-step").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.step) === wizardStep);
  });
  document.getElementById("wizard-back-btn").disabled = wizardStep === 1;
  updateWizardSummary();
}

function readWizardToConfig() {
  return {
    ...config,
    displayName: document.getElementById("cfg-display-name").value || DEFAULT_CONFIG.displayName,
    mode: document.getElementById("cfg-mode").value,
    autonomy: Number(document.getElementById("cfg-autonomy").value),
    confirmCritical: document.getElementById("cfg-confirm-critical").checked,
    explainWarnings: document.getElementById("cfg-explain-warnings").checked,
    maxProcesses: Number(document.getElementById("cfg-max-processes").value),
    autoscale: document.getElementById("cfg-autoscale").value,
    enableGroups: document.getElementById("cfg-enable-groups").checked,
    logRetention: document.getElementById("cfg-log-retention").value,
    configRetention: document.getElementById("cfg-config-retention").value,
    anonLogs: document.getElementById("cfg-anon-logs").checked
  };
}

function updateWizardSummary() {
  const previewEl = document.getElementById("wizard-summary");
  if (!previewEl) return;
  const cfg = readWizardToConfig();
  const summary = {
    Profil: {
      Anzeigename: cfg.displayName,
      Modus: cfg.mode
    },
    Autonomie: {
      Level: cfg.autonomy,
      Kritische_Bestätigung: cfg.confirmCritical,
      Explain_Warnings: cfg.explainWarnings
    },
    Lastverteilung: {
      Max_Prozesse: cfg.maxProcesses,
      Autoscale: cfg.autoscale,
      Gruppierung: cfg.enableGroups
    },
    Speicher: {
      Log_Aufbewahrung: cfg.logRetention,
      Config_Aufbewahrung: cfg.configRetention,
      Anonymisierung: cfg.anonLogs
    }
  };
  previewEl.textContent = JSON.stringify(summary, null, 2);
}

function updateConfigPreview() {
  const el = document.getElementById("config-preview");
  if (!el) return;
  el.textContent = JSON.stringify(config, null, 2);
}

function updateConfigStatus() {
  const textEl = document.getElementById("config-status-text");
  if (!textEl) return;
  const date = config.updatedAt ? new Date(config.updatedAt) : null;
  if (!date) {
    textEl.textContent = "Konfiguration: Standard";
    return;
  }
  textEl.textContent = `Konfiguration: angepasst (${date.toLocaleDateString()} ${date.toLocaleTimeString()})`;
}

/* DASHBOARD */

function fillDashboard() {
  const todayList = document.getElementById("today-list");
  todayList.innerHTML = "";

  const items = [
    { label: "Aktive Prozesse", value: `4 von ${config.maxProcesses}` },
    { label: "Überfällige Tasks", value: "1 (Rückfrage)" },
    { label: "Offene Freigaben", value: "2" }
  ];

  items.forEach(it => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="label">${it.label}</span><span class="value">${it.value}</span>`;
    todayList.appendChild(li);
  });

  const loadFill = document.getElementById("supervisor-load-fill");
  const loadLabel = document.getElementById("supervisor-load-label");
  const hint = document.getElementById("autoscale-hint");

  const active = 4;
  const pct = Math.min(100, Math.round((active / config.maxProcesses) * 100));
  loadFill.style.width = pct + "%";
  loadLabel.textContent = `${pct} % Auslastung`;

  let hintText = "Auto-Scaling nicht nötig";
  if (pct >= 80 && config.autoscale !== "off") {
    hintText = "Hohe Last – weitere Worker-Agenten empfohlen";
  } else if (pct >= 80) {
    hintText = "Hohe Last – Auto-Scaling derzeit deaktiviert";
  } else if (pct >= 60) {
    hintText = "Mittlere Last – beobachten";
  }
  hint.textContent = hintText;

  const systemList = document.getElementById("system-status-list");
  systemList.innerHTML = "";
  [
    "Supervisor online",
    "8 Worker aktiv",
    config.confirmCritical ? "Kritische Aktionen: Freigabe erforderlich" : "Kritische Aktionen: Freigabe optional",
    `Log-Rotation: ${config.logRetention}`
  ].forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    systemList.appendChild(li);
  });

  const activityEl = document.getElementById("activity-log");
  activityEl.innerHTML = "";
  const now = new Date();
  const demo = [
    { mins: 2, text: "Writer-1: Entwurf für Bericht erstellt", tag: "Writer" },
    { mins: 7, text: "Planner: Wochenplanung aktualisiert", tag: "Planner" },
    { mins: 15, text: "Supervisor: Aufgabe als „gelb“ eingestuft", tag: "Supervisor" },
    { mins: 23, text: "Data: Tabelle bereinigt", tag: "Data" }
  ];
  demo.forEach(d => {
    const li = document.createElement("li");
    const t = new Date(now.getTime() - d.mins * 60000);
    const timeStr = t.toTimeString().slice(0, 5);
    li.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-text">${d.text}</span>
      <span class="log-tag">${d.tag}</span>
    `;
    activityEl.appendChild(li);
  });

  fillAgentStatusGrid();
}

/* AGENTEN */

function getAgentDefinitions() {
  return [
    { name: "Writer-1", role: "Texterstellung", status: "busy", statusLabel: "Verarbeitet Bericht" },
    { name: "Planner", role: "Planung", status: "ok", statusLabel: "Wartet auf neue Tasks" },
    { name: "Data", role: "Daten", status: "busy", statusLabel: "Bereinigt Tabelle" },
    { name: "Research", role: "Recherche", status: "idle", statusLabel: "Bereit" },
    { name: "Support", role: "Kommunikation", status: "ok", statusLabel: "Monitoring" },
    { name: "Workflow", role: "Abläufe", status: "ok", statusLabel: "1 aktiver Workflow" },
    { name: "Creative", role: "Visualisierung", status: "idle", statusLabel: "Bereit" },
    { name: "Tech", role: "Technik", status: "ok", statusLabel: "Bereit" }
  ];
}

function fillAgentStatusGrid() {
  const grid = document.getElementById("agent-status-grid");
  grid.innerHTML = "";
  const agents = getAgentDefinitions();
  agents.forEach(a => {
    const div = document.createElement("div");
    const statusClass =
      a.status === "busy" ? "status-busy" :
      a.status === "blocked" ? "status-blocked" :
      a.status === "ok" ? "status-ok" : "status-idle";
    div.className = "agent-chip";
    div.innerHTML = `
      <div class="agent-chip-header">
        <span class="agent-name">${a.name}</span>
        <span class="agent-role">${a.role}</span>
      </div>
      <div class="agent-status">
        <span class="status-dot ${statusClass}"></span>
        <span>${a.statusLabel}</span>
      </div>
    `;
    grid.appendChild(div);
  });
}

function fillAgents() {
  const list = document.getElementById("agent-list");
  list.innerHTML = "";
  const agents = getAgentDefinitions();
  agents.forEach(a => {
    const row = document.createElement("div");
    row.className = "agent-row";
    row.innerHTML = `
      <div class="agent-row-main">
        <span class="agent-row-name">${a.name}</span>
        <span class="agent-row-meta">${a.role}</span>
      </div>
      <div class="agent-row-side">
        <span>${a.statusLabel}</span>
      </div>
    `;
    list.appendChild(row);
  });
}

/* WORKFLOWS */

function fillWorkflows() {
  const list = document.getElementById("workflow-list");
  list.innerHTML = "";
  const workflows = [
    { name: "Monatsbericht", desc: "Daten sammeln → Entwurf → Freigabe", tag: "gelb" },
    { name: "Standard-E-Mail", desc: "Entwurf anlegen → Prüfung", tag: "gelb" },
    { name: "Interner Report", desc: "Daten → Analyse → Zusammenfassung", tag: "grün" }
  ];
  workflows.forEach(w => {
    const row = document.createElement("div");
    row.className = "workflow-row";
    row.innerHTML = `
      <div>
        <div>${w.name}</div>
        <div class="small-text">${w.desc}</div>
      </div>
      <div><span class="log-tag">${w.tag}</span></div>
    `;
    list.appendChild(row);
  });

  document.getElementById("btn-add-workflow")
    ?.addEventListener("click", () => {
      alert("In dieser Demo können Workflows noch nicht bearbeitet werden.");
    });
}

/* LOGS */

function fillLogs() {
  const list = document.getElementById("audit-log");
  list.innerHTML = "";
  const events = [
    "Supervisor-Konfiguration geladen",
    "Standardagenten initialisiert",
    "Log-Rotation geprüft",
    "Keine Konflikte in den Rollenrechten gefunden"
  ];
  const now = new Date();
  events.forEach((e, i) => {
    const t = new Date(now.getTime() - (i + 1) * 3600000);
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="log-time">${t.toLocaleDateString()} ${t.toTimeString().slice(0,5)}</span>
      <span class="log-text">${e}</span>
      <span class="log-tag">System</span>
    `;
    list.appendChild(li);
  });
}
// ===========================
// Supervisor Chat & Logic
// ===========================

let svMessages = [];
let svLogs = window.hcLogs || []; // falls schon vorhanden
let svWorkflows = window.hcWorkflows || [];
let svMuted = false;
let svAttachedFile = null;

// DOM-Refs warten, bis DOM geladen ist
document.addEventListener("DOMContentLoaded", () => {
  const svToggleBtn = document.getElementById("sv-toggle-btn");
  const svPanel = document.getElementById("sv-chat-panel");
  const svCloseBtn = document.getElementById("sv-close-btn");
  const svMuteBtn = document.getElementById("sv-mute-btn");
  const svBody = document.getElementById("sv-chat-body");
  const svInput = document.getElementById("sv-input");
  const svSendBtn = document.getElementById("sv-send-btn");
  const svFileInput = document.getElementById("sv-file-input");
  const svAttachmentInfo = document.getElementById("sv-attachment-info");

  const svPopup = document.getElementById("sv-popup");
  const svPopupContent = document.getElementById("sv-popup-content");
  const svPopupText = document.getElementById("sv-popup-text");
  const svPopupClose = document.getElementById("sv-popup-close");

  // Helper: Chat Panel toggeln
  function toggleSvPanel(forceOpen) {
    if (!svPanel) return;
    const isHidden = svPanel.classList.contains("hidden");
    const shouldOpen = forceOpen ? true : isHidden;
    if (shouldOpen) {
      svPanel.classList.remove("hidden");
      svToggleBtn?.classList.add("sv-open");
    } else {
      svPanel.classList.add("hidden");
      svToggleBtn?.classList.remove("sv-open");
    }
  }

  // Helper: Sound (nur für Alarm)
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
      // Audio optional – bei Fehler einfach ignorieren
    }
  }

  // Helper: Chat rendern
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

  // Helper: Logs (optional mit vorhandenen UI verknüpfen)
  function addSvLog(source, type, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      source,
      type,
      message,
      context,
    };
    svLogs.push(entry);
    window.hcLogs = svLogs;
    // Wenn du schon eine Funktion hast, die Logs rendert, hier aufrufen:
    if (typeof window.renderLogs === "function") {
      window.renderLogs(svLogs);
    }
  }

  // Helper: Workflow hinzufügen (Demo)
  function addSvWorkflow(name, type, zone, origin, extra = {}) {
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
    svWorkflows.push(wf);
    window.hcWorkflows = svWorkflows;
    if (typeof window.renderWorkflows === "function") {
      window.renderWorkflows(svWorkflows);
    }
    return wf;
  }

  // Popup anzeigen
  function svShowPopup(severity, text) {
    if (!svPopup || !svPopupContent || !svPopupText) return;
    svPopupText.textContent = text;
    svPopupContent.classList.remove(
      "sv-popup-success",
      "sv-popup-ask",
      "sv-popup-alarm"
    );
    if (severity === "success") {
      svPopupContent.classList.add("sv-popup-success");
    } else if (severity === "ask") {
      svPopupContent.classList.add("sv-popup-ask");
    } else if (severity === "alarm") {
      svPopupContent.classList.add("sv-popup-alarm");
    }
    svPopup.classList.remove("hidden");

    if (severity === "success") {
      // Auto-Close nach 3 Sekunden
      setTimeout(() => {
        svPopup.classList.add("hidden");
      }, 3000);
    }

    if (severity === "alarm") {
      playAlarm();
      toggleSvPanel(true); // Chat automatisch öffnen
    }
  }

  // Supervisor-Nachricht erzeugen (Chat + Popup optional + Logs)
  function svNotify(severity, text, options = {}) {
    const { popup = false, source = "Supervisor", logType = "info" } = options;

    svMessages.push({
      from: "sv",
      text,
      severity,
      timestamp: new Date().toISOString(),
    });
    renderSvMessages();

    addSvLog(source, logType, text);

    if (popup) {
      svShowPopup(severity, text);
    }
  }

  // User-Eingabe an SV
  function handleSvUserInput() {
    const raw = svInput.value.trim();
    if (!raw && !svAttachedFile) return;

    if (raw) {
      svMessages.push({
        from: "user",
        text: raw,
        severity: "normal",
        timestamp: new Date().toISOString(),
      });
    }
    renderSvMessages();

    const cmd = raw.toLowerCase();

    // simple Command-Parsing
    if (svAttachedFile) {
      const file = svAttachedFile;
      svAttachedFile = null;
      svAttachmentInfo.classList.add("hidden");
      svAttachmentInfo.textContent = "";

      // Datei-Workflow anlegen (immer mind. gelb)
      const wfName = `Dokument: ${file.name}`;
      addSvWorkflow(wfName, "document", "yellow", "sv-chat", {
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
      addSvWorkflow(wfName, "generic", "yellow", "sv-chat");
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
      const load = 35 + Math.floor(Math.random() * 25); // Demo
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

  // Datei-Auswahl
  if (svFileInput) {
    svFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      svAttachedFile = file;
      svAttachmentInfo.textContent = `Angehängte Datei: ${file.name} (Demo – es wird kein echter Upload durchgeführt)`;
      svAttachmentInfo.classList.remove("hidden");

      svNotify(
        "success",
        `Datei „${file.name}“ beim Supervisor vorgemerkt. Sende jetzt einen Auftrag, z.B. „Entwurf für diesen Antrag vorbereiten“.`,
        { popup: false, logType: "info" }
      );
    });
  }

  // Events

  svToggleBtn?.addEventListener("click", () => toggleSvPanel());
  svCloseBtn?.addEventListener("click", () => toggleSvPanel(false));

  svMuteBtn?.addEventListener("click", () => {
    svMuted = !svMuted;
    svMuteBtn.textContent = svMuted ? "🔕" : "🔔";
  });

  svSendBtn?.addEventListener("click", handleSvUserInput);
  svInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSvUserInput();
    }
  });

  svPopupClose?.addEventListener("click", () => {
    svPopup.classList.add("hidden");
  });

  // Initiale Begrüßung
  svNotify(
    "success",
    "Supervisor bereit. Du kannst Workflows starten, Dokumente als Entwurf übernehmen und die aktuelle Auslastung abfragen. HumanCore 1.0 arbeitet im sicheren Demo-Modus – keine echte Außenkommunikation.",
    { popup: false, logType: "info" }
  );
});
