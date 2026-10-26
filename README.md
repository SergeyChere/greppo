# Greppo

A safe, kid-friendly game for learning the **Linux terminal**, right in the browser.

Children explore a pretend file system with real commands, first learning each
command and then recalling it from memory. Collect the hidden letters, spell the
secret word, and watch your ASCII pet **Greppo** evolve from egg to MEGA across
**16 levels** in a 12-region world map.

Nothing on a real computer is ever touched — the whole file system lives in
memory. There is no real shell and no `eval`.

## Play

It's a single self-contained `index.html`. Open it in any modern browser, or
play the hosted version via GitHub Pages.

## Features

- **16 levels across 12 regions**, from navigation and files up to pipes,
  variables, permissions, processes, networking and scripts — each kept
  kid-friendly. A world **Map** shows progress; finished regions can be
  replayed in a **Practice** run that never touches real progress.
- Commands taught: `pwd ls cd cat tree mkdir touch echo cp mv rm find grep head
  tail wc sort uniq rev tr cut nl whoami date cal history chmod id du df stat ps
  kill env which ping curl run repeat`, plus wildcards, pipes (`a | b | c`) and
  variables (`name=value`, `$name`).
- **Learn → recall** lessons with checkpoints and spaced review. Task text shows
  *what* to do but hides *which* command, so children recall it; a **3-level
  Hint** reveals it gently. **Random variants** keep replays fresh.
- An evolving, animated ASCII pet (17 stages) that motivates finishing.
- A free-play **Sandbox** that unlocks commands as you earn them, with
  easter-eggs (`meow`, `dance`, `rainbow`, `fortune`, …) and mini-games:
  tic-tac-toe, battleship, sudoku.
- Keyboard shortcuts behind a **Hot keys** panel: `Enter`, `↑/↓` history, `Tab`
  completion, `Home/End`, `Ctrl+L` clear, `Ctrl+U`/`Esc` erase line.
- Original 8-bit intro story + chiptune. Progress saved locally in the browser.

## Tests

`npm install && npx playwright install chromium && npm test` runs a browserless
content validator plus headless integration tests (also on every push via
GitHub Actions). See `docs/testing.md`.

## License

MIT
