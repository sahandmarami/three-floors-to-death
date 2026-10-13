#!/usr/bin/env node
// asr_check27.mjs — ممیزی ASR کلیپ‌های تست + پروب endpoint های Voice Design
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
const BASE = 'https://api.elevenlabs.io/v1';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asr(p, label) {
  const wav = p.replace('.mp3', '.wav');
  execSync(`ffmpeg -y -v quiet -i ${p} -ar 16000 -ac 1 ${wav}`);
  for (let i = 0; i < 4; i++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      console.log(`ASR ${label}: «${(res.text || '').trim()}»`);
      return (res.text || '').trim();
    } catch (e) { await sleep(10000); }
  }
  return '';
}

const TXT = 'یه ویروس، شهر رو بی‌صدا کشت. فقط چند نفر موندن که باید تا آخرین شب زنده بمونن.';
for (const f of ['free_liam_fa', 'free_brian_fa']) {
  const got = await asr(`/home/z/my-project/scripts/voice27_test/${f}.mp3`, f);
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got)) { console.log(`  → ${f}: چینی! ❌`); continue; }
  const ow = new Set(TXT.replace(/[؛،.!؟...]/g, ' ').split(/\s+/).filter(Boolean));
  const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
  const hits = gw.filter(w => ow.has(w)).length;
  console.log(`  → ${f}: ${Math.round(hits / ow.length * 100)}٪ تطابق`);
}

// پروب endpoint های Voice Design
const desc = 'A warm middle-aged Iranian man from Tehran speaking Persian, calm heroic cinematic narration, deep slightly raspy voice like an Iranian movie trailer narrator.';
const sample = 'پدر: مگه می‌شه تو این همه بلا یکی زنده بمونه؟ آرش: تا وقتی ما کنارشایم، هرچی شده باهم می‌مونیم.';
const endpoints = [
  { m: 'POST', p: '/text-to-voice', b: { voice_description: desc, text_sample: sample } },
  { m: 'POST', p: '/voice-design/create-preview', b: { voice_description: desc, text: sample } },
  { m: 'POST', p: '/voices/add', b: { name: 'TestIR', description: desc, text_sample: sample } },
];
for (const e of endpoints) {
  try {
    const r = await fetch(BASE + e.p, { method: e.m, headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(e.b) });
    const t = await r.text();
    console.log(`PROB ${e.p}: ${r.status} — ${t.slice(0, 200)}`);
  } catch (err) { console.log(`PROB ${e.p}: ERR ${err.message}`); }
}
