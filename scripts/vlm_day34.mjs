import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/shots34/day_rail2.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
      { type: 'text', text: 'Persian RTL game day-screen (780x360). Check the LEFT EDGE vertical rail of round buttons: 1) How many circular buttons are stacked on the left edge? 2) Are they the SAME SIZE and evenly/vertically aligned (perfectly stacked below each other)? 3) Describe each button icon. 4) Any layout problems elsewhere? Concise English.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices[0].message.content.trim());
