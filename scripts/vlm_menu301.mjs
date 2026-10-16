#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
for (const [f, q] of [
  ['v301_menu_left.png', 'Left side of the MAIN MENU of a Persian zombie game. A player reported: (a) a clues button labeled سرنخ is visible here although we exited to menu — do you see it? (b) any leftover game UI on the menu? Describe exactly what text/buttons you see and their positions.'],
  ['v301_menu_btns.png', 'Main menu buttons of a Persian zombie game. The player says the START GAME icon is broken/ugly. Check each button: does it have a proper icon (sword/play/etc) and is the icon rendered correctly or broken/missing/misaligned? Are icons glued to the button corner without padding? Rate /10.'],
]) {
  const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/../' + f).toString('base64');
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: q },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log('\n===== ' + f + ' =====');
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
  } catch (e) { console.log(f, 'ERR', e.message.slice(0, 80)); }
}
