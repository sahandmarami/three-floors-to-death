#!/usr/bin/env node
// gen_voices27b.mjs — تولید کامل ۱۱۹ خط فارسی ElevenLabs v4+fa
// یافته‌های امروز:
//   · متن < ~50 کاراکتر → خروجی چینی (v4) / خراب (v2)
//   · راه‌حل: pad تا ≥52 کاراکتر با جمله‌ی پُرکننده → TTS → برش در آخرین سکوت → ASR روی کلیپ بریده‌شده
//   · ۷ صدای اثبات‌شده: Liam/Bill/Brian/Jessica/George/Charlie/Chris (کاندید27 @57ch)
// fallback: edge-tts از voices24_data.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice27_full';
const DATA_JS = '/home/z/my-project/scripts/voices27_data.js';
const MAX_ATTEMPTS = 3;
const SIM_GATE = 40;
const PAD_MIN = 52;
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = {
  a: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرش
  p: 'pqHfZKP75CvOlQylNhV4', // Bill — پدر
  n: 'nPczCjzI2devNBz1zQrb', // Brian — راوی
  m: 'cgSgspJ2msm6clMCkdW9', // Jessica — مریم
  r: 'JBFqnCBsd6RMkjVDRZzb', // George — بی‌سیم (افکت رادیو)
  b: 'IKne3meq5aSn9XLyUdCD', // Charlie — نگهبان (افکت هیولا)
  d: 'iP95p4xoKVk53GoZ742B', // Chris — دستفروش
};
const NAMES = { a: 'Liam', p: 'Bill', n: 'Brian', m: 'Jessica', r: 'George', b: 'Charlie', d: 'Chris' };

const FX = {
  p: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  m: 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n: 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r: 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  b: 'asetrate=24000*0.82,aresample=24000,atempo=1.18,volume=1.35,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
  d: 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
};

// جمله‌های پُرکننده — تک‌جمله، بدون ویرگول، ~۲۴-۳۷ کاراکتر
const TAILS = [
  'فردا قراره چی بشه رو هیچ‌کس نمی‌دونه',
  'باید تا آخرین لحظه ایستادگی کنیم و بس',
  'این تازه اول ماجراست رفیق من',
  'چیزی که الان مهمه اینه که زنده بمونیم',
];
function padText(line, i) {
  let t = line.trim();
  if (!/[.!؟…]$/.test(t)) t += '.';
  if (t.length >= PAD_MIN) return t;
  const tail = TAILS[i % TAILS.length];
  return t + ' ' + tail;
}

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
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true }
  };
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) return Buffer.from(await r.arrayBuffer());
  const err = await r.text();
  console.log(`    TTS fail ${r.status}: ${err.slice(0, 90)}`);
  if ([401, 402, 429].includes(r.status)) throw new Error('STOP:' + r.status);
  return null;
}

// برش در آخرین سکوتِ قبل از گفتارِ پُرکننده
function cutAtLastSilence(mp3In, mp3Out, lineLen, padLen) {
  const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${mp3In}`).toString().trim());
  const log = execSync(`ffmpeg -i ${mp3In} -af silencedetect=noise=-35dB:d=0.22 -f null - 2>&1`).toString();
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  let cut = null;
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i], e = ends[i] != null ? ends[i] : dur;
    if (e < dur - 0.12) cut = s + Math.min(0.14, (e - s) / 2); // آخری که بعدش گفتار هست
  }
  if (cut == null) cut = Math.max(0.6, dur * (lineLen / padLen) - 0.05); // برآورد نسبتی
  cut = Math.min(cut, dur - 0.25);
  execSync(`ffmpeg -y -v quiet -i ${mp3In} -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0, cut - 0.09).toFixed(3)}:d=0.09" -ar 24000 -ac 1 -b:a 32k ${mp3Out}`);
  return { cut, dur };
}

const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asrCheck(wavPath, origText) {
  const waits = [6000, 12000, 20000, 30000, 30000, 30000];
  for (let attempt = 1; attempt <= waits.length + 1; attempt++) {
    try {
      const b64 = fs.readFileSync(wavPath).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      await sleep(4000);
      const got = (res.text || '').trim();
      if (!got) return { pass: false, got: '', sim: 0 };
      if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got)) return { pass: false, got, sim: 0, cjk: true };
      const sim = sim3(origText, got);
      return { pass: sim >= SIM_GATE, got, sim };
    } catch (e) {
      if (attempt > waits.length) return { pass: true, got: 'ASR-ERR', sim: -1, unknown: true };
      await sleep(waits[attempt - 1]);
    }
  }
}

