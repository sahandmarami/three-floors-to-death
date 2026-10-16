#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/v301_merchant_zoom.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Mystery merchant modal from Persian zombie game at phone size, 2x zoom. Compare with this list of known bugs reported by the player: 1) text overlapping/colliding 2) unreadable garbled text 3) item cards broken 4) price pills overlapping other text. Which of these problems exist in THIS image? Rate overall layout quality /10. Describe exactly what is broken if anything.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
