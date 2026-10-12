// diag_v25.mjs — تشخیص: تنظیمات پایداری یا افکت FFmpeg؟
// ۱) i1n با George stability=0.42 بدون فرمت/افکت → ASR خام
// ۲) همان با FX راوی (aecho) → ASR
import fs from 'fs';
import { execSync } from 'child_process';
import ZAI from 'z-ai-web-dev-sdk';

const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const GEORGE = 'JBFqnCBsd6RMkjVDRZzb';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tts(text, stability, outfile) {
  const r = await fetch(`${BASE}/text-to-speech/${GEORGE}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: { stability, similarity_boost: 0.85 } })
  });
  if (!r.ok) { console.log('TTS ERR', r.status); return false; }
  fs.writeFileSync(outfile, Buffer.from(await r.arrayBuffer()));
  return true;
}

async function asr(mp3, label, orig) {
  const wav = mp3.replace('.mp3', '_d.wav');
  execSync(`ffmpeg -y -v quiet -i ${mp3} -ar 16000 -ac 1 ${wav}`);
  for (let a = 1; a <= 5; a++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const zai = await ZAI.create();
      const res = await zai.audio.asr.create({ file_base64: b64 });
      const got = (res.text || '').trim();
      const ow = orig.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
      const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
      const hits = gw.filter(w => new Set(ow).has(w)).length;
      console.log(`[${label}] ${Math.round(hits / ow.length * 100)}%  «${got.slice(0, 90)}»`);
      return;
    } catch (e) { if (a === 5) console.log(`[${label}] ASR-ERR`); else await sleep(12000); }
  }
}

const TEXT = 'یه ویروس، شهر رو بی‌صدا کشت.';
// ۱) خام با پایداری ۰٫۴۲ (مثل تست موفق اولیه)
if (await tts(TEXT, 0.42, '/home/z/my-project/scripts/diag_raw.mp3')) {
  await asr('/home/z/my-project/scripts/diag_raw.mp3', 'raw-s0.42', TEXT);
}
// ۲) با FX راوی
execSync(`ffmpeg -y -v quiet -i /home/z/my-project/scripts/diag_raw.mp3 -af "aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5" -ar 24000 -ac 1 -b:a 48k /home/z/my-project/scripts/diag_fx.mp3`);
await asr('/home/z/my-project/scripts/diag_fx.mp3', 'fx-narrator', TEXT);
