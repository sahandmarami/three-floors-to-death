#!/usr/bin/env node
// vlm_v30_menu.mjs — مقایسه منوی کاربر با منوی بیلد فعلی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/shot_menu_v30.png').toString('base64');  // my menu
const B = fs.readFileSync('/tmp/menu_user_small.png').toString('base64'); // user menu
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${B}` } },
        { type: 'text', text: `Image 1 = CURRENT build main menu (780x360). Image 2 = USER's screenshot (2340x1080 scaled down) of the screen where they complain: "white fogs at the bottom are too many" and "menu zombies are not cool". Questions: 1) Are these the same screen? 2) In Image 2, describe the BOTTOM of screen: is there white/gray fog/mist? How intense, what percent of height, does it hide the ground? 3) In Image 2, describe the zombies: how many, where, pose, style (cartoon/scary), cool or lame? 4) In Image 1 same questions — bottom fog and zombies? 5) Overall menu readability in Image 2. Concise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
    break;
  } catch (e) { if (a===4) console.log('ERR', e.message.slice(0,100)); else await new Promise(r=>setTimeout(r,10000)); }
}
