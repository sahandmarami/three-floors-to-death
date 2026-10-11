// asr_cand.mjs — ASR verify candidate voices (rate-limit aware)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const MANIFEST = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/voice_cand/manifest.json', 'utf-8'));

async function main() {
  const zai = await ZAI.create();
  for (const c of MANIFEST) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const b64 = fs.readFileSync(c.wav).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${c.who}/${c.name}] ORIG: ${c.text}`);
        console.log(`                   ASR : ${(res.text || '').trim()}`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${c.who}/${c.name}] ERROR: ${e.message.slice(0, 100)}`);
        else await sleep(10000);
      }
    }
    await sleep(4000);
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
