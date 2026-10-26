# Authoring content

Content is authored as **JSON** under `content/`, never in the engine:

- `content/meta.json` — `version`, `stageNames`, `wordPool`, `knowledge`,
  `roadmap`, `review`, and `levelOrder` (the level ids in play order).
- `content/levels/<id>.json` — one level each (its `id`, `word`, `title`,
  `lessons`).

`content.js` is **generated** from these by `npm run build`
(`tools/build-content.mjs`) and is committed so the site needs no build to
serve. Never edit `content.js` by hand — edit the JSON and rebuild.

Workflow: edit JSON → `npm run build` → `npm test`. (JSON has no comments; this
doc is the reference.)

## Add a lesson
Append a lesson object to a level file's `lessons` array
(`content/levels/view.json`):

```json
{"id":"view.peek", "title":"head + tail — peek at a file", "letters":[0], "tasks":[
  {"id":"view.peek.1", "show":"Peek at the first lines. Use <b>head library/poem.txt</b>",
   "cmd":"head library/poem.txt", "check":{"argHas":["head","poem.txt"]}},
  {"id":"view.peek.3", "ask":"Which command shows the FIRST lines of a file? Use it on library/poem.txt",
   "cmd":"head library/poem.txt", "check":{"argHas":["head","poem.txt"]}}
]}
```

Rules:
- Every `id` is unique and stable. Don't reuse or renumber ids to "tidy up" —
  progress is keyed on them.
- `letters` lists which secret-word slots this lesson fills. Across a level the
  slots must cover every index of the 5-letter word exactly once or more.
  Use `letters:[]` for a teaching interlude that awards no letter.
- A `checkpoint:true` lesson is a from-memory mix. The engine resets the player
  home and clears the screen at its start, and may append a few spaced-review
  questions for commands the player previously needed a hint on.
- teach tasks use `show`; recall tasks use `ask`. Both set `cmd` and `check`.

## Write the task text so the child thinks
The engine hides only the **command word** in the task text and keeps the data
(file names, folders, words) visible — the child must recall *which* command,
not copy a ready line. So:
- Put the target data in the prose: "Find the file **robot-toy.txt**", not just
  "find it".
- In a teach task you may still write the full command in `<b>…</b>`; the engine
  masks the verb automatically (`find <b>ball.txt</b>` → shows "ball.txt",
  hides `find`). Single-word commands (`pwd`, `ls`) are shown in full.
- The **Hint** button reveals the command in three steps (name → shape → full),
  built from `cmd`. Make sure `cmd` is the exact command that satisfies `check`.

## Random variants (keep replays fresh)
Give a task an `alts` array of equivalent versions (same shape). Each play the
engine shows the base task or a random variant:

```json
{"id":"seek.find.2", "ask":"Find the file named robot-toy.txt",
 "cmd":"find robot-toy.txt", "check":{"out":["find","robot-toy.txt"]}, "alts":[
   {"ask":"Find the file named ball.txt",  "cmd":"find ball.txt",  "check":{"out":["find","ball.txt"]}},
   {"ask":"Find the file named beach.txt", "cmd":"find beach.txt", "check":{"out":["find","beach.txt"]}}
]}
```

Keep every variant solvable from the files seeded in `index.html` (`seed`).

## Add a command to help
Add `{"cmd": ..., "sum": ...}` to `knowledge` in `meta.json`. `help` and
Tab-completion read from it. A command's first appearance across the levels (in
`levelOrder`) also decides when it unlocks in sandbox (earlier level = sooner).

## Add a level / region
Create `content/levels/<id>.json`, add its `id` to `meta.json` `levelOrder` at
the right position, and (if it's a new region) set that `roadmap` region to
`"status":"ready"` with its `levelIds`. Keep `stageNames` at
`levelOrder.length + 1`.

## Checks
Prefer checking the resulting world state (`cwd`, `exists`, `fileHas`, `cat`)
over exact command text, so alternative correct solutions pass. Use
`ran`/`argHas` when the lesson is specifically about typing that command, and
`typed` for pipe / `$variable` lessons where the whole line matters
(`{typed:["cat","|","sort"]}`, `{typed:["echo","$pet"]}`). Variable lessons can
also use `{setVar:"pet"}` and `{varHas:["pet","dragon"]}`.

Full `check` vocabulary: `ran`, `ranArg`, `cd`, `cdHome`, `cwd`, `cat`,
`exists`, `gone`, `fileHas`, `out`, `argHas`, `typed`, `setVar`, `varHas`,
`and`, `or`. Paths may use `~ .. .`.

The `roadmap` in `meta.json` is the 12-region map. A `"status":"ready"` region
lists its `levelIds`; `"status":"soon"` regions show as "coming soon".

## Mini-articles (shown before a lesson)
`content/articles.json` holds short illustrated intros, keyed by **lesson id**.
Before a non-checkpoint lesson starts, if an article exists for it, the game
shows it once per profile (after any story/level-up animation):

```json
"make.create": {
  "title": "mkdir & touch — make things",
  "intro": "mkdir makes a new folder; touch makes a new empty file.",
  "examples": [
    {"cmd": "mkdir toys", "desc": "makes a folder named toys"},
    {"cmd": "touch toys/ball.txt", "desc": "makes an empty file in toys"}
  ],
  "tip": "Build folders inside folders: mkdir city, then mkdir city/park."
}
```

An example may also carry `"out"` (sample output). Only teach lessons need an
article; the key must match an existing lesson id (the validator checks this).

## Validation
`npm run build` fails on malformed JSON, a missing `levelOrder` entry, or a
level file whose `id` doesn't match its filename. After building, the engine's
`validateContent()` runs on load and reports (in the terminal): duplicate ids,
non-5-letter words, missing tasks/checks, recall tasks (and variants) without a
`cmd`, uncovered letter slots, and `ready` regions pointing at unknown levels.
The same checks (plus roadmap and stage-count) run headless in
`tests/validate-content.mjs` — see `testing.md`.
