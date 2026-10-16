#!/usr/bin/env node
// vlm_v38_final.mjs — ممیزی نهایی v38
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots38/';
const zai = await ZAI.create();
const SHOTS = [
  ['t38_intro.png', `Intro cinematic of Persian zombie game (780x360). The user complained: "when the story is told, the texts are at TOP — bring them DOWN". Check: 1) Is the dialogue/story text box now at the BOTTOM of screen (with portrait book icon)? 2) Does it overlap characters or scene action at bottom? 3) Score /10.`],
  ['t38_trans.png', `Chapter transition cutscene of Persian zombie game (780x360, car/driving scene). The dialogue box should be at TOP here (car + character at bottom must stay visible). Check: 1) Dialogue box at top? 2) Car/characters at bottom NOT covered by text? Score /10.`],
  ['t38_clues.png', `Clue/survival sheet of Persian zombie game (780x360). The user complained: "there is a mark before options «گوش بسپار» and «جستجوی محیط» — remove it". Check: 1) Are the option rows (جست‌وجوی محیط / کوکتل مولوتوف / گوش بسپار) WITHOUT any chevron/arrow mark at their edge now? 2) Only the main emoji icon (🔍🔥👂) at row start? 3) Price ۴۵ on molotov still visible? Score /10.`],
  ['t38_menu.png', `Main menu of Persian zombie game (780x360). User complained about too much white fog at bottom and lame zombies. Check: 1) Bottom: white fog gone/strongly reduced? Ground visible? 2) Zombies: big, menacing, glowing red eyes, any crawling pose? 3) Menu clean and readable? Score /10.`],
];
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
    } catch (e) { if (a===4) console.log(`${file} VLM-ERR ${e.message.slice(0,80)}`); else await new Promise(r=>setTimeout(r,10000)); }
  }
  await new Promise(r => setTimeout(r, 2000));
}
