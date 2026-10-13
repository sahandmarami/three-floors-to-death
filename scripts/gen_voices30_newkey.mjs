#!/usr/bin/env node
// gen_voices30.mjs — دو خطِ باقی‌مانده از برنامه‌ی بازسازی لحن (v28)
// ------------------------------------------------------------------
// در v28 گزارش شد: «۲ خط از ۲۲ (aw1/aw4) صدا تغییر نکرد» — همان دو
// خطی که کاربر گفت «صداها رو درست کن، گفته بودی مونده». این دو خط
// آرش‌اند (صدای Liam) و باید با لحن فوری/مضطرب (urgent) گفته شوند:
//   aw1: «من همین‌جام! تو فقط شلیک کن!»   (وسط نبرد)
//   aw4: «باتری چراغ‌قوه تموم می‌شه!»      (هشدار بحرانی)
// کلید جدید ElevenLabs کاربر + ممیزی Scribe + برش کلمه‌ای (پایپ‌لاین ۲۷/۲۸)
// خروجی: voices30_data.js (کامل voices28 + این دو خط تازه)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice30';
const SRC_DATA = '/home/z/my-project/scripts/voices28_data.js';
const DATA_JS = '/home/z/my-project/scripts/voices30_data.js';
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = { a: 'TX3LPaxmHKxFdv7VOQHJ' };        // Liam — آرش
const FX = {
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
};
const RETAKE = {
  aw1: { m: 'urgent' },
  aw4: { m: 'urgent' },
};
const MOOD = {
  urgent: { stability: 0.65, style: 0.15, tails: ['و باید همین امشب زنده بمونیم', 'چاره‌ی دیگه‌ای نداریم اتفاقاً', 'این تنها راهه و بس'] },
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
  return w.replace(/\u200c/g, '').replace(/ـ/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک')
    .replace(/^بطری$/, 'باتری')      /* ASR تلفظ فارسیِ باتری را بطری می‌نویسد — یک واژه است */
    .toLowerCase();
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
console.log(`بازتولید ${keys.length} خط باقی‌مانده (کلید جدید، لحن urgent):`);
for (const k of keys) console.log(`  ${k} [${RETAKE[k].m}] ${ALL[k].fa}`);

const results = {};
let stopAll = false;
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
    /* تلفظ شفاف‌ترِ «باتری»: کشیده‌ی میان‌حرفی (باتـری) به TTS می‌گوید
       هجاها را جدا بگوید — متنِ روی صفحه تغییری نمی‌کند */
    let t = fa.trim();
    if (key === 'aw4') t = t.replace('باتری', 'باتـری');
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
      console.log(`  ${key}/${who} t${attempt}: lang=${sc.lang} ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const scWords = sc.words.map(w => normW(w.text)).filter(Boolean);
    const lineWords = fa.trim().replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(scWords);
    const hits = lineWords.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / Math.max(1, lineWords.length) * 100);
    if (cov < 60) {
      lastInfo = `cov=${cov}%`;
      console.log(`  ${key}/${who} t${attempt}: cov=${cov}% «${sc.text.slice(0, 40)}» ❌`);
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
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[who]}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre); fs.unlinkSync(cutMp3);
    console.log(`  ${key}/${who}(Liam) [urgent] t${attempt}: cov=${cov}% ✓ ${durOf(outMp3)}s — «${sc.text.slice(0, 50)}»`);
    ok = true;
    results[key] = { ok: true, cov, asr: sc.text.slice(0, 60) };
    fs.unlinkSync(raw);
    await sleep(800);
  }
  if (!ok) results[key] = { ok: false, why: lastInfo };
}

// voices30_data.js — کپی کامل ۲۸ + جایگزینی دو خط تازه
const old = fs.readFileSync(SRC_DATA, 'utf8');
const getOld = k => {
  const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return m ? { d: m[1], a: m[2] } : null;
};
let nEl = 0, nKeep = 0, nMiss = 0;
let js = `/* v30 — صداهای فارسی ElevenLabs؛ دو خطِ باقی‌مانده (aw1/aw4) با لحن urgent
   و کلید جدید بازسازی شدند · ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
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
const report = { regenerated: nEl, kept: nKeep, failed: keys.filter(k => !results[k] || !results[k].ok), detail: results };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify({ regenerated: nEl, kept: nKeep, failed: report.failed }));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
