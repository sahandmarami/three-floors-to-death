#!/usr/bin/env node
// vlm_v30_hi.mjs — خواندن دقیق باکس متن کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/tmp/feedback_v30/box_zone_hi.png').toString('base64');
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: `High-res crop of a dialogue box area from a Persian game. The box should contain: a speaker name label at top, 2-3 lines of Persian story text, a small hint line at bottom, and possibly a blinking text cursor. Read the SPEAKER NAME label exactly (it should be a Persian word in gold/orange color like «راوی» or a character name). Then read each line of body text as exactly as possible. English answer with Persian quotes.` },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 900));
    break;
  } catch (e) { if (a===4) console.log('ERR', e.message.slice(0,80)); else await new Promise(r=>setTimeout(r,10000)); }
}
