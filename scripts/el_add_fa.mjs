// el_add_fa.mjs — افزودن صداهای بومی فارسی به حساب + تست TTS/ASR
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// صداهای بومی فارسی از کتابخانه اشتراکی
const FA_VOICES = [
  { id: 'ndcUYGFbbd96WXiZVVaQ', name: 'RoyaFA',   role: 'n راوی',        text: 'یه ویروس، شهر رو بی‌صدا کشت.' },
  { id: 'VKDkQOjcRZb7aNtJGaWt', name: 'KouroshFA', role: 'p سهند',        text: 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.' },
  { id: 'xKk80LgyXTAl6McCiFke', name: 'KavehFA',  role: 'a ارشان',        text: 'چقدر دیگه؟ آب تمومه.' },
  { id: 'XzieuK0bwYWT9Kl1LhLs', name: 'HoomanFA', role: 'd دستفروش',      text: 'کالای دست اول! ببین بخری.' },
  { id: 'GSj19hKjOQsPFCZlq1le', name: 'FaridehFA', role: 'm مریم',        text: 'پیام برج مخابراتی رو گرفتید؟' },
  { id: '8Ebkg5uUcbSbeqGucAoR', name: 'SetarehFA', role: 'r بی‌سیم',      text: 'هشدار! حرکت گسترده در دره شمالی.' },
];

// ۱) افزودن هر صدا به حساب
for (const v of FA_VOICES) {
  const r = await fetch(`${BASE}/voices/add/${v.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name })
  });
  const body = await r.text();
  console.log(`ADD ${v.name}: ${r.status} ${body.slice(0, 120)}`);
}

// ۲) تولید تست + ASR
const zai = await ZAI.create();
for (const v of FA_VOICES) {
  const r = await fetch(`${BASE}/text-to-speech/${v.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text: v.text, model_id: 'eleven_v3', voice_settings: { stability: 0.45, similarity_boost: 0.85 } })
  });
  if (!r.ok) { console.log(`TTS ${v.name} ERR ${r.status}: ${(await r.text()).slice(0, 150)}`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  const mp3 = `/home/z/my-project/scripts/fa_${v.name}.mp3`;
  fs.writeFileSync(mp3, buf);
  console.log(`TTS ${v.name} OK ${buf.length}B`);
  // ASR
  await sleep(3000);
  try {
    execSync(`ffmpeg -y -v quiet -i ${mp3} -ar 16000 -ac 1 ${mp3}.wav`);
    const b64 = fs.readFileSync(`${mp3}.wav`).toString('base64');
    const res = await zai.audio.asr.create({ file_base64: b64 });
    const got = (res.text || '').trim();
    const ow = v.text.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
    const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
    const hits = gw.filter(w => new Set(ow).has(w)).length;
    console.log(`  [${v.name}] ${Math.round(hits / ow.length * 100)}%  «${got.slice(0, 80)}»`);
  } catch (e) { console.log(`  [${v.name}] ASR-ERR ${e.message.slice(0, 50)}`); }
  await sleep(4000);
}
