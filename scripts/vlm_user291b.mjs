#!/usr/bin/env node
// vlm_user291b.mjs — تحلیل دقیق‌تر برش‌های اسکرین‌شات کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const SHOTS = [
  ['s1_bottom.jpg', 'Bottom crop of user Samsung phone screenshot (landscape game). Describe EVERY button/element with exact position: weapon chips (pistol/shotgun/minigun) - where exactly, what do labels say? Backpack button? Build button? Any small icons that are hard to see? Be very precise about sizes - which elements look TOO SMALL?'],
  ['s1_top.jpg', 'Top crop of user Samsung phone screenshot (landscape game). Describe: clue button (سرنخ) appearance/position, health bar, coins, wave text, build button (ساخت و ساز) position and size, any other buttons. Which elements are too small or ugly?'],
  ['s2_full.jpg', 'Full screenshot of the clues menu (منوی سرنخ). Describe layout weaknesses: header, cards, colors, icons, empty space, visual hierarchy. What exactly makes it look boring/meaningless?'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const f = file.replace('_full',''); // s2_full -> s2
  const b64 = fs.readFileSync(SH + f).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
            { type: 'text', text: prompt + ' Concise English answer.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
