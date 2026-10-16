#!/usr/bin/env node
// vlm_v36_icon2.mjs — توصیف دقیق آیکون کوله‌پشتی مرجع
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const files = ['rail_full.png', 'rail_top.png', 'rail_mid.png', 'rail_bot.png'];

const zai = await ZAI.create();
for (const f of files) {
  const b64 = fs.readFileSync(DIR + f).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Find the BACKPACK icon in this image (a 3D game-asset style backpack, dark navy body with golden-yellow straps). Describe it in precise detail so a designer can redraw it as SVG: exact silhouette shape, body color, flap color, strap paths, buckle/clasp shape and position, any side pockets, highlights/shading direction, and the circle/container it sits in (background color, border color, size relative to other buttons). Also list the other round buttons visible and their icons top-to-bottom. Answer in English.` },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${f} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1100));
      break;
    } catch (e) {
      if (a === 4) console.log(`${f} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
