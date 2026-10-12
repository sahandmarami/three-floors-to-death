// vlm_v23.mjs — تحلیل بصری اسکرین‌شات‌های نسخه ۲۳
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const SHOTS = [
  ['01_menu', 'main menu (new design: cinematic canvas scene + big gold buttons)', 60],
  ['02_intro_s1', 'intro cutscene scene 1 (motion-graphics: city, two survivors walking)', 55],
  ['04_intro_s4', 'intro cutscene scene 4 (fortifying: boarding up windows on ladder)', 55],
  ['05_wave', 'gameplay night wave (2.5D depth: fog, moonlight, building)', 55],
  ['07_radio', 'radio tuning puzzle panel', 45],
  ['09_phone_menu', 'main menu on small phone viewport 780x360', 60],
];

async function main() {
  const zai = await ZAI.create();
  for (const [name, desc, w] of SHOTS) {
    const p = `/home/z/my-project/scripts/shots23/${name}.png`;
    if (!fs.existsSync(p)) { console.log(`[${name}] missing`); continue; }
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
              { type: 'text', text: `Persian zombie tower-defense game "سه طبقه تا مرگ" — ${desc}. Rate visual quality /10 (be strict but fair: this is a 2D canvas indie game), then list: 1) TOP 3 things that look GOOD 2) TOP 3 concrete visual problems (layout/clipping/contrast/empty areas/misalignment) 3) Are the big buttons clearly visible & readable? Answer in English, compact.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 420
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 700));
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
