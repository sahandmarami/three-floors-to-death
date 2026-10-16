#!/usr/bin/env node
// vlm_v36_icon.mjs — پیدا کردن آیکون کوله‌پشتی که کاربر داده
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const files = fs.readdirSync(DIR).filter(f => f.startsWith('left_') || f.startsWith('full_'));

const zai = await ZAI.create();
for (const f of files.sort()) {
  const b64 = fs.readFileSync(DIR + f).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Look at every icon in this image. Is there a BACKPACK icon anywhere? If yes, describe it EXACTLY: its shape, colors, style (emoji vs line-art vs 3D), what pocket/lock/badge details it has, and where it is located. If a game's left-edge rail of round buttons is visible, list each button's icon top-to-bottom. Be very precise about the backpack icon appearance. Answer in English.` },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${f} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 900));
      break;
    } catch (e) {
      if (a === 4) console.log(`${f} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
