#!/usr/bin/env node
// vlm_v33bugs.mjs — تحلیل اسکرین‌شات‌های باگ کاربر (درایو، ۱۳ اکتبر)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const DIR = '/home/z/my-project/download/drive_v33/';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg')).sort();
// نام‌های فارسی → برچسب کوتاه
const labels = ['shot1_194835', 'shot2_194843', 'shot3_195031', 'shot4_195046'];

const PROMPTS = [
  `This is a screenshot from a Persian zombie tower-defense game on a real Samsung phone (landscape). Describe EXACTLY what you see: game state, UI elements, any visible TEXT (Persian captions/subtitles), buttons, problems or bugs. Is this during a cutscene (cinematic black bars, collapsing tower, car)? Is ANY subtitle/caption text visible? Be precise.`,
  `This is a screenshot from a Persian zombie tower-defense game on a real Samsung phone (landscape). Describe EXACTLY what you see: game state, UI elements, any visible TEXT, buttons, problems or bugs. If this is a driving minigame: where is the car on the road? Any skip button visible (رد کردن)? Be precise.`,
  `This is a screenshot from a Persian zombie tower-defense game on a real Samsung phone (landscape). Describe EXACTLY what you see: game state, UI, visible TEXT, buttons, bugs. If a menu: how dark is the background? Describe any zombie figures (face, eyes, pose). Be precise.`,
  `This is a screenshot from a Persian zombie tower-defense game on a real Samsung phone (landscape). Describe EXACTLY what you see: game state, UI, visible TEXT, buttons, bugs. Be precise.`,
];

const zai = await ZAI.create();
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const b64 = fs.readFileSync(path.join(DIR, f)).toString('base64');
  let done = false;
  for (let a = 1; a <= 3 && !done; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: PROMPTS[i % PROMPTS.length] + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== [${labels[i] || f}] =====`);
      console.log(res.choices[0].message.content.trim());
      done = true;
    } catch (e) {
      if (a === 3) console.log(`\n===== [${labels[i] || f}] FAILED: ${e.message} =====`);
      else await new Promise(r => setTimeout(r, 1500));
    }
  }
}
