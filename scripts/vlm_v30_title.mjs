#!/usr/bin/env node
// vlm_v30_title.mjs — خواندن عنوان و ردیف
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const files = [
  ['panel_title.png', `Panel TITLE of a Persian game modal, zoomed 2x. Read the Persian title EXACTLY letter by letter. It might be «آرشیو سرنخ‌ها» or similar.`],
  ['panel_listen_row.png', `Bottom rows of a Persian game modal. There should be rows like «گوش بسپار» (with ear icon) and possibly «کوکتل مولوتوف». Read each row's text exactly. Then describe the MARKS at the RIGHT edge of each row: any chevron «›», arrow, bullet, or symbol in gold/yellow OUTSIDE the main icon? Precise English.`],
];
for (const [file, prompt] of files) {
  const b64 = fs.readFileSync('/tmp/feedback_v30/' + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 800));
      break;
    } catch (e) { if (a===4) console.log(`${file} ERR`); else await new Promise(r=>setTimeout(r,10000)); }
  }
  await new Promise(r => setTimeout(r, 1500));
}
