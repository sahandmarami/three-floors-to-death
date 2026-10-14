#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/v31_merchant780_zoom.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Mystery merchant modal from Persian zombie game at phone size (780x360 viewport), 2x zoom. Check STRICTLY: 1) Is every text line readable and inside its own row container (no overlap between rows, price pill not touching other text)? 2) Does each item row show: icon on one side, name+description in middle, price pill on other side? 3) Any text cut off, overflowing, or colliding? 4) Overall layout quality /10. Compare: previous version had price pills overlapping text below it.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
