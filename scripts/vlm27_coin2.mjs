import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
async function ask(imgPath, prompt) {
  const b64 = fs.readFileSync(imgPath).toString('base64');
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
console.log('COIN-FINAL:', await ask('/home/z/my-project/scripts/coin27/coin_preview.jpg',
  'A gold coin game icon on a checkerboard background (proving transparency). Is the coin fully inside its transparent circular cutout with NO leftover background halo or dark edges? Is it attractive as a game currency icon? Rate /10 and note any defects.'));
