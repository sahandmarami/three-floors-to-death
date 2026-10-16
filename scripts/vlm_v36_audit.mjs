#!/usr/bin/env node
// vlm_v36_audit.mjs — ممیزی بصری نهایی v36
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots36/';
const shots = [
  ['v36_collapse_arash.png', 'Tower collapse cutscene in a Persian zombie game. CHECK: 1) Is a human character (Arash, olive jacket + cap, with backpack) visible descending/standing on zigzag stairs or ground next to the tower? 2) Is a car visible NOT covered by text? 3) Is the subtitle bar at the TOP of the screen (not overlapping the car or ground characters)? Score each /10.'],
  ['v36_collapse_car.png', 'Tower collapse cutscene later moment. CHECK: 1) Red car visible under/near tower with a character on or next to it? 2) Any text overlapping the car? 3) Subtitle at top? Score /10.'],
  ['v36_bpk_center.png', 'Backpack inventory dialog. CHECK: 1) Is the dialog a small card CENTERED on screen (NOT a bottom sheet stuck to bottom edge)? 2) Header has a NEW 3D-style backpack icon (navy body + gold straps + gold buckle)? 3) Item cards with use buttons? 4) Close X button? Score /10.'],
  ['v36_clue_center.png', 'Clues archive dialog. CHECK: 1) Small card centered on screen (not bottom sheet)? 2) Touch cards list (radio/code/fuse/scavenge/molotov)? 3) Readable, nothing overflowing? Score /10.'],
  ['v36_tile_name.png', 'Build menu tiles. CHECK: 1) Do item tiles show their NAME overlaid ON THE CENTER of the item image (with dark pill behind), NOT below the image? 2) Names readable? 3) Price chips at bottom? Score /10.'],
  ['v36_announce_toast.png', 'Gameplay with a notification toast. CHECK: 1) Is the announcement a compact dark pill near the TOP of the screen (below HUD)? 2) NOT a big text in the middle of the screen? 3) Not overlapping HUD chips or left rail circles? Score /10.'],
  ['v36_peddler_icons.png', 'Mysterious peddler shop panel with items. CHECK: 1) Are the item ICONS visually DISTINCT from each other (different colors/shapes)? 2) One item should be a blueprint (light blue engineering paper with big turret sketch - missile launcher art), another a syringe (adrenaline). 3) Prices visible? Score /10.'],
  ['v36_day2.png', 'Day scene of chapter 2. CHECK: 1) UI clean? 2) Left rail buttons visible as circles? 3) Nothing broken? Score /10 briefly.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of shots) {
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
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 800));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
