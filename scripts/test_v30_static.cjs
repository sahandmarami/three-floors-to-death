#!/usr/bin/env node
// test_v30.sh equivalent in Node — ۳۰ test for v30
// dock сверху + icons + vendor fix + new intro script + pause 2btn regression
const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');

const URL = 'http://localhost:3002/three-floors-to-survival.html';
const HTML = fs.readFileSync('/home/z/my-project/download/three-floors-to-survival.html', 'utf8');

let pass = 0, fail = 0;
const t = (name, cond) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
};

console.log('=== v30 — static source checks ===');
t('build contains ICONS30 map', HTML.includes('const ICONS30 = {'));
t('v4_ui30 in chain (dock css)', HTML.includes('#buildPanel{\n  top:calc(62px') || /#buildPanel\{[^}]*top:calc\(62px/s.test(HTML));
t('dock horizontal row css', /#bpList\{[^}]*flex-direction:row/.test(HTML) || HTML.includes('flex-direction:row!important'));
t('FAB/scrim/mini-night legacy removed css', HTML.includes('#bpFab28,#bpScrim29,#bpNightMini28{display:none!important}'));
t('night button bottom-right restored', /#bpNight\{[^}]*right:calc\(12px/.test(HTML));
t('vendor flex fix (min-height:0)', HTML.includes('#pdStock{\n  flex:1 1 auto!important;min-height:0!important') || /#pdStock\{[^}]*min-height:0/.test(HTML));
t('vendor uiz width', HTML.includes('width:min(calc(430px * var(--uiz,1)), calc(92vw / var(--uiz,1)))'));
t('no auto-collapse at night (chapters)', !HTML.includes('setBuildPanel(true, true);             // شب: پنل جمع') && !/شب: پنل جمع/.test(HTML));
t('new intro scene order (find before street)', HTML.indexOf('introScFindMG') < HTML.indexOf('introScStreetMG', HTML.indexOf('INTRO_SCENES')));
t('new intro dlg n30a present', HTML.includes("v: 'n30a', text: 'همه‌چیز با یک ویروس شروع شد"));
t('new intro dlg r30r (radio) present', HTML.includes("v: 'r30r', text: 'توجه، توجه! همهٔ بازماندگان"));
t('transition T1 t30a1 present', HTML.includes("v: 't30a1', text: 'برج داره می‌ریزه"));
t('transition T2 t30p1 present', HTML.includes("v: 't30p1', text: 'همه‌جا رو مه گرفته"));
t('transition T3 t30a4 present', HTML.includes("v: 't30a4', text: 'جاده پر از زامبیه"));
t('shelter h30m1 present', HTML.includes("v: 'h30m1', text: 'خوش اومدید"));
t('final f30r present', HTML.includes("v: 'f30r', text: 'توجه به تمام واحدها"));
t('afterFinal empty', /STORY22\.afterFinal = \[\];/.test(HTML));
t('preWave1 empty', /STORY22\.preWave1 = \[\];/.test(HTML));
t('afterWave[4] removed', !HTML.includes("v: 'c1w4r'"));
t('tbc new typed text', HTML.includes("'پایان فصل اول داستان پناهگاه: ادامه دارد...'"));
t('tbc voice key tbc30n', HTML.includes("'tbc30n'"));
t('about teaser text', HTML.includes('ویروس اومد و شهر یه‌شبه ساکت شد'));
t('about ends with ...', HTML.includes('بساز، بجنگ، زنده بمون...'));
t('aw4 new text (no battri word issue)', HTML.includes("text: 'چراغ‌قوه‌ت داره خاموش می‌شه!'"));
t('voices30 data (new keys)', HTML.includes('n30a:{d:') && HTML.includes('f30n:{d:') && HTML.includes('tbc30n:{d:'));
t('voices30 grim retakes present', HTML.includes('c1w3a:{d:') && HTML.includes('aw1:{d:'));
t('announce above dock z-index', HTML.includes('#announce{z-index:10!important}'));
t('vendor img class css', HTML.includes('img.pd-ic30'));

console.log(`\nstatic: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
