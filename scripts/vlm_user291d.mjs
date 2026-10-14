#!/usr/bin/env node
// vlm_user291d.mjs — تشخیص نهایی: شیت باز یا نوار شناور؟
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const zai = await ZAI.create();
const b1 = fs.readFileSync(SH + 's1_wpn_zoom.png').toString('base64');
const b2 = fs.readFileSync(SH + 's1_above_wpn.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'text', text: 'Image 1 = zoomed bottom-center of user game screenshot showing a weapon selector (3 weapons). Image 2 = the region ABOVE that weapon selector in the same screenshot. Answer precisely: 1) In image 1: read the exact Persian labels under/over each weapon icon. Are there lock padlocks? Which is highlighted gold? 2) In image 2: what do you see - game scene (grass/zombies/tower), or a menu panel with tabs (ارتقاء/سلاح‌ها/برجک‌ها/بقا) and a small horizontal drag-handle bar? 3) CONCLUSION: Is this weapon selector a standalone floating bar over the game, or is it the tile row of an open bottom-sheet build menu? English.' },
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
