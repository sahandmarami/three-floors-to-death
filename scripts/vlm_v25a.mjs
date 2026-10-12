// vlm_v25a.mjs — بررسی رابط کاربری جدید v25 روی گوشی ۷۸۰×۳۶۰
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const DIR = '/home/z/my-project/scripts/shots25';
const SHOTS = [
  ['02_menu_fresh', 'main menu fresh (no save)'],
  ['04_day_wave2', 'DAY view: NEW bottom-center night CTA button (moon+text), coin pill top-right with animated coin logo, health capsule, stage chip «مرحله ۱», build drawer right'],
  ['07_pedler_shop', 'peddler LEFT drawer open + build panel + night CTA + backpack — check NO overlaps'],
  ['08_build_open', 'build drawer OPEN right side with tabs/tiles/prices'],
  ['09_pause', 'pause menu Android-style with stats chips'],
  ['10_night_combat', 'night combat: HUD visible, build panel collapsed, CTA hidden'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [name, desc] of SHOTS) {
    const p = `${DIR}/${name}.png`;
    if (!fs.existsSync(p)) { console.log(`[${name}] missing`); continue; }
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
              { type: 'text', text: `Persian zombie tower-defense game on Android phone 780x360 landscape. Context: ${desc}. CHECK STRICTLY: 1) Do any buttons/panels OVERLAP each other or get cut off screen edges? 2) Are all touch targets finger-sized? 3) Quote the wave/stage label text exactly. 4) Is the coin display attractive? 5) Rate UI 1-10. Answer in English, max 12 lines.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 400
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 900));
        break;
      } catch (e) {
        if (a === 3) console.log(`[${name}] ERR ${e.message.slice(0, 80)}`);
        else await sleep(5000 * a);
      }
    }
    await sleep(1200);
  }
}
main();
