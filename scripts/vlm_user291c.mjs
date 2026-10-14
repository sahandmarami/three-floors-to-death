#!/usr/bin/env node
// vlm_user291c.mjs — تشخیص دقیق نوار سلاح پایین + سمت‌ها
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
const SHOTS = [
  ['s1_wpnbar.png', 'This is the bottom-center region of a game screenshot. Is there a horizontal weapon bar/selector with 3 weapon icons (labels like کلت/شاتگان/تیربار or مسلسل)? Describe: is it a separate floating bar or part of a build menu sheet? Are there lock icons? Is the selected one highlighted?'],
  ['s1_right.png', 'Right region of game screenshot. What buttons/elements are here? Is there a column of 3 weapon chips stacked vertically? A FAB button with ساخت و ساز label? Describe sizes.'],
  ['s1_left.png', 'Left region of game screenshot. What buttons are here: clue button (سرنخ)? flashlight button? backpack (کوله)? pause/mute buttons? Describe each icon quality and size.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: prompt + ' Concise English.' },
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
