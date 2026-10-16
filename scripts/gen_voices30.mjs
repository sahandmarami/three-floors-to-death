#!/usr/bin/env node
// gen_voices30.mjs — v30: متن بازنویسی‌شدهٔ افتتاحیه + لحن جدی برای آرشان
// ------------------------------------------------------------------
// درخواست‌های کاربر:
//   ۱) متن افتتاحیه/انتقال‌ها/پناهگاه/پایانی عیناً از اسکریپت خودش
//   ۲) صدای آرشان «با هیجان و خوشحالی» نباشد — همه‌چیز خطرناک است؛
//      لحن جدی/کم‌انرژی (grim: stability .82 / style .05 + atempo .96)
// خروجی: voices30_data.js (کلیپ‌های سالم از voices28_data.js کپی می‌شوند)
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

const VOICES = {
  a: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرش
  p: 'pqHfZKP75CvOlQylNhV4', // Bill — بازیکن
  n: 'nPczCjzI2devNBz1zQrb', // Brian — راوی
  m: 'cgSgspJ2msm6clMCkdW9', // Jessica — دکتر مریم
  r: 'JBFqnCBsd6RMkjVDRZzb', // George — رادیو
};
const NAMES = { a: 'Liam', p: 'Bill', n: 'Brian', m: 'Jessica', r: 'George' };

const FX = {
  p: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  m: 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n: 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r: 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
};

/* ---------- لحن‌ها ---------- */
const MOOD = {
  calm:   { stability: 0.74, style: 0.10, tails: ['و این تازه آغاز راه بود', 'اما راه هنوز ادامه داشت', 'و شب‌های تازه در پیش بود'] },
  grim:   { stability: 0.82, style: 0.05, tails: ['ولی باید ادامه بدیم و بس', 'چاره‌ای دیگه نداریم', 'همین درسته و باید قبولش کنیم'] },
  urgent: { stability: 0.65, style: 0.15, tails: ['و باید همین الان حرکت کنیم', 'دیگه وقت زیادی نداریم', 'هر ثانیه مهمه'] },
  mcalm:  { stability: 0.72, style: 0.08, tails: ['پس با هم ادامه می‌دهیم', 'به همین دلیل اینجا جمع شدیم', 'و همه باید کمک کنیم'] },
  radio:  { stability: 0.80, style: 0.05, tails: ['این پیام تکرار خواهد شد', 'پایان پیام', 'لطفاً به این هشدار توجه کنید'] },
};

