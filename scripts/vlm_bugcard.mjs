#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/bug_card1_zoom.jpg').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
    { type: 'text', text: `Ultra-zoomed crop of ONE item card in a Persian game shop. The card has: text lines on the left, a square icon on the right side, and a gold price pill somewhere.
Q1: Describe the EXACT vertical stack: which text elements are where (top to bottom)?
Q2: Is there ANY text/element rendered overlapping another element (two things occupying the same pixels)? If yes, describe precisely WHICH word overlaps WHICH element and WHERE.
Q3: Transcribe the gold pill contents.
Q4: Is the layout cramped/messy vs clean? Answer concisely in English, transcribe Persian exactly.` },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices?.[0]?.message?.content || 'ERR');
