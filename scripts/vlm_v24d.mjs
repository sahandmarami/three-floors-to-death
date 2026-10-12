// vlm_v24d.mjs — بررسی نهایی v24 روی گوشی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  ['20_phone_menu_final', 'FINAL main menu phone 780x360 — clean, no text below buttons'],
  ['21_phone_intro_final', 'FINAL intro scene phone — brightness + visibility'],
  ['22_phone_dlg_hud_final', 'FINAL dialogue + new HUD phone — big gold coin pill right, big pause left'],
  ['23_phone_combat_final', 'FINAL combat phone — all touch targets finger-sized after scale compensation'],
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
              { type: 'text', text: `Persian zombie game FINAL check on phone 780x360. ${desc}. Rate 1-10: visibility, touch-target sizes, layout quality. Any remaining issues? English, 3 lines max.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 200
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 400));
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
