#!/usr/bin/env node
// vlm_v40.mjs — ممیزی بصری v40 روی پایهٔ v39
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots40/';
const SHOTS = [
  ['menu.png', 'MAIN MENU of Persian zombie game «سه طبقه تا مرگ» (780x360 phone). Check: 1) NO white fog/mist bands anywhere (fog was removed)? 2) Exactly ~3 background zombie silhouettes, standing, menacing, red eyes? 3) Bright balanced night scene (blood moon, lit building)? 4) Persian title/buttons readable? Score /10.'],
  ['intro.png', 'INTRO cinematic scene 1 (burned city) in Persian zombie game. Check: 1) Two survivor figures in a ruined city scene? 2) Dialogue box at BOTTOM with Persian text «وای... شهر چی شده...» and speaker name آرش? 3) No overlapping texts, no glitches? Score /10.'],
  ['arrive.png', 'CINEMATIC: shelter gate arrival at night. Big metal gate right side, warm windows, guard figure, two walking survivors. Dialogue at bottom. Check readability + atmosphere. Score /10.'],
  ['fire.png', 'CINEMATIC: night campfire «توقف‌گاه امن». Small fire center with orange glow, three silhouettes around, starry sky, paper in hand. Dialogue at bottom. Score /10.'],
  ['plat1.png', 'NEW run-and-gun PLATFORMER level (Contra style) in Persian zombie game: player with gun, varied terrain platforms, ruined parallax background, sunset, touch controls (◀▶ left, پرش/شلیک right), hearts HUD top-left, level name top-center. Score /10.'],
  ['plat2.png', 'PLATFORMER gameplay in action: player running/shooting, bullets visible, zombies with red eyes on terrain, camera scrolled. Check action readability. Score /10.'],
  ['station.png', 'CINEMATIC: North Station interior — cold blue light, broken windows, desks with monitors, wounded female scientist (Dr. Sara) behind desk in lab coat, papers scattered, two entering survivors. Dialogue with دکتر سارا. Score /10.'],
  ['tbc.png', 'FINAL SCREEN: typed Persian text «این داستان ادامه دارد...» centered with glow, continue button. Score /10.'],
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
      else await new Promise(r => setTimeout(r, 2500));
    }
  }
}
