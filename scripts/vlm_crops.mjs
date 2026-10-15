#!/usr/bin/env node
// vlm_crops.mjs — detailed VLM of screenshot crops (find the Persian text flood)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/download/drive_v34/crops/';
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
            { type: 'text', text: 'Crop of a Persian RTL game screenshot. Transcribe ALL Persian text you can read EXACTLY as written (it may be garbled - transcribe phonetically if unsure). Count roughly how many separate text lines/blocks exist. Is there an abnormal amount of text (a flood/spam of many text lines) anywhere? What UI elements (buttons, cards, icons) are visible?' },
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
