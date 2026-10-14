#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/local_merchant780_zoom.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'This is a zoomed 3x view of a mystery merchant shop modal in a Persian game rendered at phone size. Compare quality: 1) Is Persian text readable and inside its containers, or does it overflow/overlap/collide? 2) Are item rows (icon + name + description + price pill) properly stacked? 3) Any text cut off or touching edges? Describe ALL problems you see precisely.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 2000));
