#!/usr/bin/env node
// vlm_v30_mystfull.mjs — کل پنل سرنخ بیلد فعلی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/shot_myst_current.png').toString('base64');
for (let a = 1; a <= 3; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'text', text: `Game screen (780x360) with a modal clue panel open (Persian zombie game). List ALL visible UI elements: 1) The modal panel: title, each row with its exact Persian text and leading emoji icon. 2) Any FLOATING buttons outside the panel (bottom corners etc) with their icons/labels. 3) Any gold chevron/arrow marks anywhere. English, precise.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
    break;
  } catch (e) { if (a===3) console.log('ERR'); else await new Promise(r=>setTimeout(r,8000)); }
}
