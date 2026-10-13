#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const zai = await ZAI.create();
async function ask(file, prompt) {
  const b64 = fs.readFileSync(file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt },
        ] }],
        thinking: { type: 'disabled' },
      });
      return (res.choices?.[0]?.message?.content || '');
    } catch (e) {
      if (a === 4) return 'VLM-ERR ' + e.message.slice(0, 100);
      await new Promise(r => setTimeout(r, 9000));
    }
  }
}

console.log('===== CARD 1 (first item + price overlap) =====');
let r = await ask('/home/z/my-project/scripts/bug_card1.jpg',
`Zoomed crop of a Persian game shop menu item card. Transcribe EVERY piece of text you see, character by character, top to bottom. Especially: is there a word rendered ON TOP of the gold price pill (overlapping)? What does that word say exactly? What is the price number? Describe the icon on the right side. Answer in English but transcribe Persian text in Persian script.`);
console.log(r.slice(0, 1200));
await new Promise(r2 => setTimeout(r2, 2000));

console.log('\n===== CARD 2 (bottom clipped area) =====');
r = await ask('/home/z/my-project/scripts/bug_card2.jpg',
`Zoomed crop of the bottom part of a Persian game shop menu. Transcribe every text you see top to bottom (Persian script). Is any card cut off / clipped at an edge? What text is partially visible? Answer in English with Persian transcriptions.`);
console.log(r.slice(0, 1200));
await new Promise(r2 => setTimeout(r2, 2000));

console.log('\n===== HEADER =====');
r = await ask('/home/z/my-project/scripts/bug_head.jpg',
`Zoomed crop of the header of a Persian game shop menu card. Transcribe the title exactly (Persian script). Is the title text vertically centered with the avatar? Any layout issues with close button / title / avatar? Answer in English with Persian transcriptions.`);
console.log(r.slice(0, 900));
