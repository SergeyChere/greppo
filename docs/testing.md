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

## How it's run here
Headless Chromium via Playwright loads `index.html`, drives the input, and
checks the terminal/DOM and `window.GREPPO`. Example checks that must pass:
registry level count, help contains the command list, a lesson yields a letter,
`head/wc/sort/uniq` produce output, and there are no page errors.

## On failure
Reproduce, find the root cause, fix the code or the (genuinely wrong) test.
Never delete, weaken or skip a test to get green.
