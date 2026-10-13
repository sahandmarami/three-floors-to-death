#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const SH = '/home/z/my-project/scripts/shots30/';
const SHOTS = [
  ['day_dock_collapsed.png', 'Landscape phone game, DAY phase. NEW top-right build dock (collapsed pill) should show: a small crate/supply icon + Persian label «ساخت‌وساز» + chevron, positioned top-right under the HUD. Also top-LEFT: 3 weapon quick-swap chips (pistol/shotgun/rifle icons as colorful cartoon PNGs). Bottom-left: backpack bar. Bottom-right: golden «شب شود» button. Check: 1) Is the build pill visible top-right with icon+label? 2) Are weapon chips top-left with colorful cartoon weapon icons? 3) Any overlapping UI or blocked gameplay? Score /10.'],
  ['dock_open_weapons.png', 'Build dock EXPANDED (top-right panel in the sky area) with 4 Persian tabs and a horizontal row of item tiles. The weapons tab shows pistol/shotgun/machine-gun tiles with colorful cartoon PNG icons + prices. Check: 1) Does the dock stay in the TOP sky area (not covering the ground/tower/zombies)? 2) Tiles have colorful cartoon weapon icons? 3) Tabs readable? Score /10.'],
  ['dock_open_upgrades.png', 'Same dock on the upgrades tab (تعمیر/سرعت/جون/ارتقا tiles) — icons are cartoon PNGs (first-aid kit, runner, shield...). Check tiles look clean + dock does not cover gameplay. Score /10.'],
  ['night_dock_open.png', 'NIGHT combat with zombies attacking a 3-floor tower. The build dock should be OPEN at top-right while zombies are visible on the ground — mid-game access to building! Check: 1) Dock open at top WITHOUT covering zombies/tower? 2) Zombies visible? 3) Overall playable look? Score /10.'],
  ['vendor_fixed.png', 'Mysterious vendor shop modal (purple Persian card). Previously BUG: item cards were clipped at the bottom + messy. Check NOW: 1) Are item cards fully visible or the list scrolls (no raw cut-off mid-card at panel edge)? 2) Colorful cartoon PNG item icons on the left of each card? 3) Gold price pills readable, not overlapped by text? 4) Header with portrait + title + close button? Score /10.'],
  ['about_new.png', 'About screen (Persian Material card). Should show a SHORT teaser story (3-4 lines) ending with «...», NOT the full story: «ویروس اومد و شهر یه‌شبه ساکت شد...» / «روی پشت‌بومِ یه برج سه‌طبقه، با یه کلت و چندتا تخته شروع می‌کنی.» / «۳۶ شب تا رسیدن به پناهگاه — هر شب از قبلی وحشی‌تره.» / «بساز، بجنگ، زنده بمون...» + credit. Check text matches roughly + looks attractive + ends with ... Score /10.'],
  ['intro_scene1.png', 'Intro cinematic scene 1 (abandoned city motion-graphics) with a Persian dialogue box. The speaker should be «راوی» (narrator) with text starting «همه‌چیز با یک ویروس شروع شد...». Check: 1) Scene renders (no white/black screen)? 2) Dialogue box with راوی? Score /10.'],
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
  await new Promise(r => setTimeout(r, 2000));
}
