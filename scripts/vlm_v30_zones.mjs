#!/usr/bin/env node
// vlm_v30_zones.mjs — بررسی دقیق ناحیه‌های کراپ‌شده
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/tmp/feedback_v30/';
const zai = await ZAI.create();
const zones = [
  ['zone_textbox.png', `Crop of RIGHT-TOP half (x from 35% to 100%, y from 0 to 55%) of a Persian game screenshot. Describe EXACTLY what UI elements you see: 1) Is there a rounded rectangle text panel with Persian story text? Where exactly in this crop (top/middle/bottom, left/right)? 2) Is there a square portrait icon (open book with gold border)? Where? 3) Read the Persian text you can see. 4) Is there any «کلیک / Space = ادامه» hint?`],
  ['zone_button.png', `Crop of LEFT-BOTTOM area (x 0-45%, y 60-100%) of a Persian game screenshot. What do you see? Any gold/yellow button with Persian text? Read the text exactly. Any characters/zombies?`],
];
for (const [file, prompt] of zones) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer in English, be precise.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1000));
      break;
    } catch (e) { if (a===3) console.log(`${file} ERR`); else await new Promise(r=>setTimeout(r,8000)); }
  }
  await new Promise(r => setTimeout(r, 1500));
}
