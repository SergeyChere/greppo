# CLAUDE.md — Greppo

Short rules for working in this repo. Full product spec and details live in `docs/`.

## What this is
A single-page, offline browser game that teaches children the Linux terminal.
The whole file system is simulated in memory — no real shell, no real files.

## Golden rules
- Do NOT rewrite from scratch. Make small, verifiable changes; keep current
  behaviour, UX and saved progress.
- Content is DATA, not code. All course content lives in `content.js`
  (`window.GREPPO`). Adding a level/lesson/task = editing `content.js` only.
  The engine in `index.html` must not grow with the number of lessons.
- Stable IDs everywhere (`level_id.lesson_id.task_id`). Renaming/moving content
  must keep progress working; provide a migration when the save shape changes.
- The engine validates the registry on load (`validateContent`) and shows any
  problems in the terminal — keep that working.
- Commands run only inside the virtual world. Never touch real files, never use
  `eval` on user input.
- Every change needs a test (see `docs/testing.md`). Don't weaken a test to make
  it pass; fix the cause.
- Ask before adding unrequested features, dependencies, big refactors or
  analytics/monetization.

## Files
- `index.html` — the engine: terminal, virtual FS, lessons runtime, pet, games,
  UI. Loads `content.js` first.
- `content.js` — the content registry (levels, lessons, tasks, review map,
  knowledge base, pet stage names, word pool). Declarative `check` objects.
- `docs/` — architecture, content authoring, testing.

## Deploy
Static files. Hosted on GitHub Pages from `main` (root). Open `index.html`
locally or via the Pages URL.
