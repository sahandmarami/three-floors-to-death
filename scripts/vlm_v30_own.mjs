#!/usr/bin/env node
// vlm_v30_own.mjs — بررسی اسکرین‌شات اینتروی خودم
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/tmp/shot_intro1_v30.png').toString('base64');
for (let a = 1; a <= 3; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: `Intro cinematic of a Persian zombie game (780x360). 1) Where EXACTLY is the dialogue text panel (top/middle/bottom, y%)? 2) Is there a square book portrait icon with gold border? Where? 3) Is there a «کلیک / Space = ادامه» hint at the bottom of the panel? 4) Any gold «بازی کن» or «شروع» button anywhere? 5) Read the Persian title top-right if any. Concise English.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 900));
    break;
  } catch (e) { if (a===3) console.log('ERR', e.message.slice(0,80)); else await new Promise(r=>setTimeout(r,8000)); }
}
