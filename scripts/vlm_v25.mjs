// vlm_v25.mjs — تحلیل بصری اسکرین‌شات‌های v25 با VLM (createVision)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const SH = '/home/z/my-project/scripts/shots25/';
const SHOTS = [
  ['p01_menu.png', 'MAIN MENU on Android landscape phone 780x360. This is the Persian zombie game v25. Evaluate: 1) FONT: Does Persian text look modern Iranian (like Vazirmatn) or old-style Arabic Naskh calligraphy? 2) Is there ANY creator name text at the bottom? (there should be NONE) 3) Are buttons big and touch-friendly? 4) Anything clipped outside the frame? Score /10.'],
  ['p02_confirm.png', 'CONFIRM DIALOG "new game" on Android phone. Evaluate: 1) Material-Android-style card with icon, title, message, two large buttons? 2) Readable Persian text with modern font? 3) Is it beautiful and native-feeling? Score /10.'],
  ['p03_cine.png', 'STORY MOTION CUTSCENE scene 1 on Android phone. Evaluate: 1) Is the cinematic title text LARGE and readable? 2) Are the two walking characters visible and reasonably sized? 3) Does the scene fill the screen nicely? Score /10.'],
  ['p04_cine_dlg.png', 'STORY DIALOGUE inside cutscene on Android phone (dialogue box at bottom with portrait). Evaluate: 1) Is dialogue text LARGE and readable? 2) Portrait big enough? 3) Golden skip button visible and tappable? Score /10.'],
  ['p05_game.png', 'GAMEPLAY on Android phone with HUD (coins/health/level) and build panel. Evaluate: 1) HUD Persian text readable with modern font? 2) Does the level label show ONLY «مرحله X» (no «فصل» chapter, no «از ۳۶» of-36)? 3) Buttons big and touch-friendly? Score /10.'],
];

const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: prompt + ' Answer concisely in English.' },
          ],
        }],
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
  await new Promise(r => setTimeout(r, 3000));
}
