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
console.log('EMBLEMS:', await ask('/home/z/my-project/scripts/coin27/coin_sheet2.jpg',
  'For EACH coin #0-#7 in this contact sheet, state its center emblem in 2-4 words (e.g. "yen symbol", "crown", "star", "lion", "dollar", "euro", "blank"). Format: #0: ... #1: ... etc. Then: which coins have NO currency symbol (neutral emblem like star/crown/lion/abstract)?'));
