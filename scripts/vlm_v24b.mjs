// vlm_v24b.mjs — تحلیل اسکرین‌شات‌های v24 (پس از بازسازی)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  ['10_menu_v24', 'main menu — user wanted NO texts below the main buttons (chips removed)'],
  ['11_intro_s1_v24', 'intro scene 1 city sunset — was darkness 8/10, now brightened: vivid sunset, lit street lamps, visible characters'],
  ['12_intro_s3_v24', 'intro scene 3 finding building — now with bright moon + two flashlight beams on building'],
  ['13_intro_s4_v24', 'intro scene 4 fortifying — now with warm work-lamp + dusk sky'],
  ['14_prewave_dlg_v24', 'pre-wave dialogue + new HUD: big gold coin pill top-right, big pause button top-left'],
  ['15_combat_v24', 'combat HUD at phone 780x360: coin pill prominence, pause button, flash button bottom-left cluster, build panel right side'],
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
              { type: 'text', text: `Persian zombie game phone screenshot (780x360), v24 rebuild. ${desc}. Report: 1) darkness/visibility 1-10 (10=perfectly visible) 2) is the gold coin counter prominent and beautiful? 3) any clipping/tiny buttons/unreadable text? 4) verdict + top issue. English, compact.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 320
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 620));
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
