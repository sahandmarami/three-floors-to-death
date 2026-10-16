#!/usr/bin/env node
// vlm_v30_mybtn.mjs — دکمه پایین‌چپ اینتروی خودم
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/my_zone_button.png').toString('base64');
for (let a = 1; a <= 3; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'text', text: `Bottom-left strip of a game intro screenshot. There should be a gold/yellow rounded button. Read its Persian text EXACTLY character by character. Also describe any other text visible. English answer.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 500));
    break;
  } catch (e) { if (a===3) console.log('ERR'); else await new Promise(r=>setTimeout(r,8000)); }
}
