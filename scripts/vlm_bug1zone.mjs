#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
for (const [f, q] of [
  ['bug1_chipzone.png', 'What EXACTLY is this UI element? Is it a weapon quick-switch chip (rifle/shotgun/pistol icon)? What icon is inside? Is a lock icon shown? Is anything overlapping it?'],
  ['bug1_leftzone.png', 'Map the top-left 800x500px of this Persian zombie game. List elements as a table: element, x-position (left/center/right of crop), y-position (top/middle), and note every pair that OVERLAPS. Specifically: where are the sound button, pause button, clues (سرنخ) button, and weapon chips (کلت/شاتگان/مسلسل)?'],
]) {
  const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/' + f).toString('base64');
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: q + ' Be precise and concise.' },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log('\n===== ' + f + ' =====');
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
  } catch (e) { console.log(f, 'ERR', e.message.slice(0, 80)); }
}
