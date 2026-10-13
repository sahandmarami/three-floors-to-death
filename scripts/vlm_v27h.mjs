import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
async function ask(p, prompt) {
  const b64 = fs.readFileSync(p).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      return res.choices?.[0]?.message?.content || '';
    } catch (e) { if (a === 4) return 'VLM-ERR ' + e.message.slice(0, 60); await new Promise(r => setTimeout(r, 9000)); }
  }
}
console.log('NIGHTBTN:', await ask('/home/z/my-project/scripts/shots27/crop_nightbtn.png',
  'Bottom-right corner of game screen (zoomed). Is there a LARGE golden pill button with moon icon and Persian text «شب شود»? Score /10.'));
console.log('BACKPACK:', await ask('/home/z/my-project/scripts/shots27/crop_backpack.png',
  'Bottom-left/center of game screen (zoomed). Is there a horizontal backpack bar with slots, centered at bottom? Score /10.'));
console.log('CINE4:', await ask('/home/z/my-project/scripts/shots27/v27_05b_cine4b.png',
  'Story scene: fortified 3-floor tower. Does the building have battlements on roof and a red flag? Is a character repairing on a ladder visible? Warm attractive lighting with rays? Score /10.'));
