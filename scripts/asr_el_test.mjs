// asr_el_test.mjs — verify ElevenLabs v3 Persian clip accuracy
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/scripts/voice_tmp/eltest_brian_v3.wav').toString('base64');
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await zai.audio.asr.create({ file_base64: b64 });
      console.log('ASR:', res.text || '(empty)');
      console.log('ORIG: اون ساختمون رو ببین. سه طبقه داره و هنوز دیوارهاش سر جاشونه.');
      break;
    } catch (e) {
      if (attempt === 4) console.log('ERROR:', e.message.slice(0, 150));
      else await sleep(8000 * attempt);
    }
  }
}
main();
