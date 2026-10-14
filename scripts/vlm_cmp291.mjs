#!/usr/bin/env node
// vlm_cmp291.mjs — مقایسه اسکرین‌شات محلی با اسکرین‌شات کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const b1 = fs.readFileSync(SH + 's1_small.jpg').toString('base64');
const b2 = fs.readFileSync(SH + 't_wpn_tab.png').toString('base64');
const b3 = fs.readFileSync(SH + 't_closed.png').toString('base64');
const zai = await ZAI.create();
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'text', text: 'Image 1 = USER screenshot from real phone. Image 2 = my local build with build-sheet open on weapons tab. Image 3 = my local build with sheet closed. QUESTIONS: 1) In image 1 (user), is the build sheet OPEN or CLOSED? 2) In image 1, the bottom-center horizontal bar with 3 weapons (مسلسل/شاتگان/کلت) — does this same element exist in image 2 or image 3? Which one matches? 3) What is different between image 1 and image 2? List the UI layout differences precisely. Concise English.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b1}` } },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b2}` } },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b3}` } },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 2200));
    break;
  } catch (e) {
    if (a === 4) console.log('VLM-ERR ' + e.message.slice(0, 100));
    else await new Promise(r => setTimeout(r, 10000));
  }
}
