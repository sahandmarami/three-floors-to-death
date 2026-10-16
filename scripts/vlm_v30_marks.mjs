#!/usr/bin/env node
// vlm_v30_marks.mjs — بررسی سه علامت
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const files = [
  ['mark0.png', 'y=25-27% row'],
  ['mark1.png', 'y=66% row'],
  ['mark2.png', 'y=81% row'],
  ['mark_ctl.png', 'control: top radio row'],
];
for (const [file, label] of files) {
  const b64 = fs.readFileSync('/tmp/feedback_v30/' + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Zoomed 3x crop from a Persian game panel row (${label}). Describe: 1) any gold/yellow chevron, arrow, caret «›», play-button or triangle symbol visible — where exactly in crop? 2) the row's Persian text? 3) the main emoji icon? One short paragraph English.` },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n== ${label} ==`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 400));
      break;
    } catch (e) { if (a===3) console.log(`${label} ERR`); else await new Promise(r=>setTimeout(r,8000)); }
  }
  await new Promise(r => setTimeout(r, 1200));
}
