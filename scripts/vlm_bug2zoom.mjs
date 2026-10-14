#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/bug2_modal.jpg').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
    { type: 'text', text: 'This is a zoomed view of the mystery merchant shop modal from a Persian zombie game. Draw me an exact ASCII map of the modal layout. For EACH text element tell me: exact Persian text you can read, whether it is readable or garbled/overlapping/cut off. Are item cards laid out vertically with icon+name+description+price? Is there empty dead space? What looks broken vs what looks fine? Is the title دستفروش مرموز readable?' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 3000));
