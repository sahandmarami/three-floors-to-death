import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/scripts/el25_test';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const zai = await ZAI.create();
  const files = ['sc2_Alice.wav','sc2_Bella.wav','sc2_Bill.wav','sc2_Callum.wav'];
  for (const f of files) {
    if (!fs.existsSync(`${DIR}/${f}`)) { console.log(`[${f}] missing`); continue; }
    for (let a = 1; a <= 5; a++) {
      try {
        const b64 = fs.readFileSync(`${DIR}/${f}`).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${f.replace('.wav','')}] ${res.text.slice(0, 110)}`);
        break;
      } catch (e) {
        if (a === 5) console.log(`[${f}] ERR ${e.message.slice(0, 50)}`);
        else await sleep(10000 * a);
      }
    }
    await sleep(2000);
  }
}
main();