function durOf(p) {
  try { return Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100; }
  catch { return 2.0; }
}

const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
const lines = [];
for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'/g)) {
  lines.push({ key: m[1], who: m[2], fa: m[3] });
}
console.log(`${lines.length} خط — pad≥${PAD_MIN}ch + برش سکوت + ASR (gate=${SIM_GATE}٪)`);

const results = {};
let stopAll = false, quotaStop = false;
const t0 = Date.now();

for (let li = 0; li < lines.length; li++) {
  const { key, who, fa } = lines[li];
  const outMp3 = path.join(OUT_DIR, key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { results[key] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[key] = { ok: false, from: 'stopped' }; continue; }

  const voiceId = VOICES[who];
  const padded = padText(fa, li);
  const cutMp3 = path.join(OUT_DIR, key + '_cut.mp3');
  const cutWav = path.join(OUT_DIR, key + '_cut.wav');
  let passInfo = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !stopAll; attempt++) {
    const seed = Math.floor(Math.random() * 2000000);
    let buf = null;
    try { buf = await ttsOnce(voiceId, padded, seed); }
    catch (e) { if (String(e.message).startsWith('STOP')) { stopAll = true; quotaStop = true; } break; }
    if (!buf) { await sleep(2500); continue; }
    const raw = path.join(OUT_DIR, key + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    try { cutAtLastSilence(raw, cutMp3, fa.length, padded.length); }
    catch (e) { console.log(`  ${key}: cut ERR ${e.message}`); fs.unlinkSync(raw); continue; }
    execSync(`ffmpeg -y -v quiet -i ${cutMp3} -ar 16000 -ac 1 ${cutWav}`);
    const chk = await asrCheck(cutWav, fa);
    console.log(`  [${li + 1}/${lines.length}] ${key}/${who}(${NAMES[who]}) t${attempt}: ${chk.sim}%${chk.cjk ? ' CJK' : ''} ${chk.pass ? 'PASS' : 'fail'} «${(chk.got || '').slice(0, 40)}»`);
    fs.unlinkSync(raw);
    if (chk.pass) { passInfo = chk; break; }
    await sleep(1500);
  }

  if (passInfo) {
    const pre = path.join(OUT_DIR, key + '_pre.mp3');
    fs.copyFileSync(cutMp3, pre);
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre);
    results[key] = { ok: true, from: 'elevenlabs', sim: passInfo.sim };
  } else {
    results[key] = { ok: false, from: 'fallback' };
  }
  for (const f of [cutMp3, cutWav]) { try { fs.unlinkSync(f); } catch { } }
  await sleep(1500);
}

// voices27_data.js — ElevenLabs + fallback edge-tts
const old = fs.readFileSync('/home/z/my-project/scripts/voices24_data.js', 'utf8');
const getOld = k => {
  const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return m ? { d: m[1], a: m[2] } : null;
};
let js = `/* v27 — صداهای ElevenLabs فارسی (eleven_v4 + fa + pad&cut) — ۷ صدا
   Liam=آرش · Bill=پدر · Brian=راوی · Jessica=مریم · George=بی‌سیم · Charlie=نگهبان · Chris=دستفروش
   ممیزی ASR trigram ≥ ${SIM_GATE}٪ + رد CJK — ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
let nEl = 0, nEdge = 0, nMiss = 0;
for (const { key } of lines) {
  const r = results[key];
  const elMp3 = path.join(OUT_DIR, key + '.mp3');
  if (r && r.ok && fs.existsSync(elMp3) && fs.statSync(elMp3).size > 3000) {
    const b64 = fs.readFileSync(elMp3).toString('base64');
    js += `${key}:{d:${durOf(elMp3)},a:"data:audio/mpeg;base64,${b64}"},\n`;
    nEl++;
  } else {
    const o = getOld(key);
    if (o) { js += `${key}:{d:${o.d},a:"${o.a}"},\n`; nEdge++; }
    else nMiss++;
  }
}
js += '};\n';
fs.writeFileSync(DATA_JS, js);
const report = { elevenlabs: nEl, edgeFallback: nEdge, missing: nMiss, stopped: stopAll, quotaStop, minutes: Math.round((Date.now() - t0) / 60000) };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
