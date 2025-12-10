TECH_SNAPSHOT_v1.0.md

HumanCore 1.0 – Technischer Snapshot
Release-Tag: v1.0.0
Status: Stabil • Demo-Version • Browser-only

🧭 1. Gesamtüberblick

HumanCore 1.0 ist eine rein clientseitige Demo eines Multi-Agent Supervisors.
Alle Funktionen laufen im Browser ohne Backend, API oder Server.

Bestandteile:

index.html    – UI-Struktur
style.css     – Layout, Design, UI-Komponenten
app.js        – Logik, State, Events, Workflow-System, SV-Chat
logo.png      – Branding
README.md     – Projektbeschreibung
TECH_SNAPSHOT_v1.0.md – technische Dokumentation
LICENSE       – Lizenz


HumanCore 1.0 bildet die stabile Basis, auf der spätere Versionen (1.1 ff.) aufbauen.

🧱 2. HTML-Architektur

Die Oberfläche besteht aus fünf klar getrennten Tabs:

Tab	DOM-ID	Zweck
Dashboard	#dashboard	Systemstatus, Überblick
Wizard	#wizard	Config-Erstellung (Demo)
Workflows	#workflows	Workflow-Tabelle
Logs	#logs	System-Logs
Konfiguration	#config	Wizard-Konfiguration anzeigen

Jeder Tab ist ein eigener Abschnitt:

<section id="dashboard" class="page-section active">…</section>
<section id="wizard" class="page-section">…</section>
<section id="workflows" class="page-section">…</section>
<section id="logs" class="page-section">…</section>
<section id="config" class="page-section">…</section>


Navigation:

<button class="nav-btn" data-target="dashboard">Dashboard</button>
<button class="nav-btn" data-target="wizard">Wizard</button>
<button class="nav-btn" data-target="workflows">Workflows</button>
<button class="nav-btn" data-target="logs">Logs</button>
<button class="nav-btn" data-target="config">Konfiguration</button>

🎨 3. CSS-Grundlagen

Schlüsselfunktionen:

.page-section { display: none; }
.page-section.active { display: block; }
.nav-btn.active { background-color: var(--primary); }


Wichtige Komponenten:

Karten-Layout (.card, .card-grid)

Workflow-/Log-Tabellen

Pill-Styling für Status & Zonen

Popup-System (.sv-popup)

Supervisor-Chat (.sv-panel)

Kein externes Framework. Keine Abhängigkeiten.

⚙️ 4. JavaScript-Architektur

Die vollständige Logik steckt in app.js, gegliedert in:

4.1 Globale Datenstrukturen
var hcWorkflows = [];
var hcLogs = [];

4.2 Logging-System
addLog(source, type, message, context)


erzeugt Log-Objekt

speichert es in hcLogs

aktualisiert UI (renderLogs())

Logs werden sortiert angezeigt (neueste oben).

4.3 Workflow-System

Ein Workflow hat folgende Struktur:

{
  id: "...",
  name: "...",
  type: "generic" | "document",
  zone: "yellow" | "red" | "green",
  status: "planned" | "running" | "waiting" | "done",
  origin: "SV" | "Wizard",
  meta: {},
  createdAt: ISOString,
  updatedAt: ISOString
}


Erzeugung:

addWorkflow(name, type, zone, origin, meta)


UI-Rendering:

renderWorkflows()


Funktionen:

Tabelle befüllt

Badges/Zähler aktualisiert

Dashboard aktualisiert

4.4 Navigation (Tab-System)
document.querySelectorAll(".nav-btn").forEach(...)


Tabs wechseln:

page-section.active wird gesetzt

alle anderen Sections deaktiviert

aktiver Button bekommt .active

Keine Scroll-Navigation mehr.

🤖 4.5 Supervisor-Chat (SV)

Simulation eines Supervisor-Agenten.

Funktionen:

Chat-Interface

Popup-System (grün / blau / rot)

Dateiannahme

Meldungen & Reaktionen

einfache Befehle:

Befehl enthält	Reaktion
"workflow" / "bericht"	legt Workflow an
"behörde" / "finanz"	Alarm (rote Meldung)
"auslastung"	simulierte % Anzeige
"hilfe"	zeigt Hilfetext
"reset"	Chatverlauf löschen
Datei angehängt	erzeugt Dokument-Workflow

Alles rein clientseitig → kein Upload, keine API.

🧰 4.6 Wizard-System

Erstellt Demo-Konfiguration:

{
  "profileName": "Standard",
  "autonomyLevel": "1",
  "requireConfirmationForCritical": true,
  "generatedAt": "..."
}


wird im Wizard-Feld angezeigt

wird in #config-box gespiegelt

erzeugt Log-Eintrag

🧪 5. Einschränkungen der 1.0-Version

keine Persistenz (Reload löscht alles)

keine echten Agenten

keine Worker-Simulation

keine API-Anbindung

keine Sicherheitsmodelle

keine Import/Export-Funktion

keine Benutzerverwaltung

Das ist gewollt: HumanCore 1.0 ist eine UI-Demo, keine autonome KI.

🚀 6. Erweiterungspotenzial (für 1.1–2.0)

Folgende Features sind geplant:

6.1 Worker-Simulation

Busy/Idle Status

Aufgaben aus Workflows annehmen

Logs erzeugen

Statuswechsel automatisieren

6.2 Workflow Engine 2.0

Statuswechsel planned → running → done

Bearbeitungsdauer simulieren

Worker-Zuweisung

6.3 Supervisor-Kern 2.0

Queue-Management

Risiko- und Zonenhandling

Regeln für kritische Aktionen

6.4 Datenpersistenz

Speicherung in localStorage

Wiederherstellung nach Reload

6.5 Profil- & Config-System

mehrere Konfigurationen

Import/Export

Laufende Konfigurationswechsel

6.6 Agenten, die Agenten erzeugen

Meta-Agent / Team-Builder.

🧩 7. Integritäts-Checkliste

Damit der aktuelle Build korrekt läuft:

index.html enthält 5 Sections (#dashboard, #wizard, #workflows, #logs, #config)

style.css enthält .page-section.active & .nav-btn.active

app.js enthält:

Navigation

Wizard

Workflows

Logs

SV-Chat

app.js wird korrekt geladen → <script src="app.js"></script>

Browser-Cache nach Updates leeren (Strg+F5)

🎉 Fazit

HumanCore 1.0 ist:

stabil

klar strukturiert

logisch getrennt

UI-funktional

perfekt geeignet als Grundlage für spätere Agenten- und Worker-Logik

Damit ist Version v1.0.0 vollständig dokumentiert und als stabiler Architektur-Stand eingefroren.
