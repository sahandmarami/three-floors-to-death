#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots28v/';
const SHOTS = [
  ['buildsheet2.png', 'BUILD MENU as Android bottom sheet (Persian zombie game, landscape phone). The sheet should: slide up from the bottom edge, have rounded top corners, a drag handle bar at top, tab row with icons, item tiles with prices. Check: 1) Is the bottom sheet clearly open covering the lower half? 2) Rounded corners + handle? 3) Readable Persian? Score /10.'],
  ['defeatcine.png', 'DEFEAT CINEMATIC: tower collapsing floor by floor with zombies swarming. Check: 1) Is the collapse scene visible with rubble/dust? 2) Dramatic? Score /10 briefly.'],
  ['defeat2.png', 'GAME OVER / DEFEAT screen (after tower collapse). Check: 1) Material dark card with glowing red skull icon at top? 2) Persian title like «سقوط برج» + stats chips (wave reached, kills)? 3) Two big buttons (retry/menu)? 4) Cool dramatic style — NOT plain boring text? Score /10.'],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 800));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
