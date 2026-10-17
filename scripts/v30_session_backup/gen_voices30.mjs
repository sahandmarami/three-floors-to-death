#!/usr/bin/env node
// gen_voices30.mjs — تولید کامل ۱۶۷ خط فارسی ElevenLabs v4+fa (v30)
// پیپ‌لاین: pad تا ≥52ch → TTS → Scribe ASR → برش کلمه‌ای → FX
// چرخش کلید: KEY1 → KEY2 → KEY3 (روی اتمام سهمیه)
// casting طبق پرامپت: آرش=Liam(جوان/گرم) · ارشان=Bill(بم/خشن) · مریم=Jessica
// سارا=Matilda · نگهبان=Adam · راوی=Brian · بی‌سیم=George · هیولا=Charlie
// دستفروش: d1=Chris(شنل‌پوش) d2=Will(پیرمرد) d3=Harry(ماسک‌گاز) d4=Eric(جوان) d5=River(چرخ‌دسته)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const KEYS = [
  'sk_f0eabb5408c9df6a5729e0ceb5ed0f1106648fc9be426cc4',
  'sk_81cff11664ee620900497f86c329db8d4a7d0757f3f75aeb',
  'sk_3f2fb54165f2d97fb82c265ee228e01b9e851b737aa424ae',
];
let keyIdx = 0;
const key = () => KEYS[keyIdx];

const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice30_full';
const DATA_JS = '/home/z/my-project/scripts/voices30_data.js';
const MAX_ATTEMPTS = 4;
const PAD_MIN = 52;
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = {
  p:  'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرش (۲۵، گرم، جوان)
  a:  'pqHfZKP75CvOlQylNhV4', // Bill — ارشان (۳۵، بم، خشن)
  m:  'cgSgspJ2msm6clMCkdW9', // Jessica — دکتر مریم
  q:  'cgSgspJ2msm6clMCkdW9', // Jessica — مریم (رادیو)
  s:  'XrExE9yKIg1WjnnlVkGX', // Matilda — دکتر سارا
  k:  'XrExE9yKIg1WjnnlVkGX', // Matilda — سارا (رادیو)
  g:  'pNInz6obpgDQGcFmaJgB', // Adam — نگهبان پناهگاه
  n:  'nPczCjzI2devNBz1zQrb', // Brian — راوی
  r:  'JBFqnCBsd6RMkjVDRZzb', // George — بی‌سیم
  b:  'IKne3meq5aSn9XLyUdCD', // Charlie — هیولای آخر
  d1: 'iP95p4xoKVk53GoZ742B', // Chris — شنل‌پوش
  d2: 'bIHbv24MWmeRgasZH58o', // Will — پیرمرد خنده‌رو
  d3: 'SOYHLrjzK2X1ezoPC6cr', // Harry — ماسک گاز
  d4: 'cjVigY5qzO86Huf0OWal', // Eric — جوان بارانی‌زرد
  d5: 'SAz9YHcvj6GT2YYXdXww', // River — چرخ‌دسته
};
const NAMES = { p: 'Liam', a: 'Bill', m: 'Jessica', q: 'Jessica+radio', s: 'Matilda', k: 'Matilda+radio', g: 'Adam', n: 'Brian', r: 'George', b: 'Charlie', d1: 'Chris', d2: 'Will', d3: 'Harry', d4: 'Eric', d5: 'River' };

/* تنظیمات صدای هر شخصیت — طبق بخش ۳/۷ پرامپت (stability) */
const SETTINGS = {
  p:  { stability: 0.60, style: 0.30 },
  a:  { stability: 0.50, style: 0.35 },
  m:  { stability: 0.75, style: 0.15 },
  q:  { stability: 0.75, style: 0.15 },
  s:  { stability: 0.70, style: 0.15 },
  k:  { stability: 0.70, style: 0.15 },
  g:  { stability: 0.55, style: 0.25 },
  n:  { stability: 0.55, style: 0.30 },
  r:  { stability: 0.60, style: 0.20 },
  b:  { stability: 0.55, style: 0.30 },
  d1: { stability: 0.70, style: 0.20 },
  d2: { stability: 0.60, style: 0.30 },
  d3: { stability: 0.75, style: 0.10 },
  d4: { stability: 0.50, style: 0.35 },
  d5: { stability: 0.65, style: 0.20 },
};
/* لحن‌های موقعیت‌دار (v28) برای خطوط بحرانی */
const MOODS = {
  urgent: { stability: 0.65, style: 0.15 },
  shaken: { stability: 0.80, style: 0.06 },
  dread:  { stability: 0.78, style: 0.08 },
  deep:   { stability: 0.82, style: 0.05 },
  relief: { stability: 0.70, style: 0.20 },
};
const MOOD_OF = {
  si1a: 'urgent', si2m: 'urgent', si3p: 'urgent',
  zf5a: 'urgent', zf1p: 'shaken', df1p: 'shaken', df2a: 'urgent',
  zf2m: 'dread', ss5m: 'dread', st3s: 'dread', st5s: 'dread',
  t1a1: 'urgent', tb1c: 'urgent', drv1: 'urgent',
  sp5a: 'deep', af1: 'relief', st9s: 'deep',
};

