#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots30/';
const SHOTS = [
  ['m1_menu.png', 'Main menu of Persian zombie game (merged v30.1). Check: clean SVG icons on 4 buttons, no overlaps, story-flavored subtitle. Rate 1-10.'],
  ['m2_peddler.png', 'Mysterious peddler purchase dialog (merged v30.1). Check: rows cleanly separated, PNG icons visible, no build-dock bleeding behind, readable. Rate 1-10.'],
  ['m3_day_all.png', 'Day phase with everything visible + inflated font stress test (merged v30.1): top-right build dock, top-left area buttons, bottom-left backpack row. Check ANY overlapping elements. Rate 1-10.'],
  ['m4_night.png', 'Night battle (merged v30.1): build dock top-right open, weapon chips top-left, listen button left, backpack bottom-left. Check ANY overlapping elements and general layout. Rate 1-10.'],
  ['m5_gameover.png', 'Game-over card (merged v30.1). Check: no floating UI overlapping card buttons. Rate 1-10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  if (!fs.existsSync(SH+file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
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
  await new Promise(r => setTimeout(r, 2000));
}
