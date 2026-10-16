#!/usr/bin/env node
// vlm_user291.mjs — تحلیل اسکرین‌شات‌های جدید کاربر (بازخورد v29.1)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const SHOTS = [
  ['s1_small.jpg', `Screenshot from user Samsung phone (2340x1080) of Persian zombie tower defense game. The user complains (translated): "The clue button (سرنخ) is not cool" and "when I tap it, the panel first slides from the bottom and then moves to the center". Describe EXACTLY: 1) Where is the clue button and what does it look like (color, shape, text)? 2) Is any panel/dialog visible? Where is it positioned (center/bottom)? 3) The bottom weapon chips area - what weapons are shown? 4) The build (ساخت و ساز) and backpack (کوله) button logos - how big/visible are they exactly? 5) The flashlight (چراغ قوه) button - describe its icon quality. 6) All other visible UI elements with exact positions.`],
  ['s2_small.jpg', `Screenshot from user Samsung phone (2340x1080) of Persian zombie tower defense game. The user complains the clues menu (منوی سرنخ) is "not attractive and meaningless". Describe EXACTLY: 1) Is this the clues menu/panel? What does it look like (layout, cards, colors)? 2) Where exactly is the panel on screen (center/bottom/size)? 3) What text/items are shown inside? 4) How could it look better - describe current visual weaknesses precisely. 5) All other visible UI elements with positions.`],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
            { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 2000));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
