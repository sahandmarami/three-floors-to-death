#!/usr/bin/env node
// vlm_v33.mjs — ممیزی بصری v33
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots33/';
const SHOTS = [
  ['menu.png', 'MAIN MENU of Persian zombie tower defense (landscape 780x360). Check: 1) Background clearly visible and NOT too dark (sky/ground/city silhouette readable)? 2) Shadow zombies: do they have a sensible SIDE-PROFILE shape (one eye, jaw, natural arms swinging opposite to legs)? 3) Title and buttons readable? Score /10.'],
  ['collapse_stairs.png', 'TOWER COLLAPSE CUTSCENE moment: a 3-floor tower collapsing at night. Check: 1) A subtitle caption visible at bottom (Persian text in dark capsule)? 2) A second character (Arash) descending stairs on the LEFT side of the tower (small figure between tower and parked car)? 3) A car parked at LEFT side of screen (not entering from edge)? 4) Player on the roof? Describe what you see precisely. Score /10.'],
  ['collapse_car.png', 'TOWER COLLAPSE final moment: tower fully collapsed to rubble, car under it. Check: 1) Car positioned at center-right near tower base with player on it? 2) Subtitle visible? 3) Scene logical? Score /10.'],
  ['build_names.png', 'BUILD DOCK menu (top area) in Persian zombie game. Check: 1) Each item tile shows a NAME LABEL text below/beside icon? 2) Icons + names + prices all readable, not overlapping? 3) How many tiles visible and how many show names? Score /10.'],
  ['build_survival.png', 'BUILD DOCK survival tab (بقا). Check: 1) Do ALL visible tiles have name labels (e.g. چراغ‌قوه flashlight, کیت کمک‌های اولیه medkit)? 2) Names readable? Score /10.'],
  ['clue_listen.png', 'CLUE ARCHIVE panel (پرونده سرنخ‌ها). Check: 1) Survival action cards at bottom including a NEW card with ear icon 👂 (گوش بسپار)? 2) Layout clean? Score /10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log(res.choices[0].message.content.trim());
      break;
    } catch (e) {
      if (a === 3) console.log(`\n===== ${file} FAILED: ${e.message} =====`);
      else await new Promise(r => setTimeout(r, 1500));
    }
  }
}
