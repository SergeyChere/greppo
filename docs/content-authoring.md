# Authoring content

All content is in `content.js`. To add or change course material you only edit
this file — never the engine.

## Add a lesson
Append a lesson object to a level's `lessons[]`:

```
{id:"view.peek", title:"head + tail — peek at a file", letters:[0], tasks:[
  {id:"view.peek.1", show:"Use <b>head library/poem.txt</b>", cmd:"head library/poem.txt",
   check:{argHas:["head","poem.txt"]}},
  {id:"view.peek.3", ask:"Which command shows the FIRST lines of a file?",
   cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}}
]}
```

Rules:
- Every `id` is unique and stable. Don't reuse or renumber ids to "tidy up" —
  progress is keyed on them.
- `letters` lists which secret-word slots this lesson fills. Across a level the
  slots must cover every index of the 5-letter word exactly.
- A `checkpoint:true` lesson is a from-memory mix; the engine resets the player
  home and clears the screen at its start.
- teach tasks use `show` (command visible in `<b>`); recall tasks use `ask`
  (command hidden) and must set `cmd` so the Hint can reveal it.

## Add a command to help
Add `{cmd, sum}` to `knowledge`. `help`, the mastery meter order and Tab
completion all read from it.

## Checks
Prefer checking the resulting world state (`cwd`, `exists`, `fileHas`, `cat`)
over the exact command text, so alternative correct solutions pass. Use
`ran`/`argHas` only when the lesson is specifically about typing that command.

## Validation
`validateContent()` runs on load and reports: duplicate ids, 5-letter words,
missing tasks/checks, recall tasks without a `cmd`, and uncovered letter slots.
Problems are printed in the terminal. Keep the content clean.
