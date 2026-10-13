import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const b64 = fs.readFileSync('/home/z/my-project/scripts/shots28v/icons29.png').toString('base64');
const zai = await ZAI.create();
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: 'Four game UI icons on dark blue background: 1st should be a PISTOL, 2nd a SHOTGUN, 3rd a MACHINE GUN (with magazine + bipod), 4th a FLASHLIGHT/torch (vertical with light rays on top). For EACH icon answer: Is it clearly recognizable as that object at 84px? Any geometry flaws (broken lines, weird proportions, unreadable)? Score each /10.' },
  ] }],
  thinking: { type: 'disabled' },
});
console.log((res.choices?.[0]?.message?.content || '').slice(0, 1500));
