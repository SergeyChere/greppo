# Authoring content

All content is in `content.js`. To add or change course material you only edit
this file — never the engine.

## Add a lesson
Append a lesson object to a level's `lessons[]`:

```js
{id:"view.peek", title:"head + tail — peek at a file", letters:[0], tasks:[
  {id:"view.peek.1", show:"Peek at the first lines. Use <b>head library/poem.txt</b>",
   cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}},
  {id:"view.peek.3", ask:"Which command shows the FIRST lines of a file? Use it on library/poem.txt",
   cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}}
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

```js
{id:"seek.find.2", ask:"Find the file named robot-toy.txt",
 cmd:"find robot-toy.txt", check:{out:["find","robot-toy.txt"]}, alts:[
   {ask:"Find the file named ball.txt",  cmd:"find ball.txt",  check:{out:["find","ball.txt"]}},
   {ask:"Find the file named beach.txt", cmd:"find beach.txt", check:{out:["find","beach.txt"]}}
]}
```

Keep every variant solvable from the files seeded in `index.html` (`seed`).

## Add a command to help
Add `{cmd, sum}` to `knowledge`. `help` and Tab-completion read from it. A
command's first appearance in `levels[]` also decides when it unlocks in
sandbox (earlier level = unlocked sooner).

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

## Regions (the world map)
`roadmap` is the 12-region map. When you make a region playable, set
`status:"ready"` and list its `levelIds`. Keep `status:"soon"` for planned
regions; they show under "coming soon". `stageNames` must stay
`levels.length + 1` long when you add a level.

## Validation
`validateContent()` runs on load and reports: duplicate ids, non-5-letter words,
missing tasks/checks, recall tasks (and variants) without a `cmd`, uncovered
letter slots, and `ready` regions pointing at unknown levels. Problems are
printed in the terminal. The same checks (plus roadmap and stage-count) run
headless in `tests/validate-content.mjs` — see `testing.md`.
