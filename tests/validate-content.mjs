/*
 * Content validator for Greppo (no browser needed — fast, CI-friendly).
 *
 * Loads web/content.js in a sandbox and checks the course data is well formed:
 * stable unique IDs, 5-letter secret words, every word slot covered, valid
 * tasks and variants, a 12-region roadmap whose "ready" regions point at real
 * levels, and a review question per shape. Exits non-zero on any problem.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function loadGreppo() {
  const src = readFileSync(resolve(root, 'content.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'content.js' });
  return sandbox.window.GREPPO;
}

const errs = [];
const fail = (m) => errs.push(m);

const G = loadGreppo();
if (!G) { console.error('FAIL: window.GREPPO was not defined by content.js'); process.exit(1); }

const ids = Object.create(null);
function uniqueId(id, kind) {
  if (!id) fail(`${kind} with no id`);
  else if (ids[id]) fail(`duplicate id: ${id}`);
  else ids[id] = kind;
}

// --- top-level shape ---
if (!Array.isArray(G.levels) || G.levels.length === 0) fail('levels is empty');
if (!Array.isArray(G.stageNames)) fail('stageNames missing');
else if (G.stageNames.length !== G.levels.length + 1)
  fail(`stageNames length ${G.stageNames.length} should be levels+1 = ${G.levels.length + 1}`);

if (!Array.isArray(G.wordPool) || !G.wordPool.length) fail('wordPool empty');
else G.wordPool.forEach((w) => { if (!/^[A-Z]{5}$/.test(w)) fail(`wordPool word not 5 uppercase letters: ${w}`); });

// --- a task (base or variant) ---
function checkTaskBody(t, label) {
  if (!t.check) fail(`${label} missing check`);
  if (t.ask && !t.cmd) fail(`${label} is a recall (ask) but has no cmd`);
  if (!t.ask && !t.show) fail(`${label} has neither ask nor show`);
}

// --- levels ---
G.levels.forEach((lv) => {
  uniqueId(lv.id, 'level');
  if (!/^[A-Z]{5}$/.test(lv.word || '')) fail(`level ${lv.id}: word must be 5 uppercase letters (got "${lv.word}")`);
  if (!Array.isArray(lv.lessons) || !lv.lessons.length) fail(`level ${lv.id}: no lessons`);

  const slots = {};
  (lv.lessons || []).forEach((ls) => {
    uniqueId(ls.id, 'lesson');
    if (!Array.isArray(ls.tasks) || !ls.tasks.length) fail(`lesson ${ls.id}: no tasks`);
    (ls.letters || []).forEach((n) => {
      if (n < 0 || n >= (lv.word || '').length) fail(`lesson ${ls.id}: letter slot ${n} out of range`);
      slots[n] = true;
    });
    (ls.tasks || []).forEach((t) => {
      uniqueId(t.id, 'task');
      checkTaskBody(t, `task ${t.id}`);
      (t.alts || []).forEach((v, i) => checkTaskBody(v, `alt ${t.id}#${i}`));
    });
  });

  for (let i = 0; i < (lv.word || '').length; i++)
    if (!slots[i]) fail(`level ${lv.id}: no lesson awards letter slot ${i}`);
});

// --- roadmap ---
if (!Array.isArray(G.roadmap)) fail('roadmap missing');
else {
  if (G.roadmap.length !== 12) fail(`roadmap should have 12 regions (got ${G.roadmap.length})`);
  const levelIds = new Set(G.levels.map((l) => l.id));
  G.roadmap.forEach((r) => {
    if (r.status === 'ready') {
      if (!Array.isArray(r.levelIds) || !r.levelIds.length) fail(`region ${r.n} "${r.title}" is ready but has no levelIds`);
      (r.levelIds || []).forEach((id) => { if (!levelIds.has(id)) fail(`region ${r.n} points at unknown level "${id}"`); });
    }
  });
}

// --- review questions ---
if (G.review) Object.keys(G.review).forEach((k) => {
  const r = G.review[k];
  if (!r.ask || !r.cmd || !r.check) fail(`review "${k}" needs ask + cmd + check`);
});

const levelCount = G.levels.length;
const taskCount = G.levels.reduce((n, lv) => n + lv.lessons.reduce((m, ls) => m + ls.tasks.length, 0), 0);
const variantCount = G.levels.reduce((n, lv) => n + lv.lessons.reduce((m, ls) => m + ls.tasks.reduce((a, t) => a + (t.alts ? t.alts.length : 0), 0), 0), 0);

if (errs.length) {
  console.error(`❌ content validation failed (${errs.length}):`);
  errs.forEach((e) => console.error('   - ' + e));
  process.exit(1);
}
console.log(`✅ content OK: ${levelCount} levels, ${taskCount} tasks, ${variantCount} variants, ${G.roadmap.length} regions, ${G.stageNames.length} stages`);
