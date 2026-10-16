#!/usr/bin/env node
// vlm_v30_zoom.mjs — زوم روی ناحیه متن بالای اسکرین‌شات کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

// crop top half
execSync(`python3 -c "
from PIL import Image
img = Image.open('/tmp/feedback_v30/باگ_نوشته_ها_باید_بی.png')
w,h = img.size
img.crop((0,0,w,int(h*0.45))).save('/tmp/feedback_v30/crop_top.png')
img.crop((0,int(h*0.45),w,h)).save('/tmp/feedback_v30/crop_bot.png')
img.resize((w//2,h//2)).save('/tmp/feedback_v30/full_small.png')
print('ok')
"`);

const SH = '/tmp/feedback_v30/';
const SHOTS = [
  ['crop_top.png', `TOP 45% crop of a Persian zombie game screenshot. Read ALL Persian text visible here and describe each text element: 1) The exact Persian text in the rounded box, 2) any names/labels, 3) the small square icons. What screen/system does this look like (story narration? dialogue? cutscene?)? Transliterate or translate the Persian text.`],
  ['crop_bot.png', `BOTTOM 55% crop of a Persian zombie game screenshot. Read ALL Persian text/buttons visible and describe what UI elements exist (characters, buttons, icons). Translate the Persian text.`],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
