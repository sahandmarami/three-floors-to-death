#!/usr/bin/env node
// vlm_final291.mjs — نگاه آخر به بالا-راست اسکرین‌شات کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const b1 = fs.readFileSync(SH + 's1_topright.png').toString('base64');
const zai = await ZAI.create();
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b1}` } },
          { type: 'text', text: 'Top-right region of user game screenshot. List every element top-to-bottom with approximate sizes: health bar? coin counter? wave text? the build dock (ساخت و ساز pill with box icon)? Are any elements overlapping each other? Is the build dock icon (toolbox/box) too small to recognize? English.' },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1100));
    break;
  } catch (e) {
    if (a === 4) console.log('VLM-ERR ' + e.message.slice(0, 100));
    else await new Promise(r => setTimeout(r, 10000));
  }
}
