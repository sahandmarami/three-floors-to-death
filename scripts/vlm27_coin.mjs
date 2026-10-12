#!/usr/bin/env node
// vlm27_coin.mjs — ممیزی VLM: کدام سکه جذاب‌تر است + آیا تپانچه واضح است
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();

async function ask(imgPath, prompt) {
  const b64 = fs.readFileSync(imgPath).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      return res.choices?.[0]?.message?.content || '';
    } catch (e) { if (a === 4) return 'VLM-ERR ' + e.message.slice(0, 60); await new Promise(r => setTimeout(r, 9000)); }
  }
}

const coin = await ask('/home/z/my-project/scripts/coin27/coin_sheet.jpg',
  'This is a contact sheet of 8 gold coin images (#0 to #7, labels top-left) for a mobile game currency icon. Which ONE is the most attractive, shiny, premium game coin? Consider: 3D bevel, shine, clear emblem, roundness. Answer with the number and one-line reason. Then second best.');
console.log('COIN:', coin);

const pistol = await ask('/home/z/my-project/scripts/coin27/pistol_sheet.jpg',
  'Is the object clearly recognizable as a pistol/handgun (NOT a crowbar or wrench)? Rate clarity 1-10 and describe in one sentence.');
console.log('PISTOL:', pistol);
