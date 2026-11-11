# Meeting Intelligence Assistant (MIA)

> **Enterprise AI Meeting Intelligence Platform — FastAPI + React + TypeScript**  
> Converts unstructured meeting transcripts into structured, verifiable business intelligence (decisions, action items, risks, open questions, and ambiguities) with an **8-layer prompt architecture**, strict **zero-hallucination null enforcement**, and a modern **dark-mode SaaS interface**.

---

## Architecture Overview

```text
meeting-intelligence-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── health.py        # GET /api/v1/health
│   │   │       ├── analyze.py       # POST /api/v1/analyze & POST /api/v1/evaluate
│   │   │       └── scenarios.py     # GET /api/v1/scenarios
│   │   ├── core/
│   │   │   └── config.py            # Pydantic Settings & environment config
│   │   ├── schemas/
│   │   │   └── meeting.py           # Pydantic schemas (Output Contract)
│   │   ├── services/
│   │   │   ├── analyzer.py          # Orchestrates prompt, LLM call, validation
│   │   │   ├── llm_provider.py      # Groq, OpenAI, and Deterministic Simulation
│   │   │   └── validator.py         # JSON cleaning, parsing, and repair
│   │   ├── data/
│   │   │   └── scenarios.py         # Five MoinSystems evaluation meeting transcripts
│   │   └── prompts/
│   │       └── meeting_analysis_prompt.md  # 8-Layer Prompt Architecture
│   ├── tests/
│   │   └── test_schemas.py          # Schema null-preservation unit tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation, session history & status
│   │   │   ├── Header.tsx           # Breadcrumb, audit trigger, settings trigger
│   │   │   ├── ScorecardModal.tsx   # 5-scenario automated audit modal
│   │   │   ├── SettingsModal.tsx    # Provider, model, API key & prompt viewer
│   │   │   └── ScenariosView.tsx    # Scenario pack browser
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Screen 1: Live operational metrics & session history
│   │   │   ├── NewAnalysis.tsx      # Screen 2: Meeting info, editor, scenarios, upload, progress
│   │   │   └── ResultsWorkspace.tsx # Screen 3 & 4: Decisions, editable table, risks, Visual & JSON editors
│   │   ├── services/
│   │   │   └── api.ts               # Typed API client for FastAPI
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces for data contract
│   │   ├── App.tsx                  # Root state & view controller
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind base + custom styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── evaluation/
│   ├── evaluation_notes.md          # Detailed v1 -> v2 prompt engineering log
│   ├── run_evals.py                 # Automated CLI benchmark (32/32 checks pass)
│   └── sample_outputs.json          # Pre-computed samples for all 5 scenarios
├── .env.example
├── .gitignore
└── README.md
```

---

## Quickstart Guide

### 1. Backend Setup (FastAPI)
In a PowerShell terminal:
```powershell
cd Meeting-Intelligence-Assistant
pip install -r requirements.txt
```

Add your Groq API key in `.env` (optional, can also be entered in the UI):
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the FastAPI server:
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation is available at: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React + TypeScript + Vite)
In a second terminal:
```powershell
cd Meeting-Intelligence-Assistant\frontend
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173/`**

*(Note: The production build is also compiled into `frontend/dist/` and served automatically by FastAPI directly at `http://127.0.0.1:8000/`).*

---

## Functional Requirements & UI Screens

### Screen 1 — Executive Dashboard
- **Welcome banner** with quick-action "New Analysis".
- **Dynamic Session Metrics** calculated in real time:
  - Total Analyses in current session.
  - Confirmed Decisions extracted.
  - Action Items Extracted with verifiable quotes.
  - Operational Risks Identified.
- **Recent Analyses History**: Allows instant resumption of prior analyses during the session.

### Screen 2 — New Meeting Analysis
- **Meeting Information**: Optional Title, Meeting Date, and Participants.
- **Transcript Editor**: Large text area with character counter and sample prompt placeholder.
- **Document Uploader**: Click or drag-and-drop `.txt`, `.md`, `.json`, `.csv`, `.log` files to automatically load transcripts.
- **Scenario Selector Bar**: 1-click loading of all 5 MoinSystems evaluation scenarios.
- **Progressive Loading Stages**:
  1. *Reading meeting transcript...*
  2. *Identifying decisions and commitments...*
  3. *Extracting owners and deadlines...*
  4. *Validating structured output with Pydantic...*

### Screen 3 — Results Workspace
- **Executive Summary** card.
- **Confirmed Decisions** with expandable *Trace Transcript Evidence* buttons.
- **Action Items Table**:
  - Interactive cells for Task, Owner, Deadline, Priority.
  - Traceable quote pill for each task.
  - Delete and "+ Add Task" actions.
- **Operational Risks**: Colored amber/red with evidence accordion.
- **Ambiguities & Competing Claims**: Explicitly records conflicts (e.g. Tuesday verbal vs Friday tracker).
- **Open Questions**: Unanswered items with responsible person tag.

### Screen 4 — Two-Mode Review & Edit
- **Visual Editor**: Inline table inputs, dropdowns, and card editing.
- **JSON Editor**: Real-time editable raw JSON with syntax verification before applying changes.

### Screen 5 — Verified Export
- **Export JSON**: Downloads the user-reviewed version.
- **Export CSV**: Formatted spreadsheet of all action items (`Task, Owner, Deadline, Priority, Evidence`).
- **Copy JSON**: 1-click clipboard export.

---

## Automated Scorecard & Regression Testing

Run the automated evaluation suite across all 5 benchmark meetings:
```powershell
python evaluation\run_evals.py
```

Expected result:
```text
════════════════════════════════════════════════════════════
  Meeting Intelligence Assistant — Benchmark Runner
  Prompt version : v2
════════════════════════════════════════════════════════════
Scenario 1: E-commerce Launch Readiness             8/8 (100.0%)
Scenario 2: Software Release Planning               6/6 (100.0%)
Scenario 3: Sales Pipeline Review                   6/6 (100.0%)
Scenario 4: Operations Escalation: Warehouse        5/5 (100.0%)
Scenario 5: Adversarial Product Strategy Meeting    7/7 (100.0%)
════════════════════════════════════════════════════════════
  Overall compliance: 32/32 (100.0%)
════════════════════════════════════════════════════════════
```

Unit tests for schema null preservation:
```powershell
python backend\tests\test_schemas.py
```
