#!/usr/bin/env node
// gen_voices28.mjs — بازتولید «فقط خطوط لازم» با لحنِ درستِ موقعیت
// ------------------------------------------------------------------
// مشکل کاربر: بعضی خطوط با «هیجان شاد» گفته می‌شوند در حالی که موقعیت
// بحرانی است (حمله‌ی زامبی/شکستن تخته‌ها/سقوط برج). این اسکریپت فقط
// همان خطوط را با تنظیمات آرام‌تر/فوریتِ مضطرب دوباره می‌سازد:
//   · urgent  → stability .65 style .15 (فوری ولی نه شاد)
//   · shaken  → stability .80 style .06 (خسته/لرزیده بعد حمله)
//   · dread   → stability .78 style .08 (ترس/ناامیدی)
// کلید جدید کاربر + ممیزی Scribe + برش کلمه‌ای (همان پایپ‌لاین ۲۷)
// خروجی: voices28_data.js (کلی unaffected از voices27_data.js کپی می‌شود)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_ec290a62b6d347f8908855e3dd452c837d1961baac793973';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice28';
const SRC_DATA = '/home/z/my-project/scripts/voices27_data.js';
const DATA_JS = '/home/z/my-project/scripts/voices28_data.js';
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = {
  a: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرش
  p: 'pqHfZKP75CvOlQylNhV4', // Bill — پدر
  n: 'nPczCjzI2devNBz1zQrb', // Brian — راوی
  m: 'cgSgspJ2msm6clMCkdW9', // Jessica — مریم
  r: 'JBFqnCBsd6RMkjVDRZzb', // George — بی‌سیم
  b: 'IKne3meq5aSn9XLyUdCD', // Charlie — نگهبان
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

/* ---------- خطوطِ «لازم» — لحن درستِ موقعیت ----------
   urgent = هشدار فوری حین نبرد (نه شادی)
   shaken = خسته/لرزیده بعد از حمله/شکست
   dread  = ترس و ناامیدی
   (aw4 که در ۲۷ با edge-tts ماند هم اینجا با EL ساخته می‌شود) */
const RETAKE = {
  // —— نبرد حین بازی: هشدارهای فوری ——
  aw1:  { m: 'urgent' }, aw2: { m: 'urgent' }, aw4: { m: 'urgent' }, aw5: { m: 'urgent' },
  fbw1: { m: 'urgent' }, fbw2: { m: 'urgent' }, fbz1: { m: 'urgent' }, fbz2: { m: 'urgent' },
  // —— اولین شب: تنش قبل حمله ——
  w1a:  { m: 'shaken' }, w1b: { m: 'urgent' }, w1d: { m: 'shaken' },
  // —— بعد از حمله‌ی موج‌ها: خستگی/لرزش ——
  c1w2a: { m: 'shaken' }, c1w5a: { m: 'shaken' }, c1w4a: { m: 'shaken' },
  // —— سقوط برج/فرار: وحشت ——
  t1a1: { m: 'urgent' }, b1a1: { m: 'urgent' }, d1a1: { m: 'urgent' }, s1a1: { m: 'urgent' },
  // —— لحظه‌های تلخ پایان ——
  c4v4: { m: 'dread' }, c4v5: { m: 'shaken' }, c4v6: { m: 'urgent' },
  e2a:  { m: 'dread' }, i7a: { m: 'shaken' },
};
const MOOD = {
  urgent: { stability: 0.65, style: 0.15, tails: ['و باید همین امشب زنده بمونیم', 'چاره‌ی دیگه‌ای نداریم اتفاقاً', 'این تنها راهه و بس'] },
  shaken: { stability: 0.80, style: 0.06, tails: ['خسته‌م ولی باید ادامه بدیم', 'هنوز نفس می‌کشیم و همین مهمه', 'فردا رو باید دید'] },
  dread:  { stability: 0.78, style: 0.08, tails: ['نمی‌دونم چه چیزی منتظمونه', 'شاید دیگه راهی نمونده باشه', 'سکوت سنگینیه که فضا رو گرفته'] },
};

async function ttsOnce(voiceId, text, seed, vs) {
  const body = {
    text, model_id: 'eleven_v4', language_code: 'fa', seed,
    voice_settings: { stability: vs.stability, similarity_boost: 0.75, style: vs.style, use_speaker_boost: true }
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
function cutByWords(rawMp3, sc, tail, outMp3) {
  const dur = durOf(rawMp3);
  const tailFirst = normW(tail.split(' ')[0]);
  const tailLen = tail.split(' ').length;
  let cut = null;
  for (let i = Math.max(0, sc.words.length - tailLen - 2); i < sc.words.length; i++) {
    if (normW(sc.words[i].text) === tailFirst) { cut = Math.max(0.5, sc.words[i].start - 0.07); break; }
  }
  if (cut == null) {
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

// متن خطوط از dialogues23.py
const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
const ALL = {};
for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'/g)) {
  ALL[m[1]] = { who: m[2], fa: m[3] };
}
const keys = Object.keys(RETAKE).filter(k => ALL[k]);
console.log(`بازتولید ${keys.length} خط با لحن موقعیت‌دار:`);
for (const k of keys) console.log(`  ${k} [${RETAKE[k].m}] ${ALL[k].fa.slice(0, 40)}`);

const results = {};
let stopAll = false;
const t0 = Date.now();
const MAX_ATTEMPTS = 4, PAD_MIN = 52;

for (let li = 0; li < keys.length; li++) {
  const key = keys[li];
  const { who, fa } = ALL[key];
  const mood = MOOD[RETAKE[key].m];
  const outMp3 = path.join(OUT_DIR, key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { results[key] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[key] = { ok: false }; continue; }
  const voiceId = VOICES[who];
  let ok = false, lastInfo = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !stopAll && !ok; attempt++) {
    const tail = mood.tails[(li + attempt) % mood.tails.length];
    let t = fa.trim();
    if (!/[.!؟…]$/.test(t)) t += '.';
    const padded = t.length >= PAD_MIN ? t : t + ' ' + tail;
    const seed = Math.floor(Math.random() * 2000000);
    let buf = null;
    try { buf = await ttsOnce(voiceId, padded, seed, mood); }
    catch (e) { if (String(e.message).startsWith('STOP')) { stopAll = true; console.log('STOP:', e.message); } break; }
    if (!buf) { await sleep(2500); continue; }
    const raw = path.join(OUT_DIR, key + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    const sc = await scribe(raw);
    if (!sc) { fs.unlinkSync(raw); continue; }
    if (sc.lang && !/^(fas|fa|pes)/.test(sc.lang)) {
      lastInfo = `lang=${sc.lang}`;
      console.log(`  [${li + 1}/${keys.length}] ${key}/${who} t${attempt}: lang=${sc.lang} ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const scWords = sc.words.map(w => normW(w.text)).filter(Boolean);
    const lineWords = fa.trim().replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(scWords);
    const hits = lineWords.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / Math.max(1, lineWords.length) * 100);
    if (cov < 60) {
      lastInfo = `cov=${cov}%`;
      console.log(`  [${li + 1}/${keys.length}] ${key}/${who} t${attempt}: cov=${cov}% «${sc.text.slice(0, 40)}» ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const hasTail = padded !== t;
    const cutMp3 = path.join(OUT_DIR, key + '_cut.mp3');
    try {
      if (hasTail) cutByWords(raw, sc, tail, cutMp3);
      else fs.copyFileSync(raw, cutMp3);
    } catch (e) { console.log(`  ${key}: cut ERR`); fs.unlinkSync(raw); continue; }
    const pre = path.join(OUT_DIR, key + '_pre.mp3');
    fs.copyFileSync(cutMp3, pre);
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre); fs.unlinkSync(cutMp3);
    console.log(`  [${li + 1}/${keys.length}] ${key}/${who}(${NAMES[who]}) [${RETAKE[key].m}] t${attempt}: cov=${cov}% ✓ ${durOf(outMp3)}s`);
    ok = true;
    results[key] = { ok: true, cov };
    fs.unlinkSync(raw);
    await sleep(800);
  }
  if (!ok) results[key] = { ok: false, why: lastInfo };
  if (!ok) await sleep(600);
}

// voices28_data.js — کپی کامل ۲۷ + جایگزینی خطوط تازه
const old = fs.readFileSync(SRC_DATA, 'utf8');
const getOld = k => {
  const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return m ? { d: m[1], a: m[2] } : null;
};
let nEl = 0, nKeep = 0, nMiss = 0;
let js = `/* v28 — صداهای فارسی ElevenLabs؛ خطوط بحرانی با لحنِ موقعیت بازسازی شدند
   (urgent/shaken/dread — نه هیجان شاد وسط حمله‌ی زامبی) · ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
// همه‌ی ۱۱۹ خط از voices27 (مرتب مثل منبع) + override تازه‌ها
const keyOrder = [];
for (const m of old.matchAll(/^([a-z0-9]+):\{d:/gm)) keyOrder.push(m[1]);
for (const k of keys) if (!keyOrder.includes(k)) keyOrder.push(k);
for (const k of keyOrder) {
  const fresh = path.join(OUT_DIR, k + '.mp3');
  if (RETAKE[k] && results[k] && results[k].ok && fs.existsSync(fresh) && fs.statSync(fresh).size > 3000) {
    const b64 = fs.readFileSync(fresh).toString('base64');
    js += `${k}:{d:${durOf(fresh)},a:"data:audio/mpeg;base64,${b64}"},\n`;
    nEl++;
  } else {
    if (RETAKE[k]) nMiss++;
    const o = getOld(k);
    if (o) { js += `${k}:{d:${o.d},a:"${o.a}"},\n`; nKeep++; }
    else nMiss++;
  }
}
js += '};\n';
fs.writeFileSync(DATA_JS, js);
const report = { retaked: nEl, kept: nKeep, failed: Object.keys(results).filter(k => !results[k].ok), minutes: Math.round((Date.now() - t0) / 60000) };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
