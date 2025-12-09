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
- verarbeitet Nutzereingaben  
- erkennt kritische Vorgänge (rot)  
- stellt Rückfragen (blau)  
- bestätigt Erfolg (grün)  
- legt Workflows an  
- führt vollständiges Logging  
- öffnet automatische Popups bei Alarmmeldungen  
- kann Dateien entgegennehmen (Demo-Modus)

### **2. Acht Worker-Agenten (vordefinierte Rollen)**

| Agent | Aufgabe |
|-------|---------|
| Writer | Texte, Entwürfe, Beschreibungen |
| Planner | Planung, Struktur, Prioritäten |
| Data | Tabellen, Listen, Zusammenstellungen |
| Research | Recherche & Orientierung (Demo) |
| Support | Standardantworten, Servicebausteine |
| Workflow | Prozessschritte & Statussimulation |
| Creative | Layouts, Visualisierungen (statisch) |
| Tech | Formatierung, Konvertierung (Demo) |

Alle Worker arbeiten **streng begrenzt**, immer im Entwurfsmodus  
und ohne echte Systemzugriffe.

---

## 🖥️ UI-Module

- **Dashboard**  
- **Supervisor-Chat** (Hauptinteraktionspunkt)  
- **Workflows**  
- **Logs/Audit**  
- **Agentenübersicht**  
- **Wizard** (Konfigurationsvorschau)  

Die UI ist vollständig clientseitig (HTML/CSS/JS) und benötigt kein Backend.

---

## 📎 Datei-Upload (Demo-Modus)

Über den 📎-Button im Supervisor-Chat können Dateien ausgewählt werden.

- Dateien werden **nicht hochgeladen**  
- sondern nur als „Entwurfs-Workflows“ registriert  
- ideal zum Testen von Prozessabläufen  

---

## 🎨 Farbcodiertes Feedback

- 🟢 **Erfolg** – Workflow angelegt  
- 🟦 **Nachfrage** – unklarer Auftrag  
- 🔴 **Kritischer Vorgang** – (Behörde/Finanzen), wird blockiert  
- 🔔 **Akustischer Alarm** (abschaltbar)

---

## 💬 Beispiele für SV-Befehle

```text
Starte Workflow "Kundenbericht"
Wie hoch ist die aktuelle Auslastung?
Bereite einen Entwurf für diesen Antrag vor.
Schick das an die Behörde    ← (Alarm – blockiert)
Hilfe
