// asr_cand2.mjs — ASR verify long-sentence candidates (Persian-context bias)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const MANIFEST = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/voice_cand2/manifest.json', 'utf-8'));

async function main() {
  const zai = await ZAI.create();
  for (const c of MANIFEST) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const b64 = fs.readFileSync(c.wav).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${c.who}/${c.name}] ${(res.text || '').trim().slice(0, 150)}`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${c.who}/${c.name}] ERROR: ${e.message.slice(0, 80)}`);
        else await sleep(12000);
      }
    }
    await sleep(5000);
  }
  console.log('\n[ORIGINAL] شب‌های آخرِ دنیا رسیده؛ با آرشان برج سه‌طبقه رو نگه دار و تا سپیده‌دم دوام بیار.');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
