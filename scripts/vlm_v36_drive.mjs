#!/usr/bin/env node
// vlm_v36_drive.mjs — بررسی اسکرین‌شات‌های درایو کاربر برای v36
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/download/drive_v33/';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg'));

const zai = await ZAI.create();
for (const f of files) {
  const b64 = fs.readFileSync(DIR + f).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: `This is a screenshot of a Persian zombie tower-defense game on Android (landscape). Describe precisely: 1) All circular buttons on the LEFT edge of the screen (top to bottom): what icon does each have? 2) If a peddler/shop panel is open: what items are shown, are their icons distinct or identical-looking, what are prices? 3) If a build menu is open: do item tiles have text labels BELOW the images or overlaid on images? 4) Is there any BACKPACK icon visible anywhere (describe its look exactly)? 5) Any text overlapping other UI at top of screen? Answer concisely in English.` },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${f} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
      break;
    } catch (e) {
      if (a === 4) console.log(`${f} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
