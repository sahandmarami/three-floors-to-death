#!/usr/bin/env node
// vlm_v36_collapse.mjs — بررسی بصری کات‌سین فروریختن (قبل از فیکس)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const shots = [
  ['collapse_before.png', 'Tower collapse cutscene at t=2.5s. Questions: 1) Is a human character (Arash) visible descending side stairs of the tower? 2) Are zigzag side stairs visible on tower side? 3) Is a car visible parked left of tower? 4) Does the subtitle text at bottom overlap/cover the car or ground characters? Answer each YES/NO + describe. English.'],
  ['collapse_t5.png', 'Tower collapse cutscene t=5.0s. 1) Is Arash (human silhouette) visible running on the ground toward a car? 2) Is the car visible and NOT covered by subtitle text? 3) Where exactly is the subtitle box (top/middle/bottom)? Does it overlap the car? English.'],
  ['collapse_t6_6.png', 'Tower collapse cutscene t=6.6s. 1) Is the car visible under the tower with player on/next to it? 2) Does subtitle text cover the car making it hard to see? 3) Any human character visible? English.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of shots) {
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt },
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
