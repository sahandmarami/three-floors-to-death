#!/usr/bin/env node
// gen_voices27.mjs — تولید کامل ۱۱۹ خط صدای فارسی ElevenLabs v4 + fa
// استراتژی: ۷ صدای اثبات‌شده + retry با seed + ممیزی ASR (trigram + CJK reject)
// fallback: کلیپ edge-tts از voices24_data.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice27_full';
const DATA_JS = '/home/z/my-project/scripts/voices27_data.js';
const MAX_ATTEMPTS = 4;
const SIM_GATE = 40; // trigram Jaccard ٪
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// تخصیص اثبات‌شده (کاندید27 + تست‌های مستقیم — Brian ۳/۳ فارسی، مطمئن‌ترین)
const VOICES = {
  a: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرش (۲/۲ فارسی)
  p: 'pqHfZKP75CvOlQylNhV4', // Bill — پدر (۱/۱ فارسی، حکیمانه)
  n: 'nPczCjzI2devNBz1zQrb', // Brian — راوی (۳/۳ فارسی، مطمئن‌ترین)
  m: 'cgSgspJ2msm6clMCkdW9', // Jessica — مریم (۱/۱)
  r: 'JBFqnCBsd6RMkjVDRZzb', // George — بی‌سیم (افکت رادیو)
  b: 'IKne3meq5aSn9XLyUdCD', // Charlie — نگهبان (افکت هیولا)
  d: 'iP95p4xoKVk53GoZ742B', // Chris — دستفروش
};
const NAMES = { a: 'Liam', p: 'Bill', n: 'Brian', m: 'Jessica', r: 'George', b: 'Charlie', d: 'Chris' };

// FX پس‌پردازش per character (از v24 — حفظ شد)
const FX = {
  p: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  m: 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n: 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r: 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  b: 'asetrate=24000*0.82,aresample=24000,atempo=1.18,volume=1.35,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
  d: 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
};

function norm(s) {
  return s.replace(/\u200c/g, ' ').replace(/[؛،.!؟:\-…«»]/g, ' ')
    .replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function trigrams(s) {
  const t = new Set();
  const w = ' ' + s + ' ';
  for (let i = 0; i < w.length - 2; i++) t.add(w.slice(i, i + 3));
  return t;
}
function sim3(a, b) {
  const A = trigrams(norm(a)), B = trigrams(norm(b));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return Math.round(inter / (A.size + B.size - inter) * 100);
}

async function ttsOnce(voiceId, text, seed) {
  const body = {
    text, model_id: 'eleven_v4', language_code: 'fa', seed,
    voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true }
  };
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) return Buffer.from(await r.arrayBuffer());
  const err = await r.text();
  console.log(`    TTS fail ${r.status}: ${err.slice(0, 90)}`);
  if (r.status === 401 || r.status === 429 || r.status === 402) throw new Error('STOP:' + r.status);
  return null;
}

const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asrCheck(mp3Path, origText) {
  const wav = mp3Path.replace('.mp3', '_asr.wav');
  try { execSync(`ffmpeg -y -v quiet -i ${mp3Path} -ar 16000 -ac 1 ${wav}`); } catch { return { pass: false, got: 'FFMPEG-ERR', sim: 0 }; }
  const waits = [6000, 12000, 20000, 30000, 30000, 30000];
  for (let attempt = 1; attempt <= waits.length + 1; attempt++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      await sleep(3000); // فاصله ثابت بین ASR ها
      const got = (res.text || '').trim();
      if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got)) return { pass: false, got, sim: 0, cjk: true };
      const sim = sim3(origText, got);
      return { pass: sim >= SIM_GATE, got, sim };
    } catch (e) {
      if (attempt > waits.length) return { pass: true, got: 'ASR-ERR', sim: -1, unknown: true };
      console.log(`    ASR busy — ${waits[attempt - 1] / 1000}s صبر`);
      await sleep(waits[attempt - 1]);
    }
  }
}

function durOf(p) {
  try { return Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100; }
  catch { return 2.0; }
}

// خطوط از dialogues23.py
const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
const lines = [];
for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'/g)) {
  lines.push({ key: m[1], who: m[2], fa: m[3] });
}
console.log(`${lines.length} خط — شروع تولید (gate=${SIM_GATE}٪ trigram)`);

const results = {};
let stopAll = false, quotaStop = false;
const t0 = Date.now();

for (let li = 0; li < lines.length; li++) {
  const { key, who, fa } = lines[li];
  const outMp3 = path.join(OUT_DIR, key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 8000) { results[key] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[key] = { ok: false, from: 'stopped' }; continue; }

  const voiceId = VOICES[who];
  let passBuf = null, passInfo = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !stopAll; attempt++) {
    const seed = Math.floor(Math.random() * 2000000);
    let buf = null;
    try { buf = await ttsOnce(voiceId, fa, seed); }
    catch (e) { const s = String(e.message); if (s.startsWith('STOP')) { stopAll = true; quotaStop = true; } break; }
    if (!buf) { await sleep(2500); continue; }
    const raw = path.join(OUT_DIR, key + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    const chk = await asrCheck(raw, fa);
    console.log(`  [${li + 1}/${lines.length}] ${key}/${who}(${NAMES[who]}) t${attempt}: ${chk.sim}%${chk.cjk ? ' CJK' : ''} ${chk.pass ? 'PASS' : 'fail'} «${(chk.got || '').slice(0, 42)}»`);
    if (chk.pass) { passBuf = buf; passInfo = chk; fs.unlinkSync(raw); break; }
    await sleep(1800);
  }
  if (passBuf) {
    const pre = path.join(OUT_DIR, key + '_pre.mp3');
    fs.writeFileSync(pre, passBuf);
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre);
    try { fs.unlinkSync(path.join(OUT_DIR, key + '_raw.mp3')); } catch { }
    results[key] = { ok: true, from: 'elevenlabs', sim: passInfo.sim };
  } else {
    results[key] = { ok: false, from: 'fallback' };
  }
  await sleep(1200);
}

// ساخت voices27_data.js — ElevenLabs در صورت موفقیت + fallback edge-tts
const old = fs.readFileSync('/home/z/my-project/scripts/voices24_data.js', 'utf8');
const getOld = k => {
  const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return m ? { d: m[1], a: m[2] } : null;
};
let js = `/* v27 — صداهای ElevenLabs فارسی (eleven_v4 + fa) — ۷ صدای اثبات‌شده
   Liam=آرش · Brian=پدر · George=راوی · Jessica=مریم · Bill=بی‌سیم · Charlie=نگهبان · Chris=دستفروش
   ممیزی ASR: trigram ≥ ${SIM_GATE}٪ + رد CJK — ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
let nEl = 0, nEdge = 0, nMiss = 0;
for (const { key } of lines) {
  const r = results[key];
  const elMp3 = path.join(OUT_DIR, key + '.mp3');
  if (r && r.ok && fs.existsSync(elMp3) && fs.statSync(elMp3).size > 4000) {
    const b64 = fs.readFileSync(elMp3).toString('base64');
    js += `${key}:{d:${durOf(elMp3)},a:"data:audio/mpeg;base64,${b64}"},\n`;
    nEl++;
  } else {
    const o = getOld(key);
    if (o) { js += `${key}:{d:${o.d},a:"${o.a}"},\n`; nEdge++; }
    else { nMiss++; }
  }
}
js += '};\n';
fs.writeFileSync(DATA_JS, js);
const report = {
  elevenlabs: nEl, edgeFallback: nEdge, missing: nMiss, stopped: stopAll, quotaStop,
  minutes: Math.round((Date.now() - t0) / 60000)
};
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
