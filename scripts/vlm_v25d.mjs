// vlm_v25d.mjs — بررسی نهایی v25 روی گوشی ۷۸۰×۳۶۰
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  ['12_menu_final', 'FINAL main menu (v25)'],
  ['13_intro_v25', 'FINAL intro scene'],
  ['14_final_gameplay', 'FINAL night gameplay with new HUD'],
  ['15_final_day', 'FINAL day view with night CTA + build drawer + peddler-free layout'],
];
async function main() {
  const zai = await ZAI.create();
  for (const [name, desc] of SHOTS) {
    const p = `/home/z/my-project/scripts/shots25/${name}.png`;
    if (!fs.existsSync(p)) { console.log(`[${name}] missing`); continue; }
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: `Persian zombie tower-defense FINAL v25 check on phone 780x360. ${desc}. Check: overlaps? cut-offs? tiny buttons? stage label? overall 1-10? English, 4 lines max.` }
          ]}],
          thinking: { type: 'disabled' },
          max_tokens: 250
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 500));
        break;
      } catch (e) {
        if (a === 3) console.log(`[${name}] ERR ${e.message.slice(0, 60)}`);
        else await sleep(5000 * a);
      }
    }
    await sleep(1200);
  }
}
main();
