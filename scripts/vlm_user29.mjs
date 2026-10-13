#!/usr/bin/env node
// vlm_user29.mjs — تحلیل اسکرین‌شات‌های کاربر (بازخورد v29)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/';
const SHOTS = [
  ['u_0.png', 'Screenshot from user Samsung phone (2340x1080) of Persian zombie tower defense game. Describe EXACTLY what is wrong: 1) Is a build/construction menu covering the screen badly? How much of the game is hidden? 2) Are weapon icons (pistol/shotgun chips) ugly or unclear? 3) Is the flashlight icon bad? 4) Any other visual problems. Be specific about positions.'],
  ['u_1.png', 'Screenshot from user Samsung phone of Persian zombie tower defense game. Describe EXACTLY what is wrong: 1) Is a build/construction menu covering the screen badly? How much is hidden? 2) Are weapon/flashlight icons ugly? 3) Other problems. Be specific.'],
  ['u_2.png', 'Screenshot from user Samsung phone of Persian zombie tower defense game. Describe EXACTLY what is wrong: 1) Is a build/construction menu covering the screen badly? How much is hidden? 2) Are weapon/flashlight icons ugly? 3) Other problems. Be specific.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
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
