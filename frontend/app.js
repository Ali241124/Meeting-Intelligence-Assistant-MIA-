/* ══════════════════════════════════════════════════════
   Executive Meeting Hub — Frontend Application Logic
   ══════════════════════════════════════════════════════ */

'use strict';

// ── State ─────────────────────────────────────────────
let scenarios   = [];
let prompts     = { v1: '', v2: '' };
let currentData = null;

// ── DOM refs ──────────────────────────────────────────
const btnToggleSettings = document.getElementById('btnToggleSettings');
const configDrawer      = document.getElementById('configDrawer');
const cfgProvider       = document.getElementById('cfgProvider');
const cfgModel          = document.getElementById('cfgModel');
const cfgPromptVersion  = document.getElementById('cfgPromptVersion');
const cfgApiKey         = document.getElementById('cfgApiKey');
const cfgStatus         = document.getElementById('cfgStatus');
const btnToggleKey      = document.getElementById('btnToggleKey');

// Upload & Inputs
const scenarioPills     = document.getElementById('scenarioPills');
const uploadDropzone    = document.getElementById('uploadDropzone');
const fileUploadInput   = document.getElementById('fileUploadInput');
const uploadedFileBadge = document.getElementById('uploadedFileBadge');
const uploadedFileName  = document.getElementById('uploadedFileName');
const btnRemoveFile     = document.getElementById('btnRemoveFile');
const transcript        = document.getElementById('transcript');
const charCounter       = document.getElementById('charCounter');
const inputHint         = document.getElementById('inputHint');
const btnClear          = document.getElementById('btnClear');
const btnAnalyze        = document.getElementById('btnAnalyze');
const btnAnalyzeLabel   = document.getElementById('btnAnalyzeLabel');

// Results & Empty state
const emptyState        = document.getElementById('emptyState');
const resultsContent    = document.getElementById('resultsContent');
const resultTitle       = document.getElementById('resultTitle');
const modeTag           = document.getElementById('modeTag');
const summaryBanner     = document.getElementById('summaryBanner');

const cntDecisions      = document.getElementById('cntDecisions');
const cntActions        = document.getElementById('cntActions');
const cntRisks          = document.getElementById('cntRisks');
const cntAmbiguities    = document.getElementById('cntAmbiguities');
const cntQuestions      = document.getElementById('cntQuestions');

const decisionsArea     = document.getElementById('decisionsArea');
const actionsTbody      = document.getElementById('actionsTbody');
const risksArea         = document.getElementById('risksArea');
const ambiguitiesArea   = document.getElementById('ambiguitiesArea');
const questionsArea     = document.getElementById('questionsArea');

const btnAddTask        = document.getElementById('btnAddTask');
const btnCopyJson       = document.getElementById('btnCopyJson');
const btnExportJson     = document.getElementById('btnExportJson');
const btnExportCsv      = document.getElementById('btnExportCsv');

// Benchmark
const btnOpenBenchmark  = document.getElementById('btnOpenBenchmark');
const benchmarkModal    = document.getElementById('benchmarkModal');
const btnCloseBenchmark = document.getElementById('btnCloseBenchmark');
const btnRunBenchmark   = document.getElementById('btnRunBenchmark');
const benchmarkBody     = document.getElementById('benchmarkBody');

// Prompt inspector
const btnViewPrompt     = document.getElementById('btnViewPrompt');
const promptModal       = document.getElementById('promptModal');
const btnClosePrompt    = document.getElementById('btnClosePrompt');
const tabV1             = document.getElementById('tabV1');
const tabV2             = document.getElementById('tabV2');
const promptPre         = document.getElementById('promptPre');

