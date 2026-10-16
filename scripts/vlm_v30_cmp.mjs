#!/usr/bin/env node
// vlm_v30_cmp.mjs — مقایسه اسکرین‌شات کاربر با اینترو بیلد فعلی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/shot_intro1_v30.png').toString('base64');   // بیلد فعلی
const B = fs.readFileSync('/tmp/feedback_v30/باگ_نوشته_ها_باید_بی.png').toString('base64'); // کاربر
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${B}` } },
        { type: 'text', text: `Image 1 = current build intro cinematic (780x360). Image 2 = USER's screenshot (2340x1080) where they complain story text is at TOP and must move to BOTTOM. Questions: 1) Are these the SAME screen/scene? 2) In Image 1, where is the dialogue text box (top or bottom)? 3) In Image 2, where is it? 4) What is the gold button in Image 2 bottom-left — read it carefully. 5) Any other layout differences? Answer concisely in English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
    break;
  } catch (e) { if (a===4) console.log('ERR', e.message.slice(0,100)); else await new Promise(r=>setTimeout(r,10000)); }
}
