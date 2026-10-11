// asr_verify.mjs — transcribe ElevenLabs Persian test outputs for accuracy check
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const FILES = [
  ['Adam-v2',  '/home/z/my-project/scripts/voice_test_Adam_eleven_multilingual_v2.mp3'],
  ['George-v2','/home/z/my-project/scripts/voice_test_George_eleven_multilingual_v2.mp3'],
  ['Daniel-v2','/home/z/my-project/scripts/voice_test_Daniel_eleven_multilingual_v2.mp3'],
  ['Adam-v3',  '/home/z/my-project/scripts/voice_test_Adam-v3_eleven_v3.mp3'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [name, path] of FILES) {
    try {
      const b64 = fs.readFileSync(path).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      console.log(`\n[${name}]`);
      console.log('  ASR: ' + (res.text || '').slice(0, 200));
    } catch (e) {
      console.log(`\n[${name}] ERROR: ${e.message}`);
    }
  }
  console.log('\n[ORIGINAL TEXT]');
  console.log('  همه‌چیز از یه ویروس شروع شد؛ از حومه‌ی شهر، بی‌خبر و بی‌صدا، اومد وسطِ مون.');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
