#!/usr/bin/env node
// vlm_shots34.mjs — audit v34 debug screenshots
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/shots34/';
const files = process.argv.slice(2);
const zai = await ZAI.create();
for (const file of files) {
  if (!fs.existsSync(DIR + file)) { console.log(file, 'MISSING'); continue; }
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: 'Persian RTL game screenshot (780x360 viewport). Describe the UI panels visible. Is there a large amount of Persian text flooding an area of the screen (many stacked lines of text)? Transcribe key texts. Be precise.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n########## ${file} ##########`);
      console.log(res.choices[0].message.content.trim());
      break;
    } catch (e) {
      if (a === 3) console.log(`\n########## ${file} FAILED: ${e.message}`);
      else await new Promise(r => setTimeout(r, 1500));
    }
  }
}
