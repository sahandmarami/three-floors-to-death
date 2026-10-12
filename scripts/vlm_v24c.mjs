// vlm_v24c.mjs — تحلیل نهایی v24 (روز/پنل/توقف/اینترو روشن‌شده)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHOTS = [
  ['16_intro_s1_lift', 'intro scene 1 after brightness lift — vivid sunset city'],
  ['17_intro_s4_lift', 'intro scene 4 after lift — fortifying with work lamp'],
  ['18_day_panel_v24', 'DAY mode at phone 780x360: build panel right side (touch tiles, no PC hotkeys), coin pill, pause button, backpack bottom-left, clue button bottom-right'],
  ['19_pause_v24', 'pause screen at phone size — buttons must be big and touch-friendly'],
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
              { type: 'text', text: `Persian zombie game on phone (780x360), v24. ${desc}. Report concisely: 1) visibility 1-10 2) ALL touch targets big enough for fingers? list any too small 3) anything clipped outside frame or overlapping 4) overall verdict. English.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 300
        });
        console.log(`\n[${name}] ` + (res.choices[0].message.content || '').slice(0, 580));
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
