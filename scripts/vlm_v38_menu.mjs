#!/usr/bin/env node
// vlm_v38_menu.mjs — ممیزی منوی v38 (مه + زامبی)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const A = fs.readFileSync('/tmp/v38_menu2.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${A}` } },
        { type: 'text', text: `Main menu of Persian zombie game after fix (780x360). The user previously complained: "white fogs at the bottom are TOO MANY and menu looks bad" and "menu zombies are not cool". Check now: 1) Bottom of screen: is heavy white fog/mist gone or strongly reduced? Is the ground visible? 2) The zombies: describe them — do they look cool/menacing (size, pose, glowing eyes, coat tails, any crawling)? 3) Overall menu look: clean and readable? 4) Score /10 for fog fix and /10 for zombies. Concise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1100));
    break;
  } catch (e) { if (a===4) console.log('ERR', e.message.slice(0,80)); else await new Promise(r=>setTimeout(r,10000)); }
}
