#!/usr/bin/env node
// candidates27.mjs — رتبه‌بندی صداهای پیش‌فرض برای فارسی + تست Roya
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT = '/home/z/my-project/scripts/voice27_test';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asr(p) {
  const wav = p.replace('.mp3', '.wav');
  execSync(`ffmpeg -y -v quiet -i ${p} -ar 16000 -ac 1 ${wav}`);
  for (let i = 0; i < 4; i++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      return (res.text || '').trim();
    } catch (e) { await sleep(9000); }
  }
  return '';
}

const TXT = 'یه ویروس، شهر رو بی‌صدا کشت. فقط چند نفر موندن که باید تا آخرین شب زنده بمونن.';

// کاندیدها: مرد جوان/میان‌سال/راوی/زن — بر اساس شخصیت‌ها
const CANDS = [
  ['TX3LPaxmHKxFdv7VOQHJ', 'liam', 'a'],      // Liam — energetic young
  ['nPczCjzI2devNBz1zQrb', 'brian', 'p'],      // Brian — deep comforting (ثابت ۱۰۰٪)
  ['JBFqnCBsd6RMkjVDRZzb', 'george', 'n'],     // George — warm storyteller
  ['IKne3meq5aSn9XLyUdCD', 'charlie', 'a'],    // Charlie — deep energetic
  ['iP95p4xoKVk53GoZ742B', 'chris', 'a'],      // Chris — charming
  ['onwK4e9ZLuTAKqWW03F9', 'daniel', 'n'],     // Daniel — broadcaster
  ['pqHfZKP75CvOlQylNhV4', 'bill', 'p'],       // Bill — wise mature
  ['Xb7hH8MSUJpSbSDYk0k2', 'alice', 'm'],      // Alice — educator
  ['EXAVITQu4vr4xnSDxMaL', 'sarah', 'm'],      // Sarah — mature reassuring
  ['cgSgspJ2msm6clMCkdW9', 'jessica', 'm'],    // Jessica — playful warm
  ['CwhRBWXzGAHq8TQ4Fs17', 'roger', 'd'],      // Roger — laid-back (دستفروش)
  ['N2lVS1w4EtoT3dr4eOWO', 'callum', 'b'],     // Callum — husky (نگهبان)
  ['ndcUYGFbbd96WXiZVVaQ', 'roya', 'n'],       // Roya — بومی تهرانی (تست 402)
];

const ow = new Set(TXT.replace(/[؛،.!؟...]/g, ' ').split(/\s+/).filter(Boolean));
const results = [];
for (const [vid, label, role] of CANDS) {
  const body = {
    text: TXT, model_id: 'eleven_v4', language_code: 'fa', seed: 17,
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true }
  };
  const r = await fetch(`${BASE}/text-to-speech/${vid}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (!r.ok) { console.log(`${label} [${role}]: HTTP ${r.status} — ${(await r.text()).slice(0, 80)}`); results.push({ label, role, sim: -1 }); continue; }
  const mp3 = `${OUT}/cand_${label}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  const got = await asr(mp3);
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got)) {
    console.log(`${label} [${role}]: چینی ❌ «${got.slice(0, 30)}»`);
    results.push({ label, role, sim: 0, chinese: true });
    continue;
  }
  const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
  const hits = gw.filter(w => ow.has(w)).length;
  const sim = Math.round(hits / ow.length * 100);
  console.log(`${label} [${role}]: ${sim}٪ «${got.slice(0, 55)}»`);
  results.push({ label, vid, role, sim, got });
}
fs.writeFileSync(`${OUT}/candidates.json`, JSON.stringify(results, null, 1));
console.log('\n— مرتب‌شده —');
console.log(results.filter(r => r.sim > 0).sort((x, y) => y.sim - x.sim).map(r => `${r.label}[${r.role}] ${r.sim}%`).join('\n'));
