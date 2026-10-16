#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/bug1_shop2x.jpg').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
    { type: 'text', text: 'Persian zombie game build/shop panel, zoomed 2x. QUESTIONS: 1) What are the category TAB buttons at the top — read their Persian labels exactly. 2) How many item tiles/cards are visible in the list BELOW, and does it look like items from MULTIPLE categories are shown at once (weapons + turrets + gear mixed)? 3) One item icon looks like night-vision binoculars/goggles — which one is it, what is its label text and price? 4) Is the layout broken/overlapping anywhere? Answer in English with exact Persian labels.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 2200));