// ── Initialise ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Restore saved config
  const saved = k => localStorage.getItem(`mia_${k}`);
  if (saved('provider'))       cfgProvider.value      = saved('provider');
  if (saved('model'))          cfgModel.value         = saved('model');
  if (saved('promptVersion'))  cfgPromptVersion.value = saved('promptVersion');
  if (saved('apiKey'))         cfgApiKey.value        = saved('apiKey');

  updateStatusBadge();

  // Settings toggle
  btnToggleSettings.addEventListener('click', () => {
    const isHidden = configDrawer.style.display === 'none';
    configDrawer.style.display = isHidden ? 'block' : 'none';
  });

  cfgProvider.addEventListener('change',      () => { ls('provider', cfgProvider.value); updateStatusBadge(); });
  cfgModel.addEventListener('change',         () => ls('model', cfgModel.value));
  cfgPromptVersion.addEventListener('change', () => ls('promptVersion', cfgPromptVersion.value));
  cfgApiKey.addEventListener('input',         () => { ls('apiKey', cfgApiKey.value); updateStatusBadge(); });

  btnToggleKey.addEventListener('click', () => {
    cfgApiKey.type = cfgApiKey.type === 'password' ? 'text' : 'password';
  });

  // Transcript events
  transcript.addEventListener('input', onTranscriptChange);
  btnClear.addEventListener('click', clearAllInput);

  // File Upload Handlers (Click + Drag-and-Drop)
  uploadDropzone.addEventListener('click', () => fileUploadInput.click());
  fileUploadInput.addEventListener('change', handleFileSelected);

  uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragover');
  });
  uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragover');
  });
  uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadDocumentFile(e.dataTransfer.files[0]);
    }
  });

  btnRemoveFile.addEventListener('click', () => {
    uploadedFileBadge.style.display = 'none';
    fileUploadInput.value = '';
    transcript.value = '';
    onTranscriptChange();
  });

  btnAnalyze.addEventListener('click', runAnalysis);

  // Exports
  btnAddTask.addEventListener('click', addBlankTask);
  btnExportJson.addEventListener('click', exportJson);
  btnExportCsv.addEventListener('click',  exportCsv);
  btnCopyJson.addEventListener('click',   copyJson);

  // Benchmark
  btnOpenBenchmark.addEventListener('click',  () => benchmarkModal.classList.add('open'));
  btnCloseBenchmark.addEventListener('click', () => benchmarkModal.classList.remove('open'));
  btnRunBenchmark.addEventListener('click',   runBenchmark);

  // Prompt viewer
  btnViewPrompt.addEventListener('click', async () => {
    await loadPrompts();
    showPromptTab('v2');
    promptModal.classList.add('open');
  });
  btnClosePrompt.addEventListener('click', () => promptModal.classList.remove('open'));
  tabV2.addEventListener('click', () => showPromptTab('v2'));
  tabV1.addEventListener('click', () => showPromptTab('v1'));

  // Close modals on overlay
  [benchmarkModal, promptModal].forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });

  // Load scenarios
  await loadScenarios();
});

function ls(k, v) { localStorage.setItem(`mia_${k}`, v); }

function updateStatusBadge() {
  const hasKey   = cfgApiKey.value.trim().length > 0;
  const isSim    = cfgProvider.value === 'simulation';
  const provider = cfgProvider.value;

  if (isSim) {
    cfgStatus.className   = 'cfg-status offline';
    cfgStatus.textContent = '● Offline Simulation';
  } else if (hasKey) {
    cfgStatus.className   = 'cfg-status online';
    cfgStatus.textContent = `● Live (${provider})`;
  } else {
    cfgStatus.className   = 'cfg-status offline';
    cfgStatus.textContent = '● Demo Mode (no key)';
  }
}

function onTranscriptChange() {
  const len = transcript.value.length;
  charCounter.textContent = `${len.toLocaleString()} characters`;
  btnAnalyze.disabled     = len === 0;

  if (len === 0) {
    inputHint.textContent = '';
  } else if (len < 80) {
    inputHint.textContent = 'Notice: Short input provided. Results may be brief.';
  } else {
    inputHint.textContent = '';
  }
}

function clearAllInput() {
  transcript.value = '';
  uploadedFileBadge.style.display = 'none';
  fileUploadInput.value = '';
  onTranscriptChange();
  setActiveScenarioPill(null);
}

// ── Document File Upload ──────────────────────────────
function handleFileSelected(e) {
  if (e.target.files && e.target.files.length > 0) {
    loadDocumentFile(e.target.files[0]);
  }
}

function loadDocumentFile(file) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const content = evt.target.result;
    transcript.value = content;
    uploadedFileName.textContent = `📄 ${file.name} (${Math.round(file.size / 1024 * 10) / 10} KB)`;
    uploadedFileBadge.style.display = 'flex';
    setActiveScenarioPill('custom');
    inputHint.textContent = `Loaded document: ${file.name}`;
    onTranscriptChange();
  };
  reader.onerror = () => {
    alert("Could not read document file. Please ensure it is a text-based format (.txt, .md, .json, .csv).");
  };
  reader.readAsText(file);
}

