#!/usr/bin/env node
// vlm_v30.mjs — ممیزی بصری v30
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots30/';
const SHOTS = [
  ['menu30.png', 'MAIN MENU of Persian zombie game. Check: 1) Is the scene BRIGHT enough to see clearly (not too dark)? 2) Background zombies: do they look SCARY/menacing (hunched silhouettes, red glowing eyes, open jaw) rather than comical stick figures? 3) Big menu buttons readable? Score /10.'],
  ['rail_night30.png', 'GAMEPLAY NIGHT with left-edge button column. Check: 1) Are the circular buttons on the left edge ALL THE SAME SIZE and EXACTLY vertically aligned in one column with equal spacing? 2) Any text labels under buttons (should be none — icons only)? 3) Count badge on molotov button visible? Score /10.'],
  ['wpn_tab30.png', 'BUILD SHEET weapons tab (Android bottom sheet). Check: 1) Weapon tiles show ONLY icons with NO text labels under them (price shows as small coin+number chip only when purchasable)? 2) Gold highlight on in-hand weapon? 3) Lock badge on locked weapon? Score /10.'],
  ['backpack30.png', 'BACKPACK bottom sheet (Android Material). Check: 1) Sheet slides from bottom with rounded top corners + drag handle? 2) Item cards with icon, name, description and USE button? 3) Count badges? Score /10.'],
  ['clues30.png', 'CLUES section bottom sheet (Android Material). Check: 1) Material bottom sheet with handle + X button (NOT an old centered modal)? 2) Action cards with icons and subtitles? 3) Molotov card with coin price chip? Score /10.'],
  ['molotov_buy30.png', 'After buying molotov in clue sheet. Check: 1) A small Material snackbar/toast confirmation near bottom (NOT a big text flood in corner)? 2) No large Persian text blocks floating over the screen corners? Score /10.'],
  ['settings30.png', 'SETTINGS screen (Android Material card). Check: 1) Does ALL content fit on screen WITHOUT needing scrolling? 2) Compact header with icon + title on one row? 3) Toggle rows + wipe/back buttons visible? Score /10.'],
  ['about30.png', 'ABOUT screen (Android Material card). Check: 1) Does ALL content fit WITHOUT scrolling? 2) Story text readable + credit line + back button? Score /10.'],
];

const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 600));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
