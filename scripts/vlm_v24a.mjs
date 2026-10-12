// vlm_v24a.mjs — تحلیل اسکرین‌شات‌های وضعیت فعلی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  ['00_menu_current', 'main menu at phone size 780x360 — user wants texts below main buttons removed'],
  ['01_intro_current', 'intro motion-graphics scene 1 — user says TOO DARK, nothing visible'],
  ['02_intro_later', 'intro motion-graphics later scene — check visibility of characters/building'],
  ['03_prewave_dlg', 'pre-wave dialogue + game start'],
  ['04_combat_hud', 'combat gameplay HUD at phone size — check: coin display prominence, pause button size, left control rail, right build panel, any clipping outside frame'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [name, desc] of SHOTS) {
    const p = `/home/z/my-project/scripts/shots24/${name}.png`;
    if (!fs.existsSync(p)) { console.log(`[${name}] missing`); continue; }
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
              { type: 'text', text: `Persian zombie game phone screenshot (780x360). ${desc}. List concisely: 1) exact visible problems (darkness level 1-10, clipping, tiny buttons, invisible elements) 2) what text/labels you can read 3) quick verdict. English, compact.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 350
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 650));
        break;
      } catch (e) {
        if (a === 3) console.log(`[${name}] ERR ${e.message.slice(0, 100)}`);
        else await sleep(6000 * a);
      }
    }
    await sleep(1500);
  }
}
main();
