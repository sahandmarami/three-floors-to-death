#!/usr/bin/env node
// vlm_v30_menudesc.mjs — توصیف دقیق منوی فعلی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/shot_menu_bright.png').toString('base64');
for (let a = 1; a <= 3; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'text', text: `Main menu of Persian zombie game (BRIGHTENED 2.5x for visibility — original is darker). Describe: 1) Overall scene: sky, buildings, ground? 2) Is there white/gray FOG at the bottom? How much of screen height, how opaque? 3) Are there ZOMBIES walking in the menu background? How many, what style, what are they doing? 4) Where are the menu buttons? 5) Is the scene too dark overall? Concise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1100));
    break;
  } catch (e) { if (a===3) console.log('ERR'); else await new Promise(r=>setTimeout(r,8000)); }
}
