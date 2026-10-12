// asr_el3.mjs — compare 3 ElevenLabs Persian strategies
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const zai = await ZAI.create();
  for (const name of ['el_m2_brian', 'el_v3_liam', 'el_v3_fing']) {
    const p = `/home/z/my-project/scripts/voice_tmp/${name}.wav`;
    for (let a = 1; a <= 4; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${name}] ASR: ${res.text}`);
        break;
      } catch (e) {
        if (a === 4) console.log(`[${name}] ERR ${e.message.slice(0, 90)}`);
        else await sleep(7000 * a);
      }
    }
    await sleep(2500);
  }
}
main();
