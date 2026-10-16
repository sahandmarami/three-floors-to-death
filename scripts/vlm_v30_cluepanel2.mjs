#!/usr/bin/env node
// vlm_v30_cluepanel2.mjs — خواندن ردیف‌های پنل با دقت بالا
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const B = fs.readFileSync('/tmp/feedback_v30/clue_panel2.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${B}` } },
        { type: 'text', text: `Full-width crop of a Persian game screen with a modal panel. The panel has a title and several rows/buttons. For EACH row in the panel, read the Persian text EXACTLY (right-to-left). Pay special attention to: 1) the FIRST symbol/emoji at the RIGHT edge of each button row, 2) any additional gold/yellow marks like chevrons «», arrows, or bullets near the right edge. The user says rows «گوش بسپار» and «جستجوی محیط» have an unwanted extra mark. List all rows top-to-bottom with their marks. English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
    break;
  } catch (e) { if (a===4) console.log('ERR'); else await new Promise(r=>setTimeout(r,10000)); }
}
