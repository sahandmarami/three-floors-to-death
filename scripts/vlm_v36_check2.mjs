#!/usr/bin/env node
// vlm_v36_check2.mjs — بررسی دقیق ارشان و توست
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const shots = [
  ['crop_arash_zone.png', 'Zoomed view of a collapsing tower scene. The tower is partially collapsed (bottom floors crumbled). Questions: 1) Is there a small human silhouette ON THE SIDE of the tower (on zigzag stairs, mid-height, left side of tower)? Describe any humanoid figure and its exact position. 2) Is there a red/colored car parked on the ground to the LEFT of the tower? 3) Is there any figure standing on top of the tower roof? Be precise. English.'],
  ['v36_announce_toast.png', 'Gameplay screenshot. Questions: 1) Is there a compact dark rounded notification pill near the TOP-CENTER of the screen (below the HUD chips) with gold title text? 2) Is the middle of the screen free of big text? 3) Does the pill overlap any HUD element or the left-edge circular buttons? English, score /10.'],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 800));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
