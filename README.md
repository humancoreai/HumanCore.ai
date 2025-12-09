<p align="center">
  <img src="logo.png" alt="HumanCore.ai Logo" width="220">
</p>

# HumanCore.ai – Multi-Agent Supervisor System (Demo UI)

HumanCore.ai ist ein offenes, modular aufgebautes **Multi-Agent-Steuersystem**, das zeigt,  
wie ein zentraler Supervisor komplexe Arbeitsabläufe koordinieren, Workflows auslösen,  
Ereignisse auswerten und Risiken bewerten kann – unterstützt durch spezialisierte Worker-Agenten.

Das Projekt dient als **UI-Demonstration** und **Konzeptstudie**, wie moderne KI-Systeme  
in Unternehmen, Verwaltung und Alltagsprozessen eingesetzt werden können.

👉 **Live-Demo:**  
https://humancoreai.github.io/HumanCore.ai/

---

## 🚀 Features (HumanCore 1.0 – Demo)

### **1. Supervisor-Konsole (SV)**
Der Supervisor:

- verarbeitet Eingaben  
- erkennt kritische Vorgänge (rot)  
- stellt Rückfragen (blau)  
- bestätigt Erfolg (grün)  
- legt Workflows an  
- führt vollständiges Logging  
- öffnet automatische Popups bei Alarmmeldungen  
- akzeptiert Datei-Uploads (Demo-Modus)

### **2. Acht Worker-Agenten (feste Rollen)**

| Agent | Aufgabe |
|-------|---------|
| Writer | Texte, Entwürfe, Beschreibungen |
| Planner | Planung, Struktur, Prioritäten |
| Data | Tabellen, Listen, Zusammenstellungen |
| Research | Recherche & Orientierung |
| Support | Standardantworten |
| Workflow | Prozessschritte & Status |
| Creative | Layout/Visual-Ideen |
| Tech | Formatierung, Konvertierung |

Alle Worker arbeiten **streng begrenzt**, immer im Entwurfsmodus.

---

## 🖥️ UI-Module

- Dashboard  
- Supervisor-Chat  
- Agentenübersicht  
- Workflow-Liste  
- Logs/Audit  
- Wizard (Konfigurationsvorschau)

Die komplette UI basiert auf **HTML/CSS/JavaScript** – kein Backend nötig.

---

## 📎 Datei-Upload (Demo)

Der 📎-Button im Supervisor-Chat akzeptiert Dateien.  
Diese werden **nicht hochgeladen**, sondern nur als **Entwurfs-Workflows** markiert.

---

## 🎨 Farbcodiertes Feedback

- 🟢 **Erfolg** – Workflow angelegt  
- 🟦 **Nachfrage** – unklarer Auftrag  
- 🔴 **Kritisch** – blockiert (Behörde/Finanzen)  
- 🔔 **Signalton** (abschaltbar)

---

## 💬 Beispiele für SV-Befehle

```text
Starte Workflow "Kundenbericht"
Wie hoch ist die aktuelle Auslastung?
Bereite einen Entwurf für diesen Antrag vor.
Schick das an die Behörde    ← Alarm (blockiert)
Hilfe
