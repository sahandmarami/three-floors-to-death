#!/usr/bin/env node
// vlm_final34.mjs — final visual audit of all v34 screens
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots34/';
const SHOTS = [
  ['f_menu.png', 'MAIN MENU of Persian zombie game (780x360, landscape phone). Check: 1) Is the night scene BRIGHT ENOUGH to see sky/moon/city clearly? 2) Background zombies: scary (hunched silhouettes, reaching arms, red glowing eyes) or silly? 3) Title + buttons readable? Score /10.'],
  ['f_day.png', 'DAY screen of Persian RTL game (780x360, touch mode). Check LEFT RAIL: 1) Round buttons stacked vertically - same size, same x-position, evenly spaced? 2) Describe icons. 3) Any overlapping UI anywhere? Score /10.'],
  ['f_clues.png', 'CLUES bottom-sheet (Android style) over game. Check: 1) Proper bottom sheet with grab handle + header + close? 2) Cards touch-friendly? 3) Any text flood/overflow? 4) Score /10.'],
  ['f_bpk.png', 'BACKPACK bottom-sheet with 2-column grid of item cards + USE buttons. Check: 1) Cards readable, buttons big? 2) Persian text fits? 3) Score /10.'],
  ['f_settings.png', 'SETTINGS dialog (Material style, compact). Check: 1) Does ALL content fit on screen without scrolling? 2) 2-column toggle grid? 3) Two buttons side by side? Score /10.'],
  ['f_about.png', 'ABOUT dialog (compact). Check: 1) All text fits without scrolling? 2) Readable story text? Score /10.'],
  ['f_sur.png', 'BUILD DOCK survival tab (بقا) in Persian game. Check: 1) Do item tiles show NAME labels that FIT inside tiles (no overflow, especially the first-aid kit tile)? 2) Icons + prices readable? Score /10.'],
  ['f_wpn.png', 'BUILD DOCK weapons tab (سلاح‌ها). Check: 1) Do weapon tiles show NO name labels (icons + price only)? 2) Clean look? Score /10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n##### ${file} #####`);
      console.log(res.choices[0].message.content.trim());
      break;
    } catch (e) {
      if (a === 3) console.log(`\n##### ${file} FAILED: ${e.message}`);
      else await new Promise(r => setTimeout(r, 1500));
    }
  }
}
