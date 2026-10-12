#!/usr/bin/env node
// matrix2_27.mjs — آستانه طول + مدل v2 برای متن کوتاه
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
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

const VID = 'nPczCjzI2devNBz1zQrb'; // Brian
const tests = [
  ['v2_short', 'eleven_multilingual_v2', 'یه ویروس، شهر رو بی\u200cصدا کشت.', null],
  ['v4_40ch', 'eleven_v4', 'یه ویروس، شهر رو بی\u200cصدا کشت. باید بمونیم.', 'fa'],
  ['v2_20ch', 'eleven_multilingual_v2', 'چقدر دیگه؟ آب تمومه.', null],
  ['v2_28b', 'eleven_multilingual_v2', 'یه ویروس، شهر رو بی\u200cصدا کشت.', null],
];

for (const [label, model, text, lang] of tests) {
  const body = {
    text, model_id: model,
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true }
  };
  if (lang) body.language_code = lang;
  const r = await fetch(`${BASE}/text-to-speech/${VID}?output_format=mp3_22050_32`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body)
  });
  if (!r.ok) { console.log(`${label}: HTTP ${r.status} ${(await r.text()).slice(0, 80)}`); continue; }
  const mp3 = `${OUT}/m2_${label}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  const got = await asr(mp3);
  const cjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got);
  console.log(`${label}: ${cjk ? '❌ چینی' : '✓ فارسی'} «${got.slice(0, 45)}»`);
}
