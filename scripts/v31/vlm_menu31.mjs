#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/shots31/menu_final.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Main menu of Persian zombie game at phone size after save-and-exit. Verify: 1) Is there a BOLD crossed-swords icon on the start (شروع داستان) button? 2) Do buttons have icons with proper padding (not glued to corners)? 3) Is there any leftover in-game UI (clues button سرنخ, flashlight, backpack) polluting the menu? 4) Is the ذخیره شد (saved) message visible? 5) Score /10.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1200));
