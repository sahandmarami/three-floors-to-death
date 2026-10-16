import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/shots34/menu_v34.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
      { type: 'text', text: 'Main menu of a Persian zombie tower-defense game (780x360). Rate: 1) Overall BRIGHTNESS - is the night scene (sky, moon, city skyline, ground) clearly visible and NOT too dark? 2) The shadow zombies in background - do they look SCARY (hunched, reaching arms, red glowing eyes) or silly? Are they reasonably large/visible? 3) Title and buttons readable? Answer in English, concise, score each /10.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices[0].message.content.trim());
