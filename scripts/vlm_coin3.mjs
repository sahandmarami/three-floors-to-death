import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
async function ask(p, prompt) {
  const b64 = fs.readFileSync(p).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      return res.choices?.[0]?.message?.content || '';
    } catch (e) { if (a === 4) return 'VLM-ERR ' + e.message.slice(0, 60); await new Promise(r => setTimeout(r, 9000)); }
  }
}
console.log('COIN3:', await ask('/home/z/my-project/scripts/coin27/coin_preview.jpg',
  'A gold coin on checkerboard (proving transparency). 1) Is the emblem a CROWN (not any currency symbol)? 2) Clean circular cutout, no halo? 3) Attractive premium game coin? Rate /10.'));
