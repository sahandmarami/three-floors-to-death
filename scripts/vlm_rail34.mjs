import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/shots34/rail_zoom.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
      { type: 'text', text: 'Zoomed left-edge strip of a game UI (2x scale). Precisely measure: 1) Each round button: estimate its diameter in pixels and its horizontal center position. 2) Are diameters equal? 3) Are horizontal centers aligned on the same vertical axis? 4) Vertical gap between buttons. Be a precise measurement assistant.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices[0].message.content.trim());
