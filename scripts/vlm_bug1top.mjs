#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/bug1_topleft.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Top-left corner of a Persian zombie game phone screenshot (2x zoom). There is a vertical column of buttons: sound, pause, then some weapon quick-switch chips. QUESTION: Do any two buttons OVERLAP each other (one on top of another)? Are the weapon chips vertical or horizontal? Is anything cut off? Describe exact positions: which buttons, where, overlapping or not.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
