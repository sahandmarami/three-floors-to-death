#!/usr/bin/env node
// vlm_v30_cluepanel.mjs — خواندن دقیق پنل سرنخ کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const B = fs.readFileSync('/tmp/feedback_v30/clue_panel.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${B}` } },
        { type: 'text', text: `Crop of a game panel (Persian zombie game). Read the panel TITLE at top exactly. Then list each button/row: for EACH one describe: 1) the text, 2) ANY icon/emoji/mark/symbol at the START (right side in RTL) of the row — describe the mark precisely (emoji? bullet? circle? arrow? letter?), 3) does any row have a mark that looks out of place or duplicated? The user complained there is an extra mark before «گوش بسپار» and «جستجوی محیط» options. Precise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
    break;
  } catch (e) { if (a===4) console.log('ERR'); else await new Promise(r=>setTimeout(r,10000)); }
}
