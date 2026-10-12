// ztts_fa.mjs — تست TTS داخلی z-ai با فارسی + بررسی ASR
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const TEXT = 'سلام آرشان، هنوز زنده‌ای؟ صدایم را می‌شنوی؟';
const zai = await ZAI.create();
try {
  const res = await zai.audio.tts.create({
    input: TEXT,
    voice: 'tongtong',
    speed: 1.0,
    response_format: 'wav',
    stream: false,
  });
  const buf = Buffer.from(new Uint8Array(await res.arrayBuffer()));
  fs.writeFileSync('/home/z/my-project/scripts/ztts_test.wav', buf);
  console.log('TTS OK', buf.length, 'bytes');
} catch (e) {
  console.log('TTS ERR:', e.message);
  process.exit(0);
}
// ASR
await new Promise(r => setTimeout(r, 3000));
try {
  const b64 = fs.readFileSync('/home/z/my-project/scripts/ztts_test.wav').toString('base64');
  const res2 = await zai.audio.asr.create({ file_base64: b64 });
  console.log('ASR:', (res2.text || '').slice(0, 120));
} catch (e) { console.log('ASR ERR', e.message.slice(0, 80)); }
