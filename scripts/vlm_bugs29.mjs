#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/bugs29/';
const SHOTS = [
  ['bug1.jpg', `REAL Samsung phone screenshot (2340x1080 landscape, Persian zombie tower-defense game). Describe EVERYTHING you see in detail: which menu/screen is this? List every UI element, every button, every piece of Persian text. CRITICAL: report any overlapping elements (buttons on top of other buttons, text colliding with text), anything cut off screen edges, any unreadable/mangled text, any broken icons. Be extremely specific about positions (left/right/top/bottom).`],
  ['bug2.jpg', `REAL Samsung phone screenshot (2340x1080 landscape, Persian zombie tower-defense game). Describe EVERYTHING you see in detail: which menu/screen is this? List every UI element, every button, every piece of Persian text. CRITICAL: report any overlapping elements (buttons stacked on buttons, text colliding), anything cut off, unreadable text, broken icons, elements that look squashed or misplaced. Be extremely specific about positions.`],
  ['bug3.jpg', `REAL Samsung phone screenshot (2340x1080 landscape, Persian zombie tower-defense game). Describe EVERYTHING you see in detail: which menu/screen is this? List every UI element, every button, every piece of Persian text. CRITICAL: report any overlapping elements (buttons stacked on buttons, text colliding), anything cut off, unreadable text, broken icons, elements that look squashed or misplaced. Be extremely specific about positions.`],
  ['bug4.jpg', `REAL Samsung phone screenshot (2340x1080 landscape, Persian zombie tower-defense game). Describe EVERYTHING you see in detail: which menu/screen is this? List every UI element, every button, every piece of Persian text. CRITICAL: report any overlapping elements (buttons stacked on buttons, text colliding), anything cut off, unreadable text, broken icons, elements that look squashed or misplaced. Be extremely specific about positions.`],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(DIR + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer in English, be thorough.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n\n########## ${file} ##########`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 2500));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
}
