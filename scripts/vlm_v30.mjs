#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots30/';
const SHOTS = [
  ['v1_menu.png', 'Main menu of Persian zombie game after v30 fixes. Check: 1) Do the main buttons (شروع داستان/ادامه بازی/تنظیمات/درباره) have clean SVG icons (sword, play, gear, info) instead of odd glyphs? 2) Any overlapping elements? 3) Is the subtitle story-flavored (no level counts)? Rate layout quality 1-10.'],
  ['v2_peddler.png', 'The mysterious peddler (دستفروش مرموز) purchase dialog in Persian zombie game after v30 fix. Check: 1) Are item rows (name, description, gold price pill) cleanly separated with NO text overlapping other rows or prices? 2) Is the panel reasonably wide and readable? 3) Any build-menu tiles or tabs bleeding through behind the panel? Rate 1-10.'],
  ['v2_sheet.png', 'The build/construction bottom-sheet in Persian zombie game after v30 fix. Check: 1) Only ONE tab\'s items visible (no mixed sections)? 2) No peddler dialog overlapping? 3) Tabs and tiles readable, not overlapping? Rate 1-10.'],
  ['v3_bpk_open.png', 'Backpack (کوله پشتی) expanded drawer at bottom-left of Persian zombie game after v30 redesign. Check: 1) Is it a SLIM single row (not half the screen)? 2) Small square slots with icons? 3) Does anything overlap it? 4) Is the small backpack pill with counter visible? Rate 1-10.'],
  ['v4_gameover.png', 'Game-over/defeat card in Persian zombie game after v30 fix. Check: 1) Is the card clean with NO floating UI (backpack bar, buttons) overlapping the retry/menu buttons? 2) Skull icon, stats chips, two big buttons visible and separated? Rate 1-10.'],
  ['v5_day_all_infl.png', 'Day phase of Persian zombie game with simulated inflated system font (1.22x) - stress test. Check: 1) Do ANY buttons/texts overlap each other anywhere? 2) Is the left column (flashlight button, peddler pill) clean? 3) Bottom-left backpack drawer slim? 4) Weapon chips on the right OK? Rate 1-10 and list ANY overlap.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH+file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
