#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/sniper_canvas_4x.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'What is depicted in this game item icon (4x zoom)? Is it: A) a weapon TURRET mounted on tripod/stand with a long barrel and scope (sniper turret), B) binoculars / night-vision goggles (two eyepieces side by side), or C) something else? Describe exactly what you see.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 700));
