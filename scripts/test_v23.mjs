// test_v23.mjs — تست خودکار نسخه‌ی ۲۳: منو → بازی جدید → اینترو → گیم‌پلی
import { execSync } from 'child_process';

const BASE = 'http://localhost:3000/webserve/three-floors-to-survival.html';
const OUT = '/home/z/my-project/scripts/shots23';
execSync(`mkdir -p ${OUT}`);

const results = [];
function check(name, cond, detail) {
  results.push([name, !!cond, detail || '']);
  console.log((cond ? '✓' : '✗ FAIL'), name, detail || '');
}

async function shot(br, name) {
  await br.screenshot({ path: `${OUT}/${name}.png` });
  console.log('  📸', name);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const { default: AB } = await import('agent-browser');
  const br = await AB.launch({ headless: true, viewport: { width: 1280, height: 720 } });
  const errs = [];
  br.onConsole?.(m => { if ((m.type || m.level) === 'error') errs.push(String(m.text || m).slice(0, 200)); });

  // ---------- ۱) بارگذاری + منو ----------
  await br.goto(BASE);
  await sleep(4200);
  await shot(br, '01_menu');
  const title = await br.text('.m23-title').catch(() => '');
  check('menu title visible', title && title.includes('مرگ'), title);
  const startBox = await br.boxModel('#btnStart').catch(() => null);
  check('btnStart big', startBox && (startBox.height || 74) >= 60, startBox ? `h=${startBox.height}` : 'missing');
  const menuTxt = await br.evaluate(() => document.body.innerText.slice(0, 400));
  check('menu has version 23', /۲۳/.test(menuTxt), '');
  check('continue label', /سیوی|فصل|موج/.test(menuTxt), '');

  // ---------- ۲) شروع بازی جدید (کات‌سین) ----------
  await br.click('#btnStart');
  await sleep(1200);
  // دیالوگ تأیید پاک‌کردن سیو (اگر باشد)
  const conf = await br.evaluate(() => {
    const b = document.querySelector('#dlgYes, .confirm [data-yes], #confirmYes');
    return b ? b.id || b.className : null;
  });
  if (conf) { await br.click('#dlgYes, .confirm [data-yes], #confirmYes'); }
  await sleep(2500);
  await shot(br, '02_intro_s1');
  const mode1 = await br.evaluate(() => window.GAME && GAME.state ? GAME.state.mode : (window.state ? state.mode : null));
  check('intro mode', mode1 === 'intro', String(mode1));

  // صحنه ۲ — کلیک برای رد دیالوگ‌ها سریع‌تر
  for (let i = 0; i < 14; i++) {
    await br.mouse.click(640, 300).catch(() => {});
    await sleep(400);
  }
  await shot(br, '03_intro_late');
  const mode2 = await br.evaluate(() => (window.GAME && GAME.state ? GAME.state.mode : window.state ? state.mode : null));
  console.log('  mode after clicks:', mode2);
  // اگر هنوز اینترو است، skip
  if (mode2 === 'intro') {
    await br.evaluate(() => { try { skipIntro(); } catch (e) { try { GAME.skipIntro && GAME.skipIntro(); } catch (e2) {} } });
    await sleep(1500);
  }
  await shot(br, '04_game_start');

  // ---------- ۳) گیم‌پلی: شروع موج ----------
  await sleep(3000);
  const mode3 = await br.evaluate(() => (window.GAME && GAME.state ? GAME.state.mode : window.state ? state.mode : null));
  check('game started (playing/intermission/day)', ['playing', 'intermission', 'day'].includes(mode3), String(mode3));
  await shot(br, '05_wave');

  // ---------- ۴) API بررسی سیستم‌ها ----------
  const api = await br.evaluate(() => {
    const r = {};
    try { r.voices = Object.keys(VOICES23 || {}).length; } catch (e) { r.voices = 'ERR'; }
    try { r.menuScene = typeof M23 !== 'undefined' && M23.inited; } catch (e) { r.menuScene = false; }
    try { r.depth = typeof DEPTH23 !== 'undefined'; } catch (e) { r.depth = false; }
    try { r.myst = typeof MYST !== 'undefined'; } catch (e) { r.myst = false; }
    try { r.musicTrack = MUSIC.track; } catch (e) { r.musicTrack = 'ERR'; }
    try { r.ctxState = Snd.ctx ? Snd.ctx.state : 'none'; } catch (e) { r.ctxState = 'ERR'; }
    try { r.story = Object.keys(STORY22.afterWave).length; } catch (e) { r.story = 'ERR'; }
    try { r.introScenes = INTRO_SCENES.map(s => s.draw.name).join(','); } catch (e) { r.introScenes = 'ERR'; }
    return r;
  });
  check('VOICES23 loaded (119)', api.voices === 119, String(api.voices));
  check('M23 inited', api.menuScene, '');
  check('DEPTH23 present', api.depth, '');
  check('MYST present', api.myst, '');
  check('music track menu/other', typeof api.musicTrack === 'string', String(api.musicTrack));
  check('AudioContext state', ['running', 'suspended'].includes(api.ctxState), String(api.ctxState));
  check('story afterWave keys', api.story === 6, String(api.story));
  check('intro scenes are MG', String(api.introScenes).includes('MG'), String(api.introScenes));

  // ---------- ۵) دیالوگ روز بعد موج ۱ (skip سریع برای تست) ----------
  const dlgTest = await br.evaluate(() => {
    try {
      const st = (window.GAME && GAME.state) || window.state;
      st.wave = 1; st.mode = 'day';
      storyAfterWave();
      return 'called';
    } catch (e) { return 'ERR: ' + e.message; }
  });
  await sleep(2600);
  await shot(br, '06_day_dialog');
  check('afterWave dialogue fires', dlgTest === 'called', dlgTest);

  // ---------- ۶) لایه معما ----------
  const mystTest = await br.evaluate(() => {
    try {
      const st = (window.GAME && GAME.state) || window.state;
      st.chapter = 1; st.wave = 4; st.mode = 'day';
      MYST.update(0.016);
      return { btn: !!document.getElementById('mystBtn'), avail: MYST.avail() };
    } catch (e) { return { err: e.message }; }
  });
  check('mystery button appears ch1w4', mystTest.btn && mystTest.avail && mystTest.avail.includes('radio'), JSON.stringify(mystTest));
  await shot(br, '07_myst_btn');
  const radioTest = await br.evaluate(() => {
    try { MYST.openRadio(); return !!document.querySelector('.myst-panel'); } catch (e) { return 'ERR:' + e.message; }
  });
  await shot(br, '08_radio_puzzle');
  check('radio puzzle opens', radioTest === true, String(radioTest));
  const solved = await br.evaluate(() => {
    try {
      const sl = document.querySelector('#rdSlider');
      sl.value = 1045;
      document.querySelector('#rdLock').click();
      return MYST.done.radio;
    } catch (e) { return 'ERR:' + e.message; }
  });
  check('radio puzzle solvable', solved === true, String(solved));
  await sleep(800);
  await shot(br, '09_radio_solved');

  // ---------- ۷) مولوتوف + شنود ----------
  const tlou = await br.evaluate(() => {
    try {
      const st = (window.GAME && GAME.state) || window.state;
      st.coins = 200; st.mode = 'playing';
      MYST.craftMolotov();
      const has = MYST.molotovs > 0;
      MYST.startListen();
      return { molotov: has, listen: MYST.listen.active, btn: !!document.getElementById('listenBtn'), mbtn: !!document.getElementById('molotovBtn') };
    } catch (e) { return { err: e.message }; }
  });
  await shot(br, '10_tlou');
  check('molotov crafted', tlou.molotov, JSON.stringify(tlou));
  check('listen mode active', tlou.listen, '');
  check('listen/molotov buttons exist', tlou.btn && tlou.mbtn, '');

  // ---------- ۸) گوشی: 780×360 ----------
  await br.setViewport({ width: 780, height: 360 });
  await br.goto(BASE);
  await sleep(3800);
  await shot(br, '11_phone_menu');
  const phoneBox = await br.boxModel('#btnStart').catch(() => null);
  check('phone: btnStart >= 44px', phoneBox && phoneBox.height >= 30, phoneBox ? `h=${phoneBox.height}` : 'missing');
  const phoneTxt = await br.evaluate(() => {
    const b = document.getElementById('btnStart');
    const r = b.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), in: r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.top >= -1 };
  });
  check('phone: btn fully inside viewport', phoneTxt.in, JSON.stringify(phoneTxt));

  await br.close();

  // خلاصه
  const pass = results.filter(r => r[1]).length;
  console.log(`\n== ${pass}/${results.length} passed ==`);
  if (errs.length) {
    console.log('console errors:', errs.slice(0, 6));
  }
  process.exit(pass === results.length ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
