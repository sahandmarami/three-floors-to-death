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
console.log('VENDOR-PRICE:', await ask('/home/z/my-project/scripts/shots27/crop_vendor_items.png',
  'Shop item rows (zoomed). Next to each price number: is there a small round gold coin image now? Score /10.'));
console.log('HUD-COIN:', await ask('/home/z/my-project/scripts/shots27/crop_hud.png',
  'Game HUD top-right corner (zoomed 2x). Is the coin icon a realistic shiny gold coin image (not a flat gradient)? Score /10.'));
