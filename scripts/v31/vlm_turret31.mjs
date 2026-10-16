#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/bugs29/v31_turret_tab.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Build menu TURRETS tab (برجک‌ها) of a Persian zombie game, 2x zoom. The 4 tiles should be: برجک مسلسل (gatling), برجک تک‌تیرانداز (sniper), برجک یخ‌زن (frost), ارتقای برجک‌ها. QUESTIONS: 1) How many tiles visible? 2) Does any tile icon look like BINOCULARS / night-vision goggles (two round eyepieces)? The sniper tile should look like a TURRET on a tripod with a long barrel — does it? 3) Are tiles laid out cleanly without overlap? 4) Read the Persian labels under each tile.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
