#!/usr/bin/env node
// vlm_v27.mjs — ممیزی بصری کامل v27
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots27/';
const SHOTS = [
  ['v27_01_menu.png', 'MAIN MENU of Persian zombie game on Android landscape 780x360. Check: 1) NO version text anywhere (no «نسخه»)? 2) NO creator name? 3) Big touch-friendly buttons? 4) Anything clipped or ugly? Score /10.'],
  ['v27_02_cine1.png', 'STORY MOTION scene 1 (city at sunset) of Persian zombie game. Check: 1) Is the scene ATTRACTIVE — cinematic sky, distant fire smoke columns, light rays? 2) Are background zombies detailed silhouettes (not stick figures)? 3) Is dialogue readable? Score /10.'],
  ['v27_04_cine3.png', 'STORY MOTION scene 3 (finding the abandoned building). Check: 1) Does the building look like a 3-floor tower (narrower floors going up)? 2) Ruined/damaged details visible? 3) Is the scene attractive with atmosphere (dust, rays)? Score /10.'],
  ['v27_05_cine4.png', 'STORY MOTION scene 4 (fortified building with red flag). Check: 1) Building matches a 3-floor defense tower with battlements on roof and red flag? 2) Character repairing on ladder visible? 3) Warm/attractive lighting? Score /10.'],
  ['v27_06_day.png', 'GAMEPLAY DAY view. Check: 1) Is there a LARGE golden «شب شود» (start night) button at BOTTOM-RIGHT with moon icon and Persian text? 2) Is the backpack bar CENTERED at bottom? 3) Left column buttons (flashlight with label) not overlapping anything? 4) Real coin image in HUD top? Score /10.'],
  ['v27_07_pause.png', 'PAUSE MENU (Android Material style). Check: 1) Material card with round icon at top? 2) Full-width touch buttons: ادامه بازی (gold), تنظیمات, درباره‌ی بازی, ذخیره و خروج, شروع دوباره (red)? 3) Clean modern look? Score /10.'],
  ['v27_08_settings.png', 'SETTINGS (Android Material style). Check: 1) Material card with icon rows (sound/music/vibration toggles + volume slider)? 2) Danger zone with red «پاک‌کردن سیو» button? 3) NO save-code/download/import buttons? 4) Clean look? Score /10.'],
  ['v27_09_about.png', 'ABOUT page (Material style). Check: 1) Material card with info icon? 2) Persian story text readable? 3) Creator credit at bottom? Score /10.'],
  ['v27_10_vendor.png', 'MYSTERIOUS PEDDLER SHOP (centered dialog). Check: 1) Material-style purple card with portrait, name, X close button? 2) Item rows with icon, name, description, price pill with REAL gold coin image? 3) Attractive modern look? Score /10.'],
  ['v27_11_day_pedpill.png', 'DAY view with peddler present. Check: 1) Purple «خرید از دستفروش» pill in left column BELOW flashlight button (no overlap)? 2) Flashlight button has Persian label «چراغ‌قوه» under it? Score /10.'],
  ['v27_12_weapons.png', 'BUILD PANEL with WEAPONS tab open. Check: 1) Is the pistol item icon a clear PISTOL (not a crowbar)? 2) Are item tiles aligned without overlapping labels? 3) Prices with small coin icon? Score /10.'],
  ['v27_13_night.png', 'NIGHT gameplay. Check: 1) Real gold coin image in HUD (not flat gradient circle)? 2) Health bar styled with depth? 3) Flashlight button in left column with label? 4) Nothing blocking the zombie street view badly? Score /10.'],
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
