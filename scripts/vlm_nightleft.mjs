#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/v301_night_leftcol.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Left column of Persian zombie game at night (2x zoom). A player complains: 1) flashlight (چراغ قوه) icon is too small to recognize 2) backpack icon tiny and badly cropped 3) weapon chips (کلت/شاتگان/مسلسل) overlap other buttons. Check each: flashlight button icon size vs button size? backpack visibility? any buttons overlapping each other? List every element and any collision.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
