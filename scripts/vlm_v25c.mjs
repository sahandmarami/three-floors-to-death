// vlm_v25c.mjs — بررسی صفحه باخت جدید + گفتگو
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const zai = await ZAI.create();
  const p = '/home/z/my-project/scripts/shots25/11_gameover.png';
  for (let a = 1; a <= 3; a++) {
    try {
      const b64 = fs.readFileSync(p).toString('base64');
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: 'Persian zombie game GAME-OVER screen on phone 780x360. Check: 1) Is it a modern Android-style panel (icon badge, title, stat chips, big green retry button)? 2) Quote the Persian texts you can read. 3) Rating 1-10. English, max 8 lines.' }
        ]}],
        thinking: { type: 'disabled' },
        max_tokens: 300
      });
      console.log('[gameover] ' + (res.choices[0].message.content || '').slice(0, 800));
      break;
    } catch (e) {
      if (a === 3) console.log('ERR', e.message.slice(0, 80));
      else await sleep(6000 * a);
    }
  }
}
main();
