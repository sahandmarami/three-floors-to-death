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
console.log('HUD-DAY:', await ask('/home/z/my-project/scripts/shots27/crop_hud_day.png',
  'Game HUD corner (zoomed 2x): gold coin icon + number + health bar. Is the coin a realistic shiny gold coin image (photo-like with 3D bevel), or a flat/simple drawn circle? Score /10.'));
console.log('HUD-NIGHT:', await ask('/home/z/my-project/scripts/shots27/crop_hud_night.png',
  'Game HUD corner (zoomed 2x). Is the coin icon a realistic shiny gold coin? Score /10.'));