/* ---------- خطوط تازه (اسکریپت کاربر) + بازضبط لحن جدی ---------- */
const LINES = [
  // —— افتتاحیه ص۱: شهر متروکه ——
  { k: 'n30a', who: 'n', m: 'calm',  t: 'همه‌چیز با یک ویروس شروع شد؛ بی‌سروصدا از حاشیهٔ شهر رسید و کم‌کم همه‌چیز را تغییر داد.' },
  { k: 'n30b', who: 'n', m: 'calm',  t: 'چند هفته بیشتر طول نکشید. خیابان‌ها خالی شدند و صدای زندگی جای خودش را به سکوت داد.' },
  // —— ص۲: برج ——
  { k: 's30a', who: 'a', m: 'grim',  t: 'عجیبه... یه زمانی این خیابون‌ها پر از آدم بود.' },
  { k: 's30p', who: 'p', m: 'calm',  t: 'نمی‌دونم چند نفر زنده موندن؛ ولی تا وقتی این برج پابرجاست، هنوز یه شانس داریم.' },
  { k: 's30b', who: 'a', m: 'grim',  t: 'طبقهٔ سوم جای خوبیه برای دیده‌بانی. از اون بالا می‌تونیم قبل از رسیدن زامبی‌ها ببینیمشون.' },
  { k: 's30n', who: 'n', m: 'calm',  t: 'آن دو با هر وسیله‌ای که پیدا می‌کردند، برج را محکم‌تر کردند. می‌دانستند شب که برسد، دیگر فرصتی برای اشتباه ندارند.' },
  // —— ص۳: شروع حمله ——
  { k: 'k30a', who: 'a', m: 'urgent', t: 'صبر کن... اون صدا رو شنیدی؟ دارن میان!' },
  { k: 'k30p', who: 'p', m: 'urgent', t: 'آره، دیدمشون! آماده شو؛ این اولین شبه!' },
  // —— ص۴: پیام رادیویی ——
  { k: 'r30r', who: 'r', m: 'radio', t: 'توجه، توجه! همهٔ بازماندگان به سمت پاسگاه شمالی حرکت کنند. آنجا آخرین نقطهٔ امن شناخته‌شده است. این پیام تکرار خواهد شد.' },
  { k: 'r30a', who: 'a', m: 'grim',  t: 'شنیدی؟ پس هنوز آدم‌های دیگه‌ای هم زنده‌ان!' },
  { k: 'r30p', who: 'p', m: 'calm',  t: 'اول باید امشب رو زنده بمونیم. وقتی راه باز شد، دنبال پاسگاه می‌ریم.' },
  { k: 'r30n', who: 'n', m: 'calm',  t: 'سفر آن‌ها از همان شب آغاز شد؛ سی‌وشش شب مبارزه، برای رسیدن به جایی که شاید هنوز امیدی در آن باقی مانده باشد.' },
  // —— انتقال ۱: فرار از برج ——
  { k: 't30a1', who: 'a', m: 'urgent', t: 'برج داره می‌ریزه! سریع، باید از اینجا بریم!' },
  { k: 't30a2', who: 'a', m: 'urgent', t: 'طناب رو بگیر! من ماشین رو آماده کردم. زود باش، وقت نداریم!' },
  { k: 't30n1', who: 'n', m: 'calm',  t: 'آن‌ها درست پیش از فروریختن برج فرار کردند؛ اما راه پناهگاه هنوز طولانی بود.' },
  // —— انتقال ۲: کانال مه‌آلود ——
  { k: 't30p1', who: 'p', m: 'urgent', t: 'همه‌جا رو مه گرفته! حتی مسیر رودخونه رو هم نمی‌بینم!' },
  { k: 't30a3', who: 'a', m: 'grim',  t: 'چراغ قایق رو روشن کردم. آروم جلو برو و حواست به مسیر باشه!' },
  { k: 't30n2', who: 'n', m: 'calm',  t: 'آن‌ها از کانال گذشتند و به پاسگاه نظامی رسیدند؛ جایی که شاید سرنخی از مسیر پناهگاه پیدا می‌شد.' },
  // —— انتقال ۳: مسیر برفی ——
  { k: 't30a4', who: 'a', m: 'urgent', t: 'جاده پر از زامبیه! باید از مسیر کوهستانی بریم.' },
  { k: 't30p2', who: 'p', m: 'grim',  t: 'با این برف و باد؟ اگه توی مسیر گیر کنیم چی؟' },
  { k: 't30a5', who: 'a', m: 'urgent', t: 'اگه همین‌جا بمونیم، گیر زامبی‌ها می‌افتیم. حرکت کن؛ با هم از پسش برمیایم!' },
  { k: 't30n3', who: 'n', m: 'calm',  t: 'پس از عبور از مسیر برفی، برج مخابراتی در دوردست دیده شد. شاید آنجا راه ارتباط با پناهگاه را پیدا می‌کردند.' },
  // —— پناهگاه ——
  { k: 'h30m1', who: 'm', m: 'mcalm', t: 'خوش اومدید. از برج دیده‌بانی شما رو دیدیم. رسیدن به اینجا کار آسونی نبوده.' },
  { k: 'h30a1', who: 'a', m: 'grim',  t: 'اینجا واقعاً امنه؟ دیگه مجبور نیستیم هر شب فرار کنیم؟' },
  { k: 'h30m2', who: 'm', m: 'mcalm', t: 'فعلاً دیوارها پابرجان؛ اما آذوقه‌مون محدوده و رادیو هم درست کار نمی‌کنه.' },
  { k: 'h30p1', who: 'p', m: 'calm',  t: 'من رادیو رو بررسی می‌کنم. شاید بتونیم با بقیهٔ بازمانده‌ها ارتباط بگیریم.' },
  { k: 'h30a2', who: 'a', m: 'grim',  t: 'من هم دیوارها رو تقویت می‌کنم. این بار قرار نیست فقط دو نفر از برج دفاع کنن.' },
  { k: 'h30m3', who: 'm', m: 'mcalm', t: 'کمی استراحت کنید. از فردا باید برای روزهای سخت آماده بشیم.' },
  // —— پایانی: هشدار تازه ——
  { k: 'f30r', who: 'r', m: 'radio', t: 'توجه به تمام واحدها! یک گروه بزرگ از زامبی‌ها از درهٔ شمالی به سمت پناهگاه در حرکت است. همهٔ نیروها آمادهٔ دفاع شوند!' },
  { k: 'f30a', who: 'a', m: 'grim',  t: 'صدای آژیر رو می‌شنوی؟ انگار تازه شروع شده...' },
  { k: 'f30n', who: 'n', m: 'calm',  t: 'آن‌ها به پناهگاه رسیده بودند؛ اما امنیتی که دنبالش بودند، شاید فقط آغاز نبردی بزرگ‌تر بود.' },
  // —— تایپ «ادامه دارد» ——
  { k: 'tbc30n', who: 'n', m: 'calm', t: 'پایان فصل اول داستان پناهگاه: ادامه دارد...' },
  // —— بازضبط لحن جدی آرشان (خطوط داخل بازی که هنوز هیجان دارند) ——
  { k: 'aw1',    who: 'a', m: 'urgent', t: 'من همین‌جام! تو فقط شلیک کن!' },
  { k: 'aw4',    who: 'a', m: 'urgent', t: 'باتری چراغ‌قوه تموم می‌شه!' },
  { k: 'c1w1a',  who: 'a', m: 'grim',  t: 'رفتن؟ واقعاً رفتن؟' },
  { k: 'c1w3a',  who: 'a', m: 'grim',  t: 'جعبه ابزار پیدا کردم!' },
  { k: 'c3ca',   who: 'a', m: 'grim',  t: 'اینجا نوشته برج مخابراتی تو کوهستانه.' },
  { k: 'c3a1',   who: 'a', m: 'grim',  t: 'انگار یه گروهی اینجا زندگی می‌کرده.' },
  { k: 'c1e1a',  who: 'a', m: 'grim',  t: 'ساختمون دیگه مثل روز اول نیست.' },
  { k: 'c4f1',   who: 'a', m: 'grim',  t: 'همه آماده‌ان. ولی این سکوت عادی نیست.' },
];

