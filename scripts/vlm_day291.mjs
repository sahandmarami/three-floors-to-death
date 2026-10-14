#!/usr/bin/env node
// vlm_day291.mjs — چی زیر پایین صفحه‌ی بازی محلی من ترسیم شده؟
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const b1 = fs.readFileSync(SH + 't_day_zoom.png').toString('base64');
const b2 = fs.readFileSync(SH + 's1_wpn_full_zoom.png').toString('base64');
const zai = await ZAI.create();
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'text', text: 'Image 1 = zoomed bottom-center of MY local game (day mode). Image 2 = zoomed bottom-center of USER phone screenshot. QUESTION: In image 1, what is drawn at the bottom-center on the grass? Is it the same weapon selector bar as image 2 (3 weapon tiles with names کلت/شاتگان/مسلسل, padlocks, gold-selected)? Describe what you see in image 1 precisely - shapes, colors, any text. English.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b1}` } },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b2}` } },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
    break;
  } catch (e) {
    if (a === 4) console.log('VLM-ERR ' + e.message.slice(0, 100));
    else await new Promise(r => setTimeout(r, 10000));
  }
}
