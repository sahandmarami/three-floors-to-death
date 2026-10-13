#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui30/crops/';
const SHOTS = [
  ['p1_peddler_items.png', `Zoomed crop of the MYSTERIOUS PEDDLER (دستفروش مرموز) purchase menu in a Persian zombie game on a real Samsung phone. The user says this menu is broken ("بهم ریخته"). Look at EVERY item row very carefully. For each row describe: the item name text, its description text, the price pill (gold coin + number), and CRITICALLY whether any text/element visually overlaps or collides with elements of the row above or below. Is vertical spacing between rows correct or collapsed? Are texts clipped/cut off? Is anything unreadable? Describe the exact visual defects in pixel terms.`],
  ['p2_leftcol.png', `Zoomed crop of the LEFT column of a Persian zombie game on a real Samsung phone: weapon switch chips (pistol/shotgun) and circular ability buttons. The user says buttons fall on top of each other (دکمه ها روی هم میفته). Examine EVERY button/chip: do any two buttons overlap or touch each other? Is the selected (gold) chip overlapping its neighbor? Are buttons cramped? Describe each button, its icon, label, and exact overlap/touch problems.`],
  ['p3_backpack.png', `Zoomed crop of the BACKPACK / weapons inventory panel (کوله پشتی / سلاح‌ها) in a Persian zombie game on a real Samsung phone. The user says: the backpack icon is very bad AND when the backpack has items it takes HALF THE SCREEN. Describe: 1) exact panel width vs screen, 2) the item cards - icons quality, size, padding, 3) any column/row marked در حال استفاده (in use) - does it overlap the grid? 4) the backpack button/icon itself, 5) all layout defects.`],
  ['p4_menu_buttons.png', `Zoomed crop of main menu buttons (شروع داستانی / ادامه بازی / درباره / تنظیمات) of a Persian zombie game on a real Samsung phone. Describe each button and look for: overlapping elements, misplaced icons (e.g. an X icon on the start button?), overlapping notification banners, cramped spacing. Be precise.`],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH+file)) continue;
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1800));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