// ── Scenario loading & selection ──────────────────────
async function loadScenarios() {
  try {
    const res = await fetch('/api/scenarios');
    scenarios = await res.json();

    scenarioPills.addEventListener('click', e => {
      const pill = e.target.closest('.spill');
      if (!pill) return;
      const id = pill.dataset.id;

      if (id === 'custom') {
        setActiveScenarioPill('custom');
        transcript.value = '';
        uploadedFileBadge.style.display = 'none';
        onTranscriptChange();
        transcript.focus();
        return;
      }

      const sc = scenarios.find(s => s.id === parseInt(id, 10));
      if (!sc) return;

      transcript.value = sc.transcript;
      uploadedFileBadge.style.display = 'none';
      onTranscriptChange();
      setActiveScenarioPill(id);
      inputHint.textContent = `Loaded preset: ${sc.title}`;
    });

    // Auto-select Scenario 1
    const sc1 = scenarios[0];
    if (sc1) {
      transcript.value = sc1.transcript;
      onTranscriptChange();
      setActiveScenarioPill('1');
      inputHint.textContent = `Loaded preset: ${sc1.title}`;
    }
  } catch (err) {
    console.error('Failed to load scenarios:', err);
  }
}

function setActiveScenarioPill(id) {
  document.querySelectorAll('.spill').forEach(p => {
    p.classList.toggle('active', p.dataset.id === id);
  });
}

async function loadPrompts() {
  if (prompts.v2) return;
  try {
    const res = await fetch('/api/prompts');
    prompts = await res.json();
  } catch { /* ignore */ }
}

function showPromptTab(v) {
  tabV2.classList.toggle('active', v === 'v2');
  tabV1.classList.toggle('active', v === 'v1');
  promptPre.textContent = prompts[v] || 'Loading...';
}

