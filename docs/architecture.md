# Architecture

Two files, content split from engine.

## content.js — the registry (`window.GREPPO`)
Plain data, no functions:
- `version`
- `stageNames` — pet evolution names (egg + one per level + MEGA)
- `wordPool` — 5-letter secret words (a random one per level per run)
- `knowledge` — `{cmd, sum}` list; the in-game `help` is built from this
- `review` — one canonical recall question per command (spaced repetition)
- `levels[]` → `lessons[]` → `tasks[]`, each with a stable `id`

Task shapes:
- teach  — `{id, show:"...<b>cmd</b>...", cmd, check}`
- recall — `{id, ask:"question", cmd, check}`

Declarative `check` vocabulary (compiled by the engine):
`ran`, `ranArg`, `cd`, `cdHome`, `cwd`, `cat`, `exists`, `gone`,
`fileHas`, `out`, `argHas`, `and`, `or`. All paths may use `~ .. .`.

## index.html — the engine
Modules (functions/sections inside one file):
- virtual file system (`seed`, `resolve`, `norm`, `fromAbs`, …)
- command engine (`exec`) — pwd ls cd cat tree mkdir touch echo cp mv rm
  find grep head tail wc sort uniq, plus wildcards and `ls -a`
- content adapter — `compileCheck`, `buildTask`, `buildLevels`, `buildReview`,
  `buildHelp`, `validateContent`
- lessons runtime — checklist, learn→recall, checkpoints, mastery, letters
- pet/evolution, story intro + chiptune, Matrix transitions
- sandbox mode — easter eggs and mini-games (tic-tac-toe, battleship, sudoku)
- progress — `localStorage` (`greppo_web_v4`), padded/migrated to the current
  number of levels on load

The engine reads `GREPPO`, validates it, compiles checks, and runs. It does not
contain course content.
