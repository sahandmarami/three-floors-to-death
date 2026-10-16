#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/bugs29/crops/';
const SHOTS = [
  ['bug1_left.jpg', 'This is the LEFT side of a phone screenshot from a Persian zombie game. List every button/element and any OVERLAP or stacking problems. What weapon buttons exist and where exactly?'],
  ['bug1_center.jpg', 'Center of phone screenshot, Persian zombie game. What is this panel/menu? List all text and elements, report overlaps or unreadable text.'],
  ['bug1_bottom.jpg', 'Bottom strip of phone screenshot, Persian zombie game. What buttons/panels are here? Report overlaps, stacking, cut-off elements.'],
  ['bug2_left.jpg', 'LEFT half of the mystery merchant (دستفروش مرموز) modal in a Persian zombie game. EXACTLY what Persian text lines do you see? Is text overlapping/colliding/overflowing its container? Are there item cards with readable name+price+buy button? Describe layout problems precisely.'],
  ['bug2_right.jpg', 'RIGHT half of the mystery merchant (دستفروش مرموز) modal in a Persian zombie game. EXACTLY what Persian text lines do you see? Is text overlapping/colliding/overflowing? Are buy buttons visible and labeled? Describe layout problems precisely.'],
  ['bug3_left.jpg', 'LEFT side of phone screenshot, Persian zombie game main hub. What buttons are here? Any overlap between weapon quick-switch chips and other buttons (clues button, next-wave button)? Report exact positions.'],
  ['bug3_right.jpg', 'RIGHT side of phone screenshot, Persian zombie game. What buttons/panels? Any overlap?'],
  ['bug3_bottom.jpg', 'Bottom strip of phone screenshot, Persian zombie game. What is here? Build menu? Report all items shown, categories, overlaps.'],
  ['bug4_left.jpg', 'LEFT side of phone screenshot, Persian zombie game during wave. What buttons? Overlaps?'],
  ['bug4_bottom.jpg', 'Bottom strip of phone screenshot, Persian zombie game. What is here? Build menu items? Categories? Overlaps? Report all.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(DIR + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n\n########## ${file} ##########`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
}
