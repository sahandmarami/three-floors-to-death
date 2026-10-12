#!/usr/bin/env node
// gen_voices27c.mjs — تولید کامل ۱۱۹ خط فارسی ElevenLabs v4+fa
// پیپ‌لاین: pad تا ≥52ch → TTS → Scribe ASR (language_code + کلمه‌timestamp) → برش دقیق در مرز جمله → FX
// ممیزی: language_code=='fas' + همپوشانی کلمات ≥60٪ — fallback: edge-tts (voices24_data.js)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice27_full';
const DATA_JS = '/home/z/my-project/scripts/voices27_data.js';
const MAX_ATTEMPTS = 4;
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

const TAILS = [
  'فردا قراره چی بشه رو هیچ‌کس نمی‌دونه',
  'باید تا آخرین لحظه ایستادگی کنیم و بس',
  'این تازه اول ماجراست رفیق من',
  'چیزی که الان مهمه اینه که زنده بمونیم',
];

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
  if ([401, 402, 429].includes(r.status)) throw new Error('STOP:' + r.status);
  console.log(`    TTS fail ${r.status}: ${err.slice(0, 80)}`);
  return null;
}

async function scribe(mp3Path) {
  for (let i = 0; i < 3; i++) {
    try {
      const fd = new FormData();
      fd.append('file', new Blob([fs.readFileSync(mp3Path)], { type: 'audio/mpeg' }), 'a.mp3');
      fd.append('model_id', 'scribe_v1');
      fd.append('language_code', 'fa');
      const r = await fetch(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
      if (!r.ok) { console.log(`    Scribe ${r.status}: ${(await r.text()).slice(0, 80)}`); if (r.status === 402) return null; await sleep(4000); continue; }
      const j = await r.json();
      const words = (j.words || []).filter(w => w.type === 'word');
      return { lang: j.language_code, text: (j.text || '').trim(), words };
    } catch (e) { await sleep(3000); }
  }
  return null;
}

function normW(w) {
  return w.replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک').toLowerCase();
}

function durOf(p) {
  try { return Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100; }
  catch { return 2.0; }
}

// برش بر اساس timestamp کلمه‌ی اولِ پُرکننده
function cutByWords(rawMp3, sc, tail, outMp3) {
  const dur = durOf(rawMp3);
  const tailFirst = normW(tail.split(' ')[0]);
  const tailLen = tail.split(' ').length;
  let cut = null;
  // از آخر به اول: کلمه‌ای که کلمه‌ی اول پُرکننده است و بعدش ~طول پُرکننده کلمه می‌ماند
  for (let i = Math.max(0, sc.words.length - tailLen - 2); i < sc.words.length; i++) {
    if (normW(sc.words[i].text) === tailFirst) { cut = Math.max(0.5, sc.words[i].start - 0.07); break; }
  }
  if (cut == null) {
    // fallback: آخرین سکوت
    const log = execSync(`ffmpeg -i ${rawMp3} -af silencedetect=noise=-35dB:d=0.22 -f null - 2>&1`).toString();
    const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(m => parseFloat(m[1]));
    const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => parseFloat(m[1]));
    for (let i = 0; i < starts.length; i++) {
      const s = starts[i], e = ends[i] != null ? ends[i] : dur;
      if (e < dur - 0.12) cut = s + Math.min(0.14, (e - s) / 2);
    }
  }
  if (cut == null) cut = dur * 0.6;
  cut = Math.min(cut, dur - 0.2);
  execSync(`ffmpeg -y -v quiet -i ${rawMp3} -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0, cut - 0.08).toFixed(3)}:d=0.08" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
  return cut;
}

const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
const lines = [];
for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'/g)) {
  lines.push({ key: m[1], who: m[2], fa: m[3] });
}
console.log(`${lines.length} خط — pad≥${PAD_MIN} + Scribe gate + برش کلمه‌ای`);

const results = {};
let stopAll = false, quotaStop = false, scribeDead = false;
const t0 = Date.now();

for (let li = 0; li < lines.length; li++) {
  const { key, who, fa } = lines[li];
  const outMp3 = path.join(OUT_DIR, key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { results[key] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[key] = { ok: false, from: 'stopped' }; continue; }

  const voiceId = VOICES[who];
  let ok = false, lastInfo = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !stopAll && !ok; attempt++) {
    const tail = TAILS[(li + attempt) % TAILS.length];
    let t = fa.trim();
    if (!/[.!؟…]$/.test(t)) t += '.';
    const padded = t.length >= PAD_MIN ? t : t + ' ' + tail;
    const seed = Math.floor(Math.random() * 2000000);
    let buf = null;
    try { buf = await ttsOnce(voiceId, padded, seed); }
    catch (e) { if (String(e.message).startsWith('STOP')) { stopAll = true; quotaStop = true; } break; }
    if (!buf) { await sleep(2500); continue; }
    const raw = path.join(OUT_DIR, key + '_raw.mp3');
    fs.writeFileSync(raw, buf);

    const sc = await scribe(raw);
    if (!sc) { scribeDead = true; fs.unlinkSync(raw); continue; } // scribe از دسترس خارج شد
    if (sc.lang && !/^(fas|fa|pes)/.test(sc.lang)) {
      lastInfo = `lang=${sc.lang}`;
      console.log(`  [${li + 1}/${lines.length}] ${key}/${who} t${attempt}: lang=${sc.lang} ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    // همپوشانی کلمات خط با متنِ قبل از پُرکننده
    const scWords = sc.words.map(w => normW(w.text)).filter(Boolean);
    const lineWords = fa.trim().replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(scWords);
    const hits = lineWords.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / Math.max(1, lineWords.length) * 100);
    if (cov < 60) {
      lastInfo = `cov=${cov}%`;
      console.log(`  [${li + 1}/${lines.length}] ${key}/${who} t${attempt}: cov=${cov}% «${sc.text.slice(0, 40)}» ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    // موفقیت → برش و FX (خطوط بلند بدون پُرکننده: برش نمی‌خورند)
    const hasTail = padded !== t;
    const cutMp3 = path.join(OUT_DIR, key + '_cut.mp3');
    try {
      if (hasTail) cutByWords(raw, sc, tail, cutMp3);
      else fs.copyFileSync(raw, cutMp3);
    }
    catch (e) { console.log(`  ${key}: cut ERR`); fs.unlinkSync(raw); continue; }
    const pre = path.join(OUT_DIR, key + '_pre.mp3');
    fs.copyFileSync(cutMp3, pre);
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre); fs.unlinkSync(cutMp3);
    console.log(`  [${li + 1}/${lines.length}] ${key}/${who}(${NAMES[who]}) t${attempt}: cov=${cov}% ✓ ${durOf(outMp3)}s`);
    ok = true;
    results[key] = { ok: true, from: 'elevenlabs', cov };
    fs.unlinkSync(raw);
    await sleep(800);
  }
  if (!ok && !results[key]) results[key] = { ok: false, from: 'fallback', why: lastInfo };
  if (!ok) await sleep(600);
}

// voices27_data.js — ElevenLabs + fallback edge-tts
const old = fs.readFileSync('/home/z/my-project/scripts/voices24_data.js', 'utf8');
const getOld = k => {
  const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return m ? { d: m[1], a: m[2] } : null;
};
let js = `/* v27 — صداهای ElevenLabs فارسی (eleven_v4+fa → Scribe gate → برش کلمه‌ای)
   Liam=آرش · Bill=پدر · Brian=راوی · Jessica=مریم · George=بی‌سیم · Charlie=نگهبان · Chris=دستفروش
   ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
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
const report = { elevenlabs: nEl, edgeFallback: nEdge, missing: nMiss, stopped: stopAll, quotaStop, scribeDead, minutes: Math.round((Date.now() - t0) / 60000) };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
