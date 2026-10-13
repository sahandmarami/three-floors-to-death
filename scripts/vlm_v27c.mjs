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
console.log('PAUSE2:', await ask('/home/z/my-project/scripts/shots27/v27_07_pause.png',
  'Pause menu on Android landscape. Count visible buttons. Are ALL five buttons visible: gold Continue, Settings, About, Save&Exit, red Restart? Is anything cut off? Score /10.'));
console.log('SETTINGS2:', await ask('/home/z/my-project/scripts/shots27/v27_08_settings.png',
  'Settings on Android landscape. Are ALL rows visible including the RED delete-save button at bottom and the gold back button? Anything cut off? Score /10.'));
console.log('CINE1-2:', await ask('/home/z/my-project/scripts/shots27/v27_02_cine1.png',
  'Story scene: city at sunset. Are there dark zombie silhouettes walking in the street/background now? Score /10.'));
console.log('WEAPONS:', await ask('/home/z/my-project/scripts/shots27/v27_12_weapons.png',
  'Build panel weapons tab. Is the pistol tile icon clearly a pistol? Are tiles clean without overlapping labels? Score /10.'));
console.log('VENDOR2:', await ask('/home/z/my-project/scripts/shots27/v27_10_vendor.png',
  'Peddler shop dialog. Do item rows show a small gold coin image before the price number? Score /10.'));
