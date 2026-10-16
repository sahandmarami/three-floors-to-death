#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/v301_menu_buttons2x.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Main menu of Persian zombie game (right portion, 2x zoom, RTL). For EACH button (شروع بازی / ادامه / درباره / تنظیمات etc): 1) does it show an icon? 2) is the icon rendered properly (visible, correct color) or invisible/broken? 3) is the icon glued to the button edge (no padding) or nicely spaced? 4) any other visual defects? Be very specific.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1800));
