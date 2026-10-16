#!/usr/bin/env node
// vlm_v30_bands.mjs — تعیین دقیق نوار متن
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/tmp/feedback_v30/';
const zai = await ZAI.create();
const bands = [['band0.png','top 0-25%'],['band1.png','25-50%'],['band2.png','50-75%'],['band3.png','75-100%']];
for (const [file,label] of bands) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Horizontal band (${label}) of a game screenshot. YES/NO: Does this band contain a rounded rectangular dialogue/story TEXT box with Persian text (not background art)? If YES, describe its position inside this band. One sentence.` },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`${label}: ${(res.choices?.[0]?.message?.content || '').slice(0, 300)}`);
      break;
    } catch (e) { if (a===3) console.log(`${label} ERR`); else await new Promise(r=>setTimeout(r,8000)); }
  }
  await new Promise(r => setTimeout(r, 1500));
}
