#!/usr/bin/env node
// vlm_v36_check3.mjs — تأیید نهایی کات‌سین فروریختن با دیالوگ بالا
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const shots = [
  ['v36_collapse_arash.png', 'Tower collapse cutscene. CHECK: 1) Human character (Arash) visible descending zigzag side stairs at mid-height of tower? 2) Red car parked on ground LEFT of tower, NOT covered by any dialog/text? 3) Dialog box (portrait + text) now at TOP of screen? 4) Player guard on roof? Score /10.'],
  ['v36_collapse_run.png', 'Tower collapse cutscene, later moment. 1) Arash visible on the ground running toward the parked car (left side)? 2) Car fully visible, nothing covering it? 3) Any text only at top? Score /10.'],
  ['v36_collapse_car.png', 'Tower collapse final moment. 1) Red car under/near tower with player character on/next to it — fully visible? 2) No text overlapping the car? Score /10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of shots) {
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 700));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
