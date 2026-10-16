#!/usr/bin/env node
// vlm_v30_menubtns.mjs — دکمه‌های منو در عکس کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const B = fs.readFileSync('/tmp/feedback_v30/باگ.jpg').toString('base64');
for (let a = 1; a <= 3; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${B}` } },
        { type: 'text', text: `Main menu screenshot of a Persian zombie game (2340x1080, so 780x360 CSS pixels at 3x). The menu should have buttons: «شروع داستان» (gold/primary), «ادامه‌ی بازی», «تنظیمات», «درباره». Questions: 1) Where are the menu buttons located (left/right/center, y%)? 2) Are the buttons BIG and touch-friendly (tall, ~150+ physical px) or small/cramped? 3) Read the button texts. 4) Describe title «سه طبقه تا مرگ» position. 5) How many zombies visible and where exactly? Concise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
    break;
  } catch (e) { if (a===3) console.log('ERR'); else await new Promise(r=>setTimeout(r,8000)); }
}
