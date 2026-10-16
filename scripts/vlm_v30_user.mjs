#!/usr/bin/env node
// vlm_v30_user.mjs — تحلیل اسکرین‌شات‌های بازخورد کاربر (v30)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/tmp/feedback_v30/';
const SHOTS = [
  ['باگ_نوشته_ها_باید_بی.png', `USER SCREENSHOT (Persian zombie game, story/cutscene moment on Android 2340x1080). The user complains: "when the story is being told, the text is at the TOP of the screen — it must move to the BOTTOM". Describe precisely: 1) WHERE is the story/dialogue text currently located (top/middle/bottom, approx y%)? 2) Is it a subtitle bar or free-floating text? 3) What else is on screen (characters, building, night scene)? 4) Does the top text overlap/cover important visuals like faces or the building? Be very precise about text position and any overlap problems.`],
  ['باگ.png', `USER SCREENSHOT of a Persian zombie game (Android 2340x1080). This image shows one or more UI bugs the user complained about. The user said: "the white fogs at the bottom of the MAIN MENU are too many and the menu looks bad" AND "the menu zombies are not cool". Analyze: 1) Is this the main menu or gameplay? 2) WHERE exactly are white fog/mist layers (bottom? how strong %? how much of screen)? 3) How do the zombies look (style, pose, size, cool or lame)? 4) Overall menu readability problems. Be precise.`],
  ['ایکون_بازی.png', `This is the NEW GAME ICON the user wants to use for their Persian zombie tower-defense game (app icon). Describe: 1) Full content of the icon (subject, colors, style)? 2) Does it contain any text/letters? What? 3) Background color (solid/gradient/transparent)? 4) Is it suitable as an Android app icon (square, centered subject)? Describe in detail for reproduction purposes.`],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
