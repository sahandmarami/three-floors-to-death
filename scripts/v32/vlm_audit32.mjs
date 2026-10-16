#!/usr/bin/env node
// vlm_audit32.mjs — ممیزی بصری v32 در رزولوشن گوشی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots32/';
const SHOTS = [
  ['day32_dev.png', 'Day view of Persian zombie tower defense game on a Samsung phone (2340x1080). Verify: 1) Is there ANY weapon selector bar at the bottom-center of the screen? (should be GONE) 2) The clue button (سرنخ‌ها) top-left - describe its new design (icon, badge). 3) The flashlight button left side - is the icon clear/recognizable? 4) The backpack bottom-left - is its logo big enough? 5) The build dock (ساخت و ساز) top-right - size and icon quality. Rate each 1-10.'],
  ['clue_menu32_dev.png', 'The redesigned clues menu (پرونده‌ی سرنخ‌ها) of a Persian game. Evaluate: 1) Visual hierarchy - are evidence cards, active mystery cards, and survival action cards clearly DISTINGUISHED? 2) Are numbered evidence badges (۰۱ ۰۲) visible? 3) Section headers with rule lines (not floating text)? 4) Is the panel centered on screen? 5) Overall attractiveness 1-10 vs a boring flat list.'],
  ['dock32_dev.png', 'The build/construction dock open on a Persian game. Verify: 1) Are the 5 upgrade tiles (ارتقاء tab) all visible in a wrapped row? 2) Are tile icons large and clear? 3) Tabs readable? 4) Does the dock stay in the upper area without covering the ground/zombies? 5) Rate usability 1-10.'],
  ['night32_dev.png', 'Night battle view of Persian game. Verify: 1) NO weapon chips/bar at bottom-center (removed by design)? 2) Game view unobstructed for shooting? 3) Any UI element blocking the play area? Rate 1-10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  try {
    const b64 = fs.readFileSync(SH + file).toString('base64');
    for (let a = 1; a <= 4; a++) {
      try {
        const res = await zai.chat.completions.createVision({
          messages: [{ role: 'user', content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
              { type: 'text', text: prompt + ' Concise English answer.' },
          ] }],
          thinking: { type: 'disabled' },
        });
        console.log(`\n===== ${file} =====`);
        console.log((res.choices?.[0]?.message?.content || '').slice(0, 1300));
        break;
      } catch (e) {
        if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
        else await new Promise(r => setTimeout(r, 10000));
      }
    }
    await new Promise(r => setTimeout(r, 2500));
  } catch (e) { console.log(`${file} FILE-ERR ${e.message.slice(0, 60)}`); }
}
