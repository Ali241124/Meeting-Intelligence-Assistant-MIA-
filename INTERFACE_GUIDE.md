# Meeting Intelligence Assistant - Interface Guide

## Quick Demo Script

### 1. Dashboard (Starting Screen)
**What users see first:**
- Welcome banner with "New Analysis" button
- Live metrics: Total Analyses, Decisions Extracted, Action Items, Risks Identified
- Recent Analyses history (session-based)

**Key action:** Click "New Analysis" to start

---

### 2. New Analysis Screen
**Purpose:** Input meeting transcript for analysis

**Features:**
- **Meeting Info:** Optional title, date, participants
- **Transcript Editor:** Large text area for pasting meeting notes
- **File Upload:** Drag & drop .txt, .md, .json, .csv files
- **Test Scenarios Bar:** 5 built-in scenarios + custom scenarios (click to load)
- **Analyze Button:** Starts the extraction process

**Demo flow:**
1. Click a scenario pill (e.g., "Scenario 1: E-commerce Launch")
2. Transcript auto-loads into editor
3. Click "Analyze" button
4. Watch 4-stage progress indicator

---

### 3. Results Workspace
**Purpose:** View and edit extracted intelligence

**Sections:**
- **Executive Summary:** AI-generated overview
- **Confirmed Decisions:** Key decisions with evidence quotes
- **Action Items Table:** Editable tasks with owner, deadline, priority
- **Operational Risks:** Identified risks with evidence
- **Ambiguities & Conflicts:** Conflicting information
- **Open Questions:** Unanswered items

**Key features:**
- Click "Trace Transcript Evidence" to see source quotes
- Edit any cell in the Action Items table
- Add/delete tasks as needed
- Switch between Visual Editor and JSON Editor modes

---

### 4. Export Options
**Actions available:**
- **Save as Scenario:** Save current transcript as a test scenario (for later auditing)
- **Export JSON:** Download full analysis as JSON file
- **Export CSV:** Download action items as spreadsheet
- **Copy JSON:** Copy to clipboard

---

### 5. Compliance Audit
**Purpose:** Run quality checks on the system

**Two modes:**
1. **Audit Current Meeting:** Check the currently viewed analysis for quality (evidence, null safety, etc.)
2. **Start Automated Audit:** Run regression test across all scenarios (5 built-in + custom)

**What it checks:**
- Every extracted item has evidence
- Null values preserved for missing fields
- Valid JSON structure
- No empty strings in place of null
- Decision vs proposal classification
- Conflicting delivery dates
- Adversarial prompt injection immunity

**Access:** Click "Audit Scorecard" in header or "Audit" button on scenario cards

---

### 6. Scenarios View
**Purpose:** Browse and manage test scenarios

**Shows:**
- 5 built-in benchmark scenarios
- Custom scenarios you've saved
- Each scenario: ID, category, title, description, participants

**Actions:**
- **Load in Editor:** Load scenario transcript for analysis
- **Audit:** Run compliance audit on that specific scenario

---

### 7. Settings
**Purpose:** Configure LLM provider and API keys

**Options:**
- Provider: Groq, OpenAI, or Simulation
- Model selection (provider-dependent)
- API key input
- View system prompt

---

## Typical User Workflow

1. **Start:** Open dashboard
2. **Input:** Load a scenario or paste custom transcript
3. **Analyze:** Click "Analyze" to extract intelligence
4. **Review:** Check results, edit if needed
5. **Export:** Download JSON/CSV or save as scenario
6. **Audit:** Run compliance audit to verify quality

---

## Key Concepts

- **Session History:** Recent analyses stored in browser session (clears on browser close)
- **Custom Scenarios:** Saved to `custom_scenarios.json` (persists across restarts)
- **Evidence Trace:** Every extracted item links back to source transcript
- **Null Safety:** Missing information explicitly marked as null, not invented
- **Zero Hallucination:** System only states facts from transcript