// ── Core Extraction Execution ─────────────────────────
async function runAnalysis() {
  const text = transcript.value.trim();
  if (!text) return;

  setLoading(true);
  setStatus('Processing...', 'offline');

  const payload = {
    transcript:     text,
    provider:       cfgProvider.value,
    model:          cfgModel.value,
    api_key:        cfgApiKey.value.trim() || null,
    prompt_version: cfgPromptVersion.value,
  };

  try {
    const res = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Analysis failed');

    currentData = json.data;
    renderResults(json.data, json.metadata);
    setStatus('Ready', 'online');
  } catch (err) {
    console.error(err);
    alert(`Processing error: ${err.message}`);
    setStatus('Error', 'error');
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  btnAnalyze.disabled = loading;
  btnAnalyzeLabel.innerHTML = loading
    ? '<span class="spinner"></span> Processing Record…'
    : 'Process Meeting Record';
}

function setStatus(msg, cls) {
  cfgStatus.textContent = `● ${msg}`;
  cfgStatus.className   = `cfg-status ${cls}`;
}

// ── Render Structured Results ─────────────────────────
function renderResults(data, meta) {
  emptyState.style.display     = 'none';
  resultsContent.style.display = 'block';

  resultTitle.textContent   = data.meeting_title || 'Executive Meeting Record';
  modeTag.textContent       = meta ? meta.mode : '';
  summaryBanner.textContent = data.summary || '';

  renderDecisions(data.decisions || []);
  renderActions(data.action_items || []);
  renderRisks(data.risks || []);
  renderAmbiguities(data.ambiguities || []);
  renderQuestions(data.open_questions || []);

  btnExportJson.disabled = false;
  btnExportCsv.disabled  = false;
  btnCopyJson.disabled   = false;
  btnAddTask.disabled    = false;
}

/* Decisions */
function renderDecisions(items) {
  cntDecisions.textContent = items.length;
  decisionsArea.innerHTML  = '';
  if (!items.length) {
    decisionsArea.innerHTML = '<p class="empty-msg">No confirmed decisions recorded.</p>';
    return;
  }
  items.forEach((dec, i) => {
    const el = document.createElement('div');
    el.className = 'item-card';
    el.innerHTML = `
      <div class="item-main"><strong>${i + 1}.</strong> ${esc(dec.decision)}</div>
      <span class="ev-quote">"${esc(dec.evidence)}"</span>`;
    decisionsArea.appendChild(el);
  });
}

/* Action Items Table */
function renderActions(items) {
  cntActions.textContent = items.length;
  actionsTbody.innerHTML = '';
  if (!items.length) {
    actionsTbody.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color:var(--muted); padding:.9rem">
        No explicit action commitments recorded.
      </td></tr>`;
    return;
  }
  items.forEach((item, idx) => appendActionRow(item, idx));
}

function appendActionRow(item, idx) {
  const tr  = document.createElement('tr');
  const pri = item.priority || null;
  tr.innerHTML = `
    <td><input class="edit-input" value="${escAttr(item.task)}" data-idx="${idx}" data-field="task"></td>
    <td><input class="edit-input" value="${escAttr(item.owner || '')}" placeholder="null" data-idx="${idx}" data-field="owner"></td>
    <td><input class="edit-input" value="${escAttr(item.deadline || '')}" placeholder="null" data-idx="${idx}" data-field="deadline"></td>
    <td>${prioritySelect(pri, idx)}</td>
    <td><span class="ev-cell">${esc(item.evidence || '')}</span></td>`;

  tr.querySelectorAll('.edit-input').forEach(el =>
    el.addEventListener('input', e => syncAction(e.target)));
  tr.querySelectorAll('.edit-select').forEach(el =>
    el.addEventListener('change', e => syncAction(e.target)));

  actionsTbody.appendChild(tr);
}

function prioritySelect(pri, idx) {
  const opts = [
    ['', 'null'],
    ['high', 'high'],
    ['medium', 'medium'],
    ['low', 'low'],
  ].map(([v, l]) => `<option value="${v}" ${pri === v || (!pri && v === '') ? 'selected' : ''}>${l}</option>`).join('');
  return `<select class="edit-select" data-idx="${idx}" data-field="priority">${opts}</select>`;
}

function syncAction(el) {
  const idx   = parseInt(el.dataset.idx, 10);
  const field = el.dataset.field;
  const val   = el.value.trim();
  if (!currentData) return;
  if (field === 'owner' || field === 'deadline') {
    currentData.action_items[idx][field] = val === '' ? null : val;
  } else if (field === 'priority') {
    currentData.action_items[idx][field] = val === '' ? null : val;
  } else {
    currentData.action_items[idx][field] = val;
  }
  cntActions.textContent = currentData.action_items.length;
}

function addBlankTask() {
  if (!currentData) {
    currentData = {
      meeting_title: 'Custom Meeting', summary: '',
      decisions: [], action_items: [], risks: [], open_questions: [], ambiguities: []
    };
    emptyState.style.display     = 'none';
    resultsContent.style.display = 'block';
  }
  const newItem = { task: 'New follow-up task', owner: null, deadline: null, priority: null, evidence: 'Added during review' };
  currentData.action_items.push(newItem);
  const idx = currentData.action_items.length - 1;
  appendActionRow(newItem, idx);
  cntActions.textContent = currentData.action_items.length;
}

/* Risks */
function renderRisks(items) {
  cntRisks.textContent = items.length;
  risksArea.innerHTML  = '';
  if (!items.length) {
    risksArea.innerHTML = '<p class="empty-msg">No operational risks stated.</p>';
    return;
  }
  items.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = 'item-card risk';
    el.innerHTML = `
      <div class="item-main"><strong>Risk ${i + 1}:</strong> ${esc(r.risk)}</div>
      <span class="ev-quote">"${esc(r.evidence)}"</span>`;
    risksArea.appendChild(el);
  });
}

/* Ambiguities & Discrepancies */
function renderAmbiguities(items) {
  cntAmbiguities.textContent = items.length;
  ambiguitiesArea.innerHTML  = '';
  if (!items.length) {
    ambiguitiesArea.innerHTML = '<p class="empty-msg">No conflicting statements or unconfirmed estimates found.</p>';
    return;
  }
  items.forEach(a => {
    const el = document.createElement('div');
    el.className = 'item-card ambig';
    el.innerHTML = `
      <div class="item-main">⚖️ ${esc(a.issue)}</div>
      <div class="item-sub"><strong>Why Ambiguous:</strong> ${esc(a.why_ambiguous)}</div>
      <span class="ev-quote">"${esc(a.evidence)}"</span>`;
    ambiguitiesArea.appendChild(el);
  });
}

/* Open Questions */
function renderQuestions(items) {
  cntQuestions.textContent = items.length;
  questionsArea.innerHTML  = '';
  if (!items.length) {
    questionsArea.innerHTML = '<p class="empty-msg">No open questions captured.</p>';
    return;
  }
  items.forEach((q, i) => {
    const el = document.createElement('div');
    el.className = 'item-card question';
    const ownerTag = q.owner
      ? `<span class="owner-tag">Assigned: ${esc(q.owner)}</span>`
      : `<span class="null-tag">Unassigned (null)</span>`;
    el.innerHTML = `
      <div class="item-main" style="display:flex; justify-content:space-between; align-items:flex-start; gap:.5rem">
        <span><strong>Q${i + 1}:</strong> ${esc(q.question)}</span>
        ${ownerTag}
      </div>
      <span class="ev-quote">"${esc(q.evidence)}"</span>`;
    questionsArea.appendChild(el);
  });
}

// ── Export Functions ──────────────────────────────────
function exportJson() {
  if (!currentData) return;
  const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `meeting_record_${datestamp()}.json`);
}

function exportCsv() {
  if (!currentData?.action_items) return;
  const rows = [
    ['Task', 'Owner', 'Deadline', 'Priority', 'Evidence'],
    ...currentData.action_items.map(a => [
      a.task     || '',
      a.owner    || 'null',
      a.deadline || 'null',
      a.priority || 'null',
      a.evidence || '',
    ])
  ];
  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `action_items_${datestamp()}.csv`);
}

function copyJson() {
  if (!currentData) return;
  navigator.clipboard.writeText(JSON.stringify(currentData, null, 2)).then(() => {
    const orig = btnCopyJson.textContent;
    btnCopyJson.textContent = '✅ Copied!';
    setTimeout(() => (btnCopyJson.textContent = orig), 2000);
  });
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}

// ── Benchmark Evaluation ──────────────────────────────
async function runBenchmark() {
  btnRunBenchmark.disabled = true;
  btnRunBenchmark.innerHTML = '<span class="spinner" style="border-top-color:#fff"></span> Running Full Audit…';

  try {
    const payload = {
      prompt_version: cfgPromptVersion.value,
      api_key: cfgApiKey.value.trim() || null,
    };
    const res  = await fetch('/api/evaluate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    renderBenchmark(data);
  } catch (err) {
    benchmarkBody.innerHTML = `<p style="color:var(--red)">Audit failed: ${esc(err.message)}</p>`;
  }
}

function renderBenchmark(data) {
  const totalPassed = data.results.reduce((s, r) => s + (r.passed_checks || 0), 0);
  const totalChecks = data.results.reduce((s, r) => s + (r.total_checks || 0), 0);

  let html = `
    <div class="score-overview">
      <div class="score-box">
        <div class="score-num">${data.overall_score}%</div>
        <div class="score-lbl">Overall Compliance Score</div>
      </div>
      <div class="score-box">
        <div class="score-num" style="color:var(--green)">${totalPassed}/${totalChecks}</div>
        <div class="score-lbl">Quality Checks Passed</div>
      </div>
      <div class="score-box">
        <div class="score-num" style="color:#0284c7">${data.prompt_version}</div>
        <div class="score-lbl">Active Ruleset</div>
      </div>
    </div>`;

  data.results.forEach(r => {
    const scoreColor = r.score_percent >= 80 ? 'var(--green)' : r.score_percent >= 50 ? 'var(--amber)' : 'var(--red)';
    const checksHtml = (r.checks || []).map(c => `
      <div class="chk-row">
        <span class="${c.passed ? 'chk-pass' : 'chk-fail'}">${c.passed ? '✓' : '✗'}</span>
        <span class="chk-label">${esc(c.name)}</span>
      </div>`).join('');

    html += `
      <div class="sc-scenario">
        <div class="sc-head">
          <div>
            <div class="sc-title">Scenario ${r.scenario_id}: ${esc(r.scenario_title)}</div>
            <div style="font-size:.73rem; color:var(--muted)">${esc(r.category || '')}</div>
          </div>
          <div class="sc-score" style="color:${scoreColor}">
            ${r.passed_checks}/${r.total_checks} Checks Passed (${r.score_percent}%)
          </div>
        </div>
        <div class="sc-checks">${checksHtml}</div>
      </div>`;
  });

  html += `<button class="btn btn-secondary full-width" id="btnRerun" style="margin-top:.75rem">↺ Re-run Audit</button>`;
  benchmarkBody.innerHTML = html;
  document.getElementById('btnRerun').addEventListener('click', runBenchmark);
}

// ── Helpers ───────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escAttr(s) {
  if (s == null) return '';
  return String(s).replace(/"/g, '&quot;');
}

const style = document.createElement('style');
style.textContent = `.empty-msg { font-size:.82rem; color:var(--muted); padding:.4rem 0; }`;
document.head.appendChild(style);
