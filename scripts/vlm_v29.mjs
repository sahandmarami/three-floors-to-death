#!/usr/bin/env node
// vlm_v29.mjs — ممیزی بصری سه درخواست کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots29v/';
const SHOTS = [
  ['day_free.png', 'DAY view of Persian zombie tower defense on Android phone. USER COMPLAINT: the build menu used to drop onto the screen covering everything. Check: 1) Is the gameplay FULLY visible now (tower, street, no big menu covering)? 2) Is there a blue FAB button bottom-right with label «ساخت‌وساز»? 3) Gold night button next to it? Score /10.'],
  ['sheet_open.png', 'BUILD bottom-sheet OPEN in Persian zombie game. Check: 1) Does the sheet take only the LOWER ~half (game still visible above it)? 2) Compact tiles with prices? 3) Rounded corners + drag handle + scrim dimming? 4) Readable Persian? Score /10.'],
  ['weapons_zoom.png', 'Close-up of weapon switch chips (right side, zoomed 2x) in Persian zombie game. USER COMPLAINT: old pixel icons were ugly. Check: 1) Are the icons now clean line-art SVG style (pistol with angled grip, shotgun with pump, machine gun with magazine)? 2) Gold selected state subtle (thin border, not gaudy)? 3) Small lock badge on locked chip (not big emoji)? Score /10.'],
  ['flash_zoom.png', 'Close-up of left control buttons (zoomed) in Persian zombie game. The flashlight button (چراغ‌قوه). Check: 1) Is the flashlight icon a clean vertical torch with light rays on top? 2) Label «چراغ‌قوه» readable below? 3) Battery bar visible? Score /10.'],
  ['pause.png', 'PAUSE MENU in Persian zombie game. USER REQUEST: pause menu should ONLY have «ادامه» (continue) and «ذخیره و خروج» (save & exit) buttons. Check: 1) Exactly two big buttons? 2) No settings/about/restart buttons visible? 3) Clean material card? Score /10.'],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 900));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
