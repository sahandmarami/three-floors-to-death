#!/usr/bin/env node
// vlm_user291e.mjs — خوانش دقیق متن نوار سلاح
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const b1 = fs.readFileSync(SH + 's1_wpn_full_zoom.png').toString('base64');
const zai = await ZAI.create();
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b1}` } },
          { type: 'text', text: 'Highly zoomed bottom strip of a Persian game screenshot. There are 3 weapon tiles. For EACH tile (right to left in RTL order): 1) read ALL Persian text visible on/around the tile EXACTLY as written, 2) is there a small keyboard-key badge (digit) on any corner? 3) any padlock badge position. Also: is there a wide container/bar behind the 3 tiles (one shared dark background box), or 3 separate floating tiles? Is anything else in this strip (grass, buttons)? English + Persian transcriptions.' },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1800));
    break;
  } catch (e) {
    if (a === 4) console.log('VLM-ERR ' + e.message.slice(0, 100));
    else await new Promise(r => setTimeout(r, 10000));
  }
}