async function quotaLeft() {
  try {
    const r = await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } });
    const j = await r.json();
    return j.character_limit - j.character_count;
  } catch (e) { return 99999; }
}

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
  if ([401, 402, 429].includes(r.status)) throw new Error('STOP:' + r.status + ':' + err.slice(0, 60));
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
  return String(w).replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
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

console.log('quota before:', await quotaLeft());
const results = {};
let stopAll = false;
const t0 = Date.now();
const MAX_ATTEMPTS = 4, PAD_MIN = 52;

// صف اولویت: خطوط اسکریپت تازه قبل از بازضبط‌ها
const order = LINES.slice();

for (let li = 0; li < order.length; li++) {
  const { k, who, m, t: fa } = order[li];
  const mood = MOOD[m];
  const outMp3 = path.join(OUT_DIR, k + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { results[k] = { ok: true, from: 'cached' }; continue; }
  if (stopAll) { results[k] = { ok: false }; continue; }
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
    const raw = path.join(OUT_DIR, k + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    const sc = await scribe(raw);
    if (!sc) { fs.unlinkSync(raw); continue; }
    if (sc.lang && !/^(fas|fa|pes)/.test(sc.lang)) {
      lastInfo = `lang=${sc.lang}`;
      console.log(`  [${li + 1}/${order.length}] ${k}/${who} t${attempt}: lang=${sc.lang} X`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const scWords = sc.words.map(w => normW(w.text)).filter(Boolean);
    const lineWords = fa.trim().replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(scWords);
    const hits = lineWords.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / Math.max(1, lineWords.length) * 100);
    if (cov < 60) {
      lastInfo = `cov=${cov}%`;
      console.log(`  [${li + 1}/${order.length}] ${k}/${who} t${attempt}: cov=${cov}% «${sc.text.slice(0, 40)}» X`);
      fs.unlinkSync(raw); await sleep(1200); continue;
    }
    const hasTail = padded !== t;
    const cutMp3 = path.join(OUT_DIR, k + '_cut.mp3');
    try {
      if (hasTail) cutByWords(raw, sc, tail, cutMp3);
      else fs.copyFileSync(raw, cutMp3);
    } catch (e) { console.log(`  ${k}: cut ERR`); fs.unlinkSync(raw); continue; }
    const pre = path.join(OUT_DIR, k + '_pre.mp3');
    fs.copyFileSync(cutMp3, pre);
    const slow = (m === 'grim' && who === 'a') ? 'atempo=0.96,' : '';
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${slow}${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre); fs.unlinkSync(cutMp3);
    console.log(`  [${li + 1}/${order.length}] ${k}/${who}(${NAMES[who]}) [${m}] t${attempt}: cov=${cov}% OK ${durOf(outMp3)}s`);
    ok = true;
    results[k] = { ok: true, cov };
    fs.unlinkSync(raw);
    await sleep(800);
  }
  if (!ok) results[k] = { ok: false, why: lastInfo };
  if (!ok) await sleep(600);
  if ((li + 1) % 12 === 0) console.log('quota now:', await quotaLeft());
}

console.log('quota after:', await quotaLeft());

// voices30_data.js — کپی کامل ۲۸ + خطوط تازه
const old = fs.readFileSync(SRC_DATA, 'utf8');
const getOld = k => {
  const mm = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
  return mm ? { d: mm[1], a: mm[2] } : null;
};
let nNew = 0, nKeep = 0, nMiss = 0;
let js = `/* v30 — صداهای فارسی ElevenLabs؛ متن افتتاحیه/انتقال‌های بازنویسی‌شدهٔ کاربر
   + لحن جدی آرشان (grim) · ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
const keyOrder = [];
for (const mm of old.matchAll(/^([a-z0-9]+):\{d:/gm)) keyOrder.push(mm[1]);
for (const { k } of LINES) if (!keyOrder.includes(k)) keyOrder.push(k);
for (const k of keyOrder) {
  const fresh = path.join(OUT_DIR, k + '.mp3');
  const isOurs = LINES.some(l => l.k === k);
  if (isOurs && results[k] && results[k].ok && fs.existsSync(fresh) && fs.statSync(fresh).size > 3000) {
    const b64 = fs.readFileSync(fresh).toString('base64');
    js += `${k}:{d:${durOf(fresh)},a:"data:audio/mpeg;base64,${b64}"},\n`;
    nNew++;
  } else {
    if (isOurs) nMiss++;
    const o = getOld(k);
    if (o) { js += `${k}:{d:${o.d},a:"${o.a}"},\n`; nKeep++; }
    else nMiss++;
  }
}
js += '};\n';
fs.writeFileSync(DATA_JS, js);
const report = { fresh: nNew, kept: nKeep, failed: Object.keys(results).filter(k => !results[k].ok), minutes: Math.round((Date.now() - t0) / 6000) / 10 };
fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
console.log('\nDONE:', JSON.stringify(report));
console.log('=>', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
