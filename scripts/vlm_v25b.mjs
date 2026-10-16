// vlm_v25b.mjs — کراپ‌های زوم‌شده: HUD راست / CTA / چپ
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TASKS = [
  ['z1_hud_right', 'Zoomed top-RIGHT of game HUD. Describe EXACTLY: the coin pill (icon shape, number), the health bar (capsule shape? segments? heart icon? colors), the stage chip text (quote Persian text exactly). Any visual glitch/misalignment?'],
  ['z2_cta_bottom', 'Zoomed BOTTOM-CENTER of game. There should be a large pill CTA button with a glowing moon icon and Persian text. Quote its main text and sub-text exactly. Does it look attractive and tappable? Does it overlap the backpack slots on the left or anything else?'],
  ['z3_left', 'Zoomed LEFT side. Describe pause/mute buttons (size, style). Is there any fullscreen button? Any element cut off?'],
];
async function main() {
  const zai = await ZAI.create();
  for (const [name, q] of TASKS) {
    const p = `/home/z/my-project/scripts/shots25/${name === 'z2_cta_bottom' ? 'z2_cta' : name}.png`;
    if (!fs.existsSync(p)) { console.log(`[${name}] missing`); continue; }
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: q + ' English, max 8 lines.' }
          ]}],
          thinking: { type: 'disabled' },
          max_tokens: 300
        });
        console.log(`\n[${name}]\n` + (res.choices[0].message.content || '').slice(0, 800));
        break;
      } catch (e) {
        if (a === 3) console.log(`[${name}] ERR ${e.message.slice(0, 80)}`);
        else await sleep(5000 * a);
      }
    }
    await sleep(1000);
  }
}
main();
