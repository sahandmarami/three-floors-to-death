#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots31/';
const SHOTS = [
  ['day_audit.png', `Day-phase gameplay of Persian zombie tower-defense game at phone size (780x360). A player previously complained that: buttons stacked on each other, weapon quick-switch chips (کلت/شاتگان/مسلسل) sat under the pause button with the clues button falling on them, merchant menu had overlapping text. NOW verify: 1) Are the 3 weapon chips in a clean horizontal row at BOTTOM-CENTER (away from all other buttons)? 2) Does ANY button overlap another button anywhere? 3) Is the top-right build dock visible and clean? 4) Overall layout quality /10.`],
  ['night_audit.png', `Night-phase gameplay of Persian zombie game at phone size. Check: 1) weapon chips row at bottom-center — clean and not overlapping backpack (bottom-left) or anything else? 2) flashlight button (left column) icon large enough to recognize? 3) any button-on-button overlaps? Score /10.`],
  ['merchant_audit.png', `Mystery merchant shop modal of Persian zombie game at phone size. Previously: text overlapped and price pills crashed into text below. NOW check strictly: 1) each item row = icon + name + description + price pill cleanly separated? 2) any text overlapping or cut off? 3) header (دستفروش مرموز + face + close X) clean? Score /10.`],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(DIR + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n########## ${file} ##########`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
}
