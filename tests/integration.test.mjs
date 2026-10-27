/*
 * Integration tests for Greppo (headless Chromium via Playwright).
 *
 * Drives the real page the way a child would — typing commands, pressing the
 * buttons — and asserts the engine behaves. Run with: npm test
 * (requires: npm ci && npx playwright install chromium)
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const URL = 'file://' + resolve(here, '..', 'index.html');

const WORDS = ['ROBOT','LINUX','PILOT','SCOUT','ORDER','MAGIC','LASER','RIVER','CLOUD','POWER','BADGE','DEPTH','MOTOR','PANEL','RADIO','SPELL'];

let passed = 0;
const failures = [];
function ok(cond, msg) { if (cond) { passed++; } else { failures.push(msg); console.error('  ✗ ' + msg); } }
function section(name) { console.log('\n# ' + name); }

// Ignore the sandbox's font-CDN network error; fail on anything else.
const pageErrors = [];

async function freshPage(browser, save, opts) {
  opts = opts || {};
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) pageErrors.push('CONSOLE ' + m.text()); });
  await page.addInitScript((s) => { try { if (s) localStorage.setItem('greppo_web_v4', JSON.stringify(s)); else localStorage.clear(); } catch (e) {} }, save || null);
  await page.goto(URL);
  await page.waitForTimeout(400);
  // A new-command lesson pops a mini-article over the buttons; dismiss it unless
  // the test wants to inspect it.
  if (!opts.keepArticle) { try { if (!(await page.evaluate(() => document.getElementById('artov').hidden))) { await page.click('#artGo'); await page.waitForTimeout(40); } } catch (e) {} }
  return { ctx, page };
}
function seed(extra) {
  const found = []; for (let i = 0; i < 16; i++) found.push([]);
  return Object.assign({ name: 'Robert', user: 'robert', lvl: 0, lesson: 0, task: 0, found, mastery: {}, review: {}, muted: true, seenIntro: true, mode: 'quest', words: WORDS }, extra || {});
}
const run = (page) => async (cmd) => { await page.fill('#in', cmd); await page.press('#in', 'Enter'); await page.waitForTimeout(40); return page.evaluate(() => document.getElementById('term').innerText); };
const term = (page) => page.evaluate(() => document.getElementById('term').innerText);

const browser = await chromium.launch();
try {
  // ---- content loads clean ----
  section('content & boot');
  {
    const { ctx, page } = await freshPage(browser, null);
    await page.fill('#nameIn', 'Robert'); await page.click('#startBtn'); await page.waitForTimeout(250);
    const banner = await term(page);
    ok(!/Content check/.test(banner), 'no content-validation errors on load');
    await ctx.close();
  }

  // ---- new region commands ----
  section('region commands');
  {
    const { ctx, page } = await freshPage(browser, seed());
    const r = run(page);
    // help marks locked commands, and a not-yet-reached command is blocked —
    // consistently in quest too
    ok(/🔒/.test(await r('help')), 'help marks locked commands (quest)');
    ok(/haven't earned/i.test(await r('whoami')), 'a not-yet-reached command is blocked in quest');
    await r('sandbox');
    ok(/library|welcome\.txt/.test(await r('ls')), 'a learned command (ls) runs');
    ok(/🔒/.test(await r('help')), 'help marks locked commands (sandbox)');
    ok(/haven't earned/i.test(await r('tr a-z A-Z library/poem.txt')), 'un-earned command (tr) is blocked in sandbox');
    ok(/haven't earned/i.test(await r('ps')), 'un-earned command (ps) is blocked in sandbox');
    await ctx.close();
  }
  {
    // a save at the last level has everything unlocked — exercise the new commands
    const found = []; for (let i = 0; i < 16; i++) found.push(i < 15 ? [0,1,2,3,4] : []);
    const { ctx, page } = await freshPage(browser, seed({ lvl: 15, lesson: 0, found }));
    const r = run(page);
    await r('sandbox');
    await r('echo gold > vault.txt'); await r('chmod -w vault.txt');
    ok(/locked/i.test(await r('rm vault.txt')), 'chmod -w locks a file against rm');
    await r('chmod +w vault.txt');
    ok(/cat|dog|bird/.test(await r('cat library/animals.txt | sort | uniq')), 'pipe cat|sort|uniq works');
    ok(/3 3 12|\b3 \b/.test(await r('cat library/animals.txt | sort | uniq | wc')), 'pipe into wc works');
    await r('pet=dragon');
    ok(/my pet is dragon/.test(await r('echo my pet is $pet')), 'variables expand ($pet)');
    ok(/greppo-pet|games/.test(await r('ps')), 'ps lists processes');
    ok(/Stopped/.test(await r('kill 77')), 'kill stops a process');
    ok(/awake/i.test(await r('ping greppo.world')), 'ping replies');
    ok(/network|page/i.test(await r('curl greppo.world')), 'curl fetches a page');
    await r('echo whoami > s.sh');
    ok(/robert/.test(await r('run s.sh')), 'run executes a script file');
    ok(/hooray/.test(await r('repeat 3 echo hooray')), 'repeat runs a command N times');
    await ctx.close();
  }

  // ---- task text is goal-only; two-level hints ----
  section('task text & hints');
  {
    const { ctx, page } = await freshPage(browser, seed({ lvl: 1, lesson: 2 })); // make.copy (cp teach)
    const label = (await page.evaluate(() => document.getElementById('check').innerText.split('\n')[0]));
    ok(/den\/bowl\.txt/.test(label), 'the data (file names) stays visible in the task text');
    ok(!/\bcp\b/.test(label) && !/which command\?/.test(label), 'the ready command is not in the task text');
    const hint = async () => { await page.click('#bHint'); await page.waitForTimeout(160); return page.evaluate(() => document.getElementById('say').innerText); };
    ok(/Hint 1 of 2[\s\S]*\bcp\b/.test(await hint()), 'hint 1 reminds the command');
    ok(/Hint 2 of 2[\s\S]*cp den\/bowl\.txt den\/bowl2\.txt/.test(await hint()), 'hint 2 gives the full command');
    await ctx.close();
  }
  {
    // the "variables" (file names and words to type) are highlighted as kw
    const { ctx, page } = await freshPage(browser, seed({ lvl: 1, lesson: 1 })); // make.write: echo food > den/bowl.txt
    const html = await page.evaluate(() => document.getElementById('check').innerHTML);
    ok(/<span class="kw">food<\/span>/.test(html), 'the word to write (food) is highlighted');
    ok(/<span class="kw">den\/bowl\.txt<\/span>/.test(html), 'the file name (den/bowl.txt) is highlighted');
    await ctx.close();
  }

  // ---- a lesson plays and awards letters; checkpoint -> word -> level up ----
  section('gameplay: checkpoint, word, level up');
  {
    const found = []; for (let i = 0; i < 16; i++) found.push(i < 6 ? [0,1,2,3,4] : []);
    found[6] = [0,1,2,3];                     // slice: last letter comes from its checkpoint
    const { ctx, page } = await freshPage(browser, seed({ lvl: 6, lesson: 4, found }));
    const r = run(page);
    // tasks may be random variants, so reveal each one's command via the Hint
    // ladder (which is deterministic) and type that.
    async function solveCurrent() {
      let say = '';
      for (let i = 0; i < 2; i++) {
        await page.click('#bHint'); await page.waitForTimeout(150);
        say = await page.evaluate(() => document.getElementById('say').innerText);
        // single-word commands reveal the answer on the first press ("Hint: use
        // the X command"); multi-word ones at "Hint 2 of 2: type …".
        if (/Hint 2 of 2: type /.test(say) || /^Hint: use the \S+ command/.test(say)) break;
      }
      const m = say.match(/Hint 2 of 2: type\s+(.+)$/) || say.match(/^Hint: use the (\S+) command/);
      if (m) await r(m[1].trim());
    }
    for (let i = 0; i < 4; i++) await solveCurrent();   // slice checkpoint has 4 tasks
    const lock = await page.evaluate(() => document.getElementById('lock').textContent);
    ok(lock.replace(/\s/g, '') === 'LASER', 'checkpoint awards the final letter (word complete)');
    await r('LASER');
    await page.waitForTimeout(250);
    ok(await page.evaluate(() => !document.getElementById('mx').hidden), 'typing the word starts the evolution animation');
    await page.evaluate(() => document.getElementById('mxGo').click());
    await page.waitForTimeout(250);
    ok(/Level 8 of 16/.test(await page.evaluate(() => document.getElementById('lvl').textContent)), 'level-up advances to the next level');
    await ctx.close();
  }

  // ---- practice mode leaves real progress untouched ----
  section('practice mode');
  {
    const found = []; for (let i = 0; i < 16; i++) found.push(i < 3 ? [0,1,2,3,4] : []);
    const { ctx, page } = await freshPage(browser, seed({ lvl: 3, lesson: 0, found }));
    await page.evaluate(() => document.getElementById('bMap').click());
    await page.waitForTimeout(80);
    ok((await page.evaluate(() => document.querySelectorAll('#mapgrid .region').length)) === 12, 'map shows 12 regions');
    ok((await page.evaluate(() => document.querySelectorAll('#mapgrid .pbtn').length)) >= 2, 'each finished level offers a Replay button');
    // jump to the FIRST finished level
    await page.evaluate(() => document.querySelectorAll('#mapgrid .pbtn')[0].click());
    await page.waitForTimeout(150);
    ok(/Level 1 of 16/.test(await page.evaluate(() => document.getElementById('lvl').textContent)), 'replay enters the chosen (earlier) level');
    // hop straight to another finished level from the map (free movement)
    await page.evaluate(() => document.getElementById('bMap').click());
    await page.waitForTimeout(80);
    await page.evaluate(() => document.querySelectorAll('#mapgrid .pbtn')[1].click());
    await page.waitForTimeout(150);
    ok(/Level 2 of 16/.test(await page.evaluate(() => document.getElementById('lvl').textContent)), 'can hop directly to another finished level');
    // and still return to the real current level
    await page.evaluate(() => document.getElementById('bMap').click());
    await page.waitForTimeout(80);
    await page.evaluate(() => document.getElementById('mapResume').click());
    await page.waitForTimeout(120);
    ok(/Level 4 of 16/.test(await page.evaluate(() => document.getElementById('lvl').textContent)), 'resume returns to the real current level');
    await ctx.close();
  }
  {
    // revisiting a completed level keeps achievements shown, offers ◀/▶, and
    // redoing a lesson does NOT re-trigger a level-up
    const found = []; for (let i = 0; i < 16; i++) found.push(i < 3 ? [0,1,2,3,4] : []);
    const { ctx, page } = await freshPage(browser, seed({ lvl: 3, lesson: 0, found }));
    await page.evaluate(() => document.getElementById('bMap').click());
    await page.waitForTimeout(80);
    await page.evaluate(() => document.querySelectorAll('#mapgrid .pbtn')[0].click()); // revisit level 1 (nav)
    await page.waitForTimeout(150);
    ok((await page.evaluate(() => document.getElementById('lock').textContent)).replace(/\s/g, '') === 'ROBOT', 'revisited level shows its word already completed');
    ok(await page.evaluate(() => !document.getElementById('lnav').hidden), 'back/forward nav is available in a revisited level');
    const r = run(page);
    await r('pwd'); await r('ls'); await r('pwd'); // complete nav.look
    await page.waitForTimeout(150);
    ok(await page.evaluate(() => document.getElementById('mx').hidden), 'redoing a lesson does not trigger a level-up');
    ok(/Level 1 of 16/.test(await page.evaluate(() => document.getElementById('lvl').textContent)), 'still inside the revisited level');
    await ctx.close();
  }

  // ---- random variants ----
  section('random task variants');
  {
    const { ctx, page } = await freshPage(browser, seed({ lvl: 2, lesson: 0 })); // seek.find has variants
    const seen = new Set();
    for (let i = 0; i < 25; i++) {
      // the seeded save is re-applied on every navigation (addInitScript),
      // and startLesson randomizes which variant it shows each load
      const labels = await page.evaluate(() => document.getElementById('check').innerText.split('\n'));
      const m = (labels[1] || '').match(/[a-z0-9\-]+\.txt/);
      if (m) seen.add(m[0]);
      await page.evaluate(() => location.reload());
      await page.waitForTimeout(160);
    }
    ok(seen.size >= 2, `recall task shows more than one target over replays (saw ${seen.size}: ${[...seen].join(', ')})`);
    await ctx.close();
  }

  // ---- hot keys ----
  section('hot keys');
  {
    const { ctx, page } = await freshPage(browser, seed());
    await page.click('#bKeys'); await page.waitForTimeout(80);
    ok(await page.evaluate(() => !document.getElementById('keysov').hidden), 'Hot keys panel opens');
    await page.click('#keysClose'); await page.waitForTimeout(60);
    const r = run(page);
    await r('pwd'); await r('ls');
    await page.focus('#in'); await page.keyboard.press('Control+l'); await page.waitForTimeout(60);
    ok(/screen cleared/.test((await term(page)).trim()), 'Ctrl+L clears the screen');
    await page.fill('#in', 'junk'); await page.keyboard.press('Escape'); await page.waitForTimeout(40);
    ok((await page.evaluate(() => document.getElementById('in').value)) === '', 'Esc erases the line');
    await ctx.close();
  }

  // ---- a folder command can't satisfy a "make a file" task (and vice versa) ----
  section('file vs folder type');
  {
    const mk = () => freshPage(browser, seed({ lvl: 1, lesson: 0 })); // make.create: mkdir den, touch den/bowl.txt
    const done = (page) => page.evaluate(() => (document.getElementById('check').innerText.match(/\[x\]/g) || []).length);
    // wrong tool for a "make a folder" task
    let { ctx, page } = await mk();
    await run(page)('touch den');
    ok((await done(page)) === 0, 'touch does not complete a make-a-folder task');
    await ctx.close();
    // right tool advances; then wrong tool for the "make a file" task (no crash)
    ({ ctx, page } = await mk());
    await run(page)('mkdir den');
    ok((await done(page)) === 1, 'mkdir completes the make-a-folder task');
    await run(page)('mkdir den/bowl.txt');
    ok((await done(page)) === 1, 'mkdir does not complete a make-a-file task (no crash)');
    await ctx.close();
    // the correct file command completes the file task
    ({ ctx, page } = await mk());
    await run(page)('mkdir den');
    await run(page)('touch den/bowl.txt');
    ok((await done(page)) === 2, 'touch completes the make-a-file task');
    await ctx.close();
  }

  // ---- move back/forward through finished lessons within a level ----
  section('in-level lesson review');
  {
    const found = []; for (let i = 0; i < 16; i++) found.push([]); found[1] = [0, 1];
    const seenArt = { 'make.create': 1, 'make.write': 1, 'make.copy': 1 };
    const { ctx, page } = await freshPage(browser, seed({ lvl: 1, lesson: 2, lessonMax: 2, found, seenArt })); // make, on lesson 3 of 5
    const lesson = () => page.evaluate(() => document.getElementById('lvl').textContent.match(/lesson (\d+)/)[1]);
    ok(await page.evaluate(() => !document.getElementById('lnav').hidden), 'the lesson review nav is shown');
    ok(await page.evaluate(() => document.getElementById('lnext').disabled), 'cannot step past the furthest lesson');
    await page.click('#lprev'); await page.waitForTimeout(80);
    ok((await lesson()) === '2', 'back goes to an earlier lesson');
    await page.click('#lprev'); await page.waitForTimeout(80);
    ok((await lesson()) === '1' && (await page.evaluate(() => document.getElementById('lprev').disabled)), 'back stops at the first lesson');
    await page.click('#lnext'); await page.waitForTimeout(80);
    ok((await lesson()) === '2', 'next goes forward again');
    await ctx.close();
  }

  // ---- mini-articles before new-command lessons ----
  section('mini-articles');
  {
    const { ctx, page } = await freshPage(browser, seed({ lvl: 1, lesson: 0 }), { keepArticle: true }); // make.create has an article
    ok(await page.evaluate(() => !document.getElementById('artov').hidden), 'an article shows before a new-command lesson');
    ok(/mkdir/i.test(await page.evaluate(() => document.getElementById('artov').innerText)), 'the article matches the lesson (mkdir)');
    await page.click('#artGo'); await page.waitForTimeout(60);
    ok(await page.evaluate(() => document.getElementById('artov').hidden), 'the article closes on "Start the lesson"');
    await ctx.close();
  }
  {
    const { ctx, page } = await freshPage(browser, seed({ lvl: 0, lesson: 5 }), { keepArticle: true }); // nav.check (checkpoint)
    ok(await page.evaluate(() => document.getElementById('artov').hidden), 'checkpoint lessons show no article');
    await ctx.close();
  }
  {
    // on a fresh start the order is story -> article -> task
    const { ctx, page } = await freshPage(browser, null, { keepArticle: true });
    await page.fill('#nameIn', 'Kid'); await page.click('#startBtn'); await page.waitForTimeout(350);
    ok(await page.evaluate(() => !document.getElementById('book').hidden), 'the story shows first on a fresh start');
    ok(await page.evaluate(() => document.getElementById('artov').hidden), 'the article does not cover the story');
    await page.click('#bookSkip'); await page.waitForTimeout(600);
    ok(await page.evaluate(() => !document.getElementById('artov').hidden), 'the article appears after the story ends');
    await ctx.close();
  }

  // ---- phone: Duolingo-style tap builder (desktop is unaffected) ----
  section('mobile tap builder');
  {
    const ctx = await browser.newContext({ hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => pageErrors.push('PAGEERROR ' + e.message));
    const found = []; for (let i = 0; i < 16; i++) found.push([]); found[1] = [0];
    await page.addInitScript((s) => { try { localStorage.setItem('greppo_web_v4', JSON.stringify(s)); } catch (e) {} },
      { name: 'bob', user: 'bob', lvl: 1, lesson: 1, lessonMax: 1, task: 0, found, mastery: {}, review: {}, muted: true, seenIntro: true, mode: 'quest', words: WORDS, seenArt: { 'make.create': 1, 'make.write': 1 } });
    await page.goto(URL + '?tap=1'); await page.waitForTimeout(350);
    try { if (!(await page.evaluate(() => document.getElementById('artov').hidden))) { await page.click('#artGo'); } } catch (e) {}
    ok(await page.evaluate(() => document.body.classList.contains('tap')), 'touch devices get the tap UI');
    ok(await page.evaluate(() => document.activeElement !== document.getElementById('in')), 'on a phone the terminal input is not auto-focused (no keyboard on load)');
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('tapbar')).display === 'block'), 'the tap panel is visible on a phone');
    const tiles = await page.evaluate(() => [...document.querySelectorAll('#tapbar .tapchips button[data-i]')].map((x) => x.textContent));
    ok(tiles.includes('echo') && tiles.includes('den/bowl.txt'), 'tiles include the correct command pieces');
    ok(tiles.length > 4, 'tiles include extra (distractor) pieces');
    // prerequisite folder, then assemble the command by tapping the right tiles
    await page.evaluate(() => { const i = document.getElementById('in'); i.readOnly = false; });
    await page.fill('#in', 'mkdir den'); await page.press('#in', 'Enter'); await page.waitForTimeout(60);
    const tap = async (t) => { await page.evaluate((tok) => { const el = [...document.querySelectorAll('#tapbar .tapchips button[data-i]')].find((x) => x.textContent === tok && !x.classList.contains('used')); if (el) el.click(); }, t); await page.waitForTimeout(40); };
    for (const t of ['echo', 'food', '>', 'den/bowl.txt']) await tap(t);
    ok((await page.evaluate(() => document.getElementById('in').value)) === 'echo food > den/bowl.txt', 'tapping tiles assembles the command');
    const before = await page.evaluate(() => (document.getElementById('check').innerText.match(/\[x\]/g) || []).length);
    await page.evaluate(() => { [...document.querySelectorAll('#tapbar .tapchips button')].find((x) => x.getAttribute('data-act') === 'check').click(); });
    await page.waitForTimeout(100);
    ok((await page.evaluate(() => (document.getElementById('check').innerText.match(/\[x\]/g) || []).length)) > before, 'Check runs the assembled command and completes the task');
    await ctx.close();
  }

  ok(pageErrors.length === 0, 'no uncaught page errors (' + pageErrors.join(' | ') + ')');
} finally {
  await browser.close();
}

console.log(`\n${failures.length ? '❌' : '✅'} integration: ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
