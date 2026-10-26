# Testing

Every change needs a test; integration tests are required (Definition of Done).

## What to cover
- Content registry validates (no duplicate ids, words are 5 letters, every
  letter slot covered, recall tasks have a `cmd`).
- A lesson can be completed and awards its letter; a checkpoint resets home.
- Commands behave in the virtual world (navigation, create/edit, search,
  head/tail/wc/sort/uniq), and never touch anything real.
- Progress saves to `localStorage` and restores after reload; migration pads to
  the current number of levels without resetting.
- Help is built from `knowledge`; sandbox games and easter eggs are blocked
  outside sandbox mode.

## The test suite

Two files under `tests/`, run together by `npm test`:

- **`tests/validate-content.mjs`** — no browser. Loads `content.js` in a sandbox
  and checks the registry: unique stable ids, 5-letter words, every letter slot
  covered, valid tasks and `alts` variants, a 12-region roadmap whose `ready`
  regions point at real levels, `stageNames` length = levels + 1, and a well
  formed review map. Fast; good as the first gate in CI.
- **`tests/integration.test.mjs`** — headless Chromium via Playwright. Loads
  `index.html`, seeds `localStorage` for determinism, and drives the page like a
  child would. It covers: clean boot (no content errors), the region commands
  (`chmod` lock, pipes, variables, `ps`/`kill`, `ping`/`curl`, `run`/`repeat`),
  command-verb masking + 3-level hints, completing a checkpoint → secret word →
  level-up, practice mode (and that it leaves real progress untouched), random
  task variants across replays, the Hot keys panel and `Ctrl+L`/`Esc`, and that
  there are no uncaught page errors.

## Running

```sh
npm install                        # Playwright (dev dependency)
npx playwright install chromium    # the browser binary
npm test                           # content validator, then integration tests
```

`npm run test:content` and `npm run test:integration` run them separately.
CI runs the same on every push/PR (`.github/workflows/ci.yml`).

## On failure
Reproduce, find the root cause, fix the code or the (genuinely wrong) test.
Never delete, weaken or skip a test to get green.
