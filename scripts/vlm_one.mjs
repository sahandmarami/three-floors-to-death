import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const file = process.argv[2];
const b64 = fs.readFileSync('/home/z/my-project/download/drive_v33/' + file).toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
      { type: 'text', text: 'Persian RTL game screenshot 2340x1080. List EVERY text element you can read (transcribe the Persian). Where exactly is each block of text positioned? Is there a large paragraph or repeated text anywhere? Is a clues/mystery panel (سرنخ) or molotov item visible?' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices[0].message.content.trim());
