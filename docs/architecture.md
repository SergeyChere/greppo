# Architecture

Content split from engine. The engine never grows with the amount of course
material — adding levels/lessons/tasks is editing data only.

## content/ — the source data (JSON)
Authored content lives in `content/meta.json` (version, stageNames, wordPool,
knowledge, roadmap, review, and `levelOrder`), `content/levels/<id>.json`
(one level each), and `content/articles.json` (mini-articles shown before a
lesson, keyed by lesson id). `tools/build-content.mjs` (`npm run build`)
assembles them into `content.js`. `content.js` is committed so the static site needs no build
to serve, but it is generated — edit the JSON, not `content.js`.

## content.js — the generated registry (`window.GREPPO`)
Plain data, no functions. Loaded by a plain `<script>` (no network), so it works
opened from disk, on GitHub Pages and inside the artifact:
- `version`
- `stageNames` — pet evolution names; length must be `levels.length + 1`
  (egg + one stage per level + MEGA)
- `wordPool` — 5-letter secret words; a random one is assigned per level per run
- `knowledge` — `{cmd, sum}` list; the in-game `help` and Tab-completion read it
- `roadmap` — the 12-region world map. Each region has `{n, title, teach,
  status}`; a `ready` region also has `levelIds:[...]` pointing at the levels
  that implement it. `soon` regions are shown under "coming soon".
- `review` — one canonical recall question per command (spaced repetition);
  checkpoints resurface a few of these for commands the player needed a hint on
- `levels[]` → `lessons[]` → `tasks[]`, each with a stable `id`

Task shapes:
- teach  — `{id, show:"...<b>cmd</b>...", cmd, check}`
- recall — `{id, ask:"question", cmd, check}`
- either may carry `alts:[{...}, ...]` — equivalent variants (same shape). The
  engine shows the base task or a random variant on each play, so repeats and
  practice feel fresh. The `id` is shared across variants.

A lesson with `letters:[]` teaches but awards no secret-word letter (an
interlude, e.g. the absolute-vs-relative-path lesson).

Declarative `check` vocabulary (compiled by the engine). All paths may use
`~ .. .`:
- `ran`, `ranArg`, `cd`, `cdHome`, `cwd`, `cat`, `exists`, `gone`, `fileHas`,
  `out`, `argHas`
- `typed` — the raw typed line contains all the given pieces (used for pipe and
  `$variable` lessons, where the exact line matters)
- `setVar` — a variable of that name was created (`name=value`)
- `varHas` — a variable exists and its value contains text
- `and`, `or` — combine

## index.html — the engine
Modules (functions/sections inside one file):
- **virtual file system** — `seed`, `resolve`, `norm`, `fromAbs`, …; nodes carry
  an optional `locked` flag used by `chmod`
- **command engine** (`exec`): `pwd ls cd cat tree mkdir touch echo cp mv rm
  find grep head tail wc sort uniq rev tr cut nl whoami date cal history chmod
  id du df stat ps kill top env which ping curl run repeat`, plus:
  - wildcards (`*`), `ls -a` (hidden), `ls -l` (long listing with the lock flag)
  - **pipes** — `cmd | cmd | …` chains sources (`cat`/`echo`/`ls`) through text
    filters (`sort uniq head tail wc grep rev tr nl cut`)
  - **variables** — `name=value` assignment and `$name` / `${name}` / `$USER`
    expansion
  - `run`/`bash FILE` runs a saved script line by line (guarded so it doesn't
    auto-advance lesson steps); `repeat N cmd` repeats a command
  - commands run only in the virtual world; there is no real shell and no `eval`
- **content adapter** — `compileCheck`, `buildOne`/`buildTask` (compiles base +
  `alts`), `buildLevels`, `buildReview`, `buildHelp`, `validateContent`, and
  `CMD_LEVEL` (which level first teaches each command)
- **lessons runtime** — checklist, learn→recall, checkpoints, letters, secret
  word. Every lesson starts the player at home (`~`) so relative paths always
  work. Task text hides only the command **verb** (`maskText`) and keeps the
  data visible; the **Hint** button reveals it in three steps (name → shape →
  full command).
- **pet/evolution**, story intro + original chiptune, Matrix transitions (a
  generic transition is used for levels beyond the hand-written story)
- **sandbox mode** — easter eggs and mini-games (tic-tac-toe, battleship,
  sudoku). Commands are gated by progress: a command the player hasn't reached
  is refused with a friendly "earn it in the quest" message (`cmdLearned` /
  `CMD_LEVEL`), and `help` marks locked commands.
- **world map / practice** — the Map overlay renders `roadmap`; completed levels
  offer a Practice run (`enterPractice`/`exitPractice`) that leaves real
  progress untouched (saving is suspended during practice), and a "Back to my
  quest" button returns to the real current level.
- **progress** — `localStorage` (`greppo_web_v4`), padded/migrated to the
  current number of levels on load (never silently reset)

The engine reads `GREPPO`, validates it, compiles checks, and runs. It does not
contain course content.

## Mobile (touch) mode
On touch devices (`pointer: coarse`, or `?tap=1` for testing) the engine adds
`body.tap`: a full-height app layout (task on top, terminal in the middle) and a
**Duolingo-style tap builder** pinned at the bottom (`#tapbar`). It offers the
current task's command pieces as tiles mixed with a few wrong distractors
(scaled by level); the child taps them in order and presses Check, which runs
the assembled command through the normal engine. A ⌨ type chip falls back to the
keyboard. Desktop (fine pointer) is completely unchanged — none of this renders.