const FX = {
  p:  'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  a:  'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  m:  'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  q:  'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  s:  'lowshelf=f=200:g=1.2,acompressor=threshold=0.30:ratio=2.6:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  k:  'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  g:  'acompressor=threshold=0.30:ratio=2.8:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n:  'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r:  'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  b:  'asetrate=24000*0.82,aresample=24000,atempo=1.18,volume=1.35,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
  d1: 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  d2: 'asetrate=24000*0.90,aresample=24000,atempo=0.96,lowshelf=f=170:g=2.2,acompressor=threshold=0.30:ratio=2.8:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  d3: 'highpass=f=170,lowpass=f=3000,volume=1.45,acompressor=threshold=0.26:ratio=6:attack=6:release=60,loudnorm=I=-16:TP=-1.0',   /* (۳۰٫۰) نرم‌تر — «کالا» واضح باشد */
  d4: 'asetrate=24000*1.06,aresample=24000,atempo=1.05,highshelf=f=3000:g=1.5,acompressor=threshold=0.30:ratio=2.8:attack=8:release=110,loudnorm=I=-16.5:TP=-1.5',
  d5: 'atempo=0.97,lowshelf=f=190:g=1.4,acompressor=threshold=0.30:ratio=2.6:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
};

/* پُرکننده‌های کوتاه → متوسط → بلند (برش تمیز در مرز جمله) */
const TAILS = [
  'دیگه وقت نیست.',
  'چیزی که مهمه زنده موندنه.',
  'فردا قراره چی بشه هیچ‌کس نمی‌دونه.',
  'باید تا آخرین لحظه ایستادگی کنیم.',
];
function pickTail(text) {
  for (const tl of TAILS) if (text.length + 1 + tl.length >= PAD_MIN) return tl;
  return TAILS[3];
}

async function ttsOnce(voiceId, text, seed, vs) {
  const body = {
    text, model_id: 'eleven_v4', language_code: 'fa', seed,
    voice_settings: { stability: vs.stability, similarity_boost: 0.75, style: vs.style, use_speaker_boost: true },
  };
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': key(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (r.ok) return Buffer.from(await r.arrayBuffer());
  const err = await r.text();
  if ([401, 402, 429].includes(r.status)) throw new Error('STOP:' + r.status);
  console.log(`    TTS fail ${r.status}: ${err.slice(0, 80)}`);
  return null;
}

