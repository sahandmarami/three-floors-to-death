#!/usr/bin/env node
// vlm_v28.mjs — ممیزی بصری v28 (بازخورد کاربر)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots28v/';
const SHOTS = [
  ['scene3.png', 'STORY MOTION scene: characters find the half-destroyed building at night. Previously this scene showed a BLANK WHITE or BLANK BLACK screen. Check: 1) Is the scene fully visible (building, characters, city)? 2) No blank/white/black screen? 3) Building looks ruined 3-floor tower? Score /10.'],
  ['gameplay.png', 'GAMEPLAY DAY view of Persian zombie tower defense on Android. Check: 1) Health bar is a rounded Android pill with heart icon? 2) Level chip (مرحله) present? 3) Weapon chips row (pistol/shotgun) visible? 4) NO text floating in the middle of the screen? Score /10.'],
  ['hud_weapons.png', 'GAMEPLAY HUD with two weapons owned. Check: 1) Weapon switch chips at top-left with pistol and shotgun icons, one highlighted gold? 2) Health pill + coin + level chip clean Android style? 3) Nothing overlapping the street? Score /10.'],
  ['buildsheet.png', 'BUILD MENU as Android bottom sheet. Check: 1) Sheet slides from BOTTOM with rounded top corners and drag handle? 2) Tabs with icons? 3) Item tiles with prices (coin icon)? 4) Compact, not covering whole screen? Score /10.'],
  ['fab.png', 'GAMEPLAY with build FAB button. Check: 1) Gold floating action button (FAB) at bottom-right with hammer/build icon? 2) Easily reachable by right thumb? 3) Not overlapping zombie street path (y bottom area)? Score /10.'],
  ['pause.png', 'PAUSE MENU Android Material style. Check: 1) Big gold «ادامه» (resume) button at top? 2) «ذخیره و خروج» (save & exit) full-width button? 3) Small row for settings/about? 4) NO restart button? 5) Clean modern card? Score /10.'],
  ['defeat.png', 'DEFEAT/GAME OVER screen. Check: 1) Material card with glowing skull icon? 2) Stats chips (wave, kills)? 3) Two buttons (retry / menu)? 4) Cool dramatic dark red style, NOT plain text? Score /10.'],
  ['menu.png', 'MAIN MENU. Check: 1) No version text? 2) No creator name? 3) Big buttons? Score /10 briefly.'],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 700));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
