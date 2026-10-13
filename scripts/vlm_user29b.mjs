#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/';
const SHOTS = [
  ['z1_right.png', 'Close-up of RIGHT side of a Persian zombie game screen on Samsung phone. This shows weapon switch chips (pistol/shotgun) stacked vertically. Describe the weapon icons in detail: what do the pistol and shotgun icons actually look like? Are they pixel-art blobs, unclear, or clean? How is the gold selected-state? Be brutally specific about what looks bad.'],
  ['z2_left.png', 'Close-up of LEFT side of Persian zombie game screen. Shows the flashlight button (چراغ‌قوه) and other circular buttons. Describe each icon in detail — especially the flashlight icon quality. Be brutally specific.'],
  ['z2_sheet.png', 'Close-up of the BUILD bottom-sheet menu in Persian zombie game. Describe: 1) How much vertical space does it take? 2) Are the item tiles huge/wasteful? 3) Text readability? 4) What looks bad specifically?'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH+file)) continue;
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1100));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
