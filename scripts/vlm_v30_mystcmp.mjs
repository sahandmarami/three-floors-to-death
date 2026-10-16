#!/usr/bin/env node
// vlm_v30_mystcmp.mjs — مقایسه پنل سرنخ خودم با کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/myst_rows_zoom.png').toString('base64');
const B = fs.readFileSync('/tmp/feedback_v30/panel_listen_row.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${B}` } },
        { type: 'text', text: `Image 1 = CURRENT build's clue panel rows (zoomed). Image 2 = USER's screenshot rows (zoomed). The user complained there is an unwanted MARK before options «گوش بسپار» and «جستجوی محیط». Compare: 1) List rows in each image. 2) Does Image 1 (current build) have rows «گوش بسپار»? 3) In Image 2, look VERY carefully at the right edge of rows: is there a chevron/arrow/small gold mark separate from the main emoji icon? 4) What emoji icons do rows have in each? English, precise.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
    break;
  } catch (e) { if (a===4) console.log('ERR', e.message.slice(0,80)); else await new Promise(r=>setTimeout(r,10000)); }
}
