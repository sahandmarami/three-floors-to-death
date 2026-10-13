#!/usr/bin/env node
// matrix27.mjs — ماتریس پارامتر برای رفع خروجی چینی Brian روی متن کوتاه
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT = '/home/z/my-project/scripts/voice27_test';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asr(p) {
  const wav = p.replace('.mp3', '.wav');
  execSync(`ffmpeg -y -v quiet -i ${p} -ar 16000 -ac 1 ${wav}`);
  for (let i = 0; i < 6; i++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      await sleep(4000);
      return (res.text || '').trim();
    } catch (e) { await sleep(15000); }
  }
  return '';
}

const TXT = 'یه ویروس، شهر رو بی\u200cصدا کشت.';
const VID = 'nPczCjzI2devNBz1zQrb'; // Brian
const tests = [
  ['s17_a', { seed: 17, stability: 0.5, style: 0.35 }],
  ['s17_b', { seed: 17, stability: 0.45, style: 0.4 }],
  ['s100', { seed: 100, stability: 0.5, style: 0.35 }],
  ['s1583', { seed: 1583, stability: 0.5, style: 0.35 }],
  ['noseed', { stability: 0.5, style: 0.35 }],
  ['s17_pad', { seed: 17, stability: 0.5, style: 0.35, pad: true }],
];

for (const [label, o] of tests) {
  const text = o.pad ? TXT + ' هیچ‌کس نمی‌دونه فردا چی می‌شه.' : TXT;
  const body = {
    text, model_id: 'eleven_v4', language_code: 'fa',
    voice_settings: { stability: o.stability, similarity_boost: 0.75, style: o.style, use_speaker_boost: true }
  };
  if (o.seed != null) body.seed = o.seed;
  const r = await fetch(`${BASE}/text-to-speech/${VID}?output_format=mp3_22050_32`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body)
  });
  if (!r.ok) { console.log(`${label}: HTTP ${r.status}`); continue; }
  const mp3 = `${OUT}/mx_${label}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  const got = await asr(mp3);
  const cjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got);
  console.log(`${label}: ${cjk ? '❌ چینی' : '✓ فارسی'} «${got.slice(0, 45)}»`);
}
