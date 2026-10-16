#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/bug1_dock15.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'This is the top-right build dock panel of a Persian zombie game (1.5x zoom, RTL layout). CAREFULLY: 1) Read the 4 category tab labels in the tab row - which one is highlighted/selected (gold)? 2) Count the item tiles in the grid below. For each tile read the small Persian label and price under it. 3) Do the tiles belong to the SELECTED category only, or mixed (weapons AND turrets AND gear together)? 4) Is the panel overlapping any other UI (chips, buttons)? 5) Any layout damage: text overlap, cut-off tiles, squeezed elements?' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 2500));