let scribeKeyIdx = 0; // اسکرایب می‌تواند با کلید فعلی ادامه دهد
async function scribe(mp3Path) {
  for (let i = 0; i < 3; i++) {
    try {
      const fd = new FormData();
      fd.append('file', new Blob([fs.readFileSync(mp3Path)], { type: 'audio/mpeg' }), 'a.mp3');
      fd.append('model_id', 'scribe_v1');
      fd.append('language_code', 'fa');
      const r = await fetch(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': key() }, body: fd });
      if (!r.ok) { console.log(`    Scribe ${r.status}: ${(await r.text()).slice(0, 80)}`); await sleep(4000); continue; }
      const j = await r.json();
      const words = (j.words || []).filter(w => w.type === 'word');
      return { lang: j.language_code, text: (j.text || '').trim(), words };
    } catch (e) { await sleep(3000); }
  }
  return null;
}

function normW(w) {
  return w.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک').toLowerCase();
}
/* (۳۰٫۰) مقایسه‌ی آسان‌گیر برای همجوشی‌های محاوره‌ای: Z↔ز · باتری↔بطری ·
   خسته‌ام↔خستم · تازه‌ست↔تازه است — ASR این‌ها را متفاوت می‌نویسد ولی صدا درست است */
const EQUIV = [
  [/ز/g, 'z'], [/^(باتری|بطری)$/, 'batry'],
  [/^(خستهام|خستم)$/, 'khastem'], [/^(تازهست|تازه)$/, 'tazeh'],
  [/^(میشه|می‌شه|میشود)$/m, 'mishe'],
];
function fuzzyW(w) {
  let x = normW(w);
  for (const [re, to] of EQUIV) x = x.replace(re, to);
  return x;
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
  /* (۳۰٫۰) اسکن از آخر به اول — کلمه‌ی اول پُرکننده در خودِ دم (نه در متن خط) */
  for (let i = sc.words.length - 1; i >= Math.max(0, sc.words.length - tailLen - 3); i--) {
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

/* --- خواندن خطوط از dialogues30.py --- */
const py = fs.readFileSync('/home/z/my-project/scripts/dialogues30.py', 'utf8');
const lines = [];
for (const m of py.matchAll(/\('([a-zA-Z0-9]+)',\s*'([a-z0-9]+)',\s*'([^']+)'\)/g)) {
  lines.push({ key: m[1], who: m[2], fa: m[3] });
}
const paddedTotal = lines.reduce((acc, l) => {
  let t = l.fa.trim(); if (!/[.!؟…]$/.test(t)) t += '.';
  return acc + (t.length >= PAD_MIN ? t.length : t.length + 1 + pickTail(t).length);
}, 0);
console.log(`${lines.length} خط — ورودی TTS تخمینی: ~${paddedTotal} کاراکتر`);

const results = {};
let stopAll = false;
const t0 = Date.now();

for (let li = 0; li < lines.length; li++) {
  const { key, who, fa } = lines[li];
  const outMp3 = path.join(OUT_DIR, key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { results[key] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[key] = { ok: false, from: 'stopped' }; continue; }

  const voiceId = VOICES[who];
  const mood = MOOD_OF[key];
  const baseSet = SETTINGS[who] || SETTINGS.p;
  const vs = mood ? { ...baseSet, ...MOODS[mood] } : baseSet;
  const covMin = who === 'b' ? 40 : 60;
  let ok = false, lastInfo = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !stopAll && !ok; attempt++) {
    const tail = TAILS[(li + attempt) % TAILS.length];
    let t = fa.trim();
    if (!/[.!؟…]$/.test(t)) t += '.';
    const padded = t.length >= PAD_MIN ? t : t + ' ' + tail;
    const seed = Math.floor(Math.random() * 2000000);
    let buf = null;
    try { buf = await ttsOnce(voiceId, padded, seed, vs); }
    catch (e) {
      if (String(e.message).startsWith('STOP')) {
        // چرخش کلید
        if (keyIdx < KEYS.length - 1) {
          keyIdx++;
          console.log(`  ⟳ سهمیه کلید تمام شد → کلید ${keyIdx + 1}`);
          attempt--; // با کلید جدید دوباره همین تلاش
          await sleep(1500);
          continue;
        }
        stopAll = true;
      }
      break;
    }
    if (!buf) { await sleep(2500); continue; }
    const raw = path.join(OUT_DIR, key + '_raw.mp3');
    fs.writeFileSync(raw, buf);

    const sc = await scribe(raw);
    if (!sc) { fs.unlinkSync(raw); continue; }
    if (sc.lang && !/^(fas|fa|pes)/.test(sc.lang)) {
      lastInfo = `lang=${sc.lang}`;
      console.log(`  [${li + 1}/${lines.length}] ${key}/${who} t${attempt}: lang=${sc.lang} ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const scWords = sc.words.map(w => normW(w.text)).filter(Boolean);
    const lineWords = fa.trim().replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    /* (۳۰٫۰) همپوشانی با معیار آسان‌گیر — همجوشی‌های محاوره‌ای ASR */
    const scSet = new Set(scWords);
    const scFuzzy = new Set(sc.words.map(w => fuzzyW(w.text)).filter(Boolean));
    const hits = lineWords.filter(w => scSet.has(w) || scFuzzy.has(fuzzyW(w))).length;
    const cov = Math.round(hits / Math.max(1, lineWords.length) * 100);
    if (cov < covMin) {
      lastInfo = `cov=${cov}%`;
      console.log(`  [${li + 1}/${lines.length}] ${key}/${who} t${attempt}: cov=${cov}% «${sc.text.slice(0, 40)}» ❌`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
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
    console.log(`  [${li + 1}/${lines.length}] ${key}/${who}(${NAMES[who]}${mood ? '/' + mood : ''}) t${attempt}: cov=${cov}% ✓ ${durOf(outMp3)}s`);
    ok = true;
    results[key] = { ok: true, from: 'elevenlabs', cov, mood: mood || null };
    fs.unlinkSync(raw);
    await sleep(700);
  }
  if (!ok && !results[key]) results[key] = { ok: false, from: 'failed', why: lastInfo };
  if (!ok) await sleep(500);
}

/* voices30_data.js */
let js = `/* v30 — صداهای فارسی ElevenLabs (eleven_v4+fa → Scribe gate → برش کلمه‌ای)
   آرش=Liam · ارشان=Bill · مریم=Jessica · سارا=Matilda · نگهبان=Adam · راوی=Brian
   بی‌سیم=George · هیولا=Charlie · دستفروش: Chris/Will/Harry/Eric/River
   ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
let nEl = 0, nMiss = 0;
for (const { key } of lines) {
  const r = results[key];
  const mp3 = path.join(OUT_DIR, key + '.mp3');
  if (r && r.ok && fs.existsSync(mp3) && fs.statSync(mp3).size > 3000) {
    const b64 = fs.readFileSync(mp3).toString('base64');
    js += `${key}:{d:${durOf(mp3)},a:"data:audio/mpeg;base64,${b64}"},\n`;
    nEl++;
  } else { nMiss++; console.log(`  MISS: ${key} (${r && r.why || '?'})`); }
}
js += '};\n';
fs.writeFileSync(DATA_JS, js);
const report = { generated: nEl, missing: nMiss, stopped: stopAll, lastKey: keyIdx + 1, minutes: Math.round((Date.now() - t0) / 60000) };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
