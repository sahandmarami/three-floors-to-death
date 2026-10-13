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
console.log('CINE1-FULL:', await ask('/home/z/my-project/scripts/shots27/v27_02_cine1.png', 'Cinematic city scene at sunset with two walking survivors. Are there dark zombie silhouettes visible in the street or background? Score /10.'));
console.log('CINE1-STREET:', await ask('/home/z/my-project/scripts/shots27/crop_cine1_street.png', 'Street area of a game scene. Are there zombie silhouettes with glowing red eyes? Score /10.'));
