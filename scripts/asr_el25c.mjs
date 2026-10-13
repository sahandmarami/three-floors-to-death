import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/el25_test';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const zai = await ZAI.create();
  const files = fs.readdirSync(DIR).filter(x => /^(sc2_|v3fa_|long_)/.test(x) && x.endsWith('.wav')).sort();
  for (const f of files) {
    const name = f.replace('.wav', '');
    for (let a = 1; a <= 5; a++) {
      try {
        const b64 = fs.readFileSync(`${DIR}/${f}`).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${name}] ${res.text.slice(0, 130)}`);
        break;
      } catch (e) {
        if (a === 5) console.log(`[${name}] ERR ${e.message.slice(0, 50)}`);
        else await sleep(9000 * a);
      }
    }
    await sleep(1800);
  }
}
main();
