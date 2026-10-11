// asr_verify2.mjs — transcribe ElevenLabs Persian outputs (WAV + delays)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const FILES = [
  ['Adam-v2',  '/home/z/my-project/scripts/wav_Adam_v2.wav'],
  ['George-v2','/home/z/my-project/scripts/wav_George_v2.wav'],
  ['Daniel-v2','/home/z/my-project/scripts/wav_Daniel_v2.wav'],
  ['Adam-v3',  '/home/z/my-project/scripts/wav_Adam_v3.wav'],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const zai = await ZAI.create();
  for (const [name, path] of FILES) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const b64 = fs.readFileSync(path).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`\n[${name}]`);
        console.log('  ASR: ' + (res.text || '').slice(0, 220));
        break;
      } catch (e) {
        if (attempt === 4) {
          console.log(`\n[${name}] ERROR: ${e.message.slice(0, 120)}`);
        } else {
          await sleep(8000 * attempt);
        }
      }
    }
    await sleep(3000);
  }
  console.log('\n[ORIGINAL]');
  console.log('  همه‌چیز از یه ویروس شروع شد؛ از حومه‌ی شهر، بی‌خبر و بی‌صدا، اومد وسطِ مون.');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
