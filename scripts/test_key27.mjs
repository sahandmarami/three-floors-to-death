#!/usr/bin/env node
// test_key27.mjs — تست کلید جدید ElevenLabs: 3 استراتژی صدا برای فارسی
import fs from 'fs';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const TXT = 'یه ویروس، شهر رو بی‌صدا کشت. فقط چند نفر موندن که باید تا آخرین شب زنده بمونن.';

async function tts(voiceId, label, opts = {}) {
  const body = {
    text: TXT, model_id: opts.model || 'eleven_v4', language_code: 'fa',
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true }
  };
  if (opts.seed != null) body.seed = opts.seed;
  const t0 = Date.now();
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(`/home/z/my-project/scripts/voice27_test/${label}.mp3`, buf);
    console.log(`✓ ${label}: ${buf.length}B in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    return true;
  }
  console.log(`✗ ${label}: ${r.status} — ${(await r.text()).slice(0, 120)}`);
  return false;
}

fs.mkdirSync('/home/z/my-project/scripts/voice27_test', { recursive: true });

// ۱) صدای پیش‌فرض رایگان + fa
await tts('TX3LPaxmHKxFdv7VOQHJ', 'free_liam_fa');   // Liam — قبلاً 100٪ فارسی
await tts('nPczCjzI2devNBz1zQrb', 'free_brian_fa');  // Brian

// ۲) صدای بومی فارسی کتابخانه (Roya — Warm Tehrani Narrator)
await tts('ndcUYGFbbd96WXiZVVaQ', 'native_roya_fa');

// ۳) Voice Design — ساخت صدای ایرانی از توضیح (محدود به 3 صدا در پلن رایگان)
try {
  const r = await fetch(`${BASE}/text-to-voice/create`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_description: 'A warm middle-aged Iranian man from Tehran, speaking Persian with a calm, heroic, cinematic narration tone. Deep voice, slightly raspy, like a movie trailer narrator in Farsi.',
      text_sample: 'پدر: مگه می‌شه تو این همه بلا یکی زنده بمونه؟ آرش: تا وقتی که ما کنارشایم، هرچی شده، باهم می‌مونیم.',
      auto_generate: true
    })
  });
  const j = await r.json();
  console.log('VoiceDesign:', r.status, JSON.stringify(j).slice(0, 400));
} catch (e) { console.log('VoiceDesign ERR', e.message); }

// ۴) صداهای v3 (سخت‌افزاری) — چک سریع
console.log('\n— Summary —');
console.log('files:', fs.readdirSync('/home/z/my-project/scripts/voice27_test'));
