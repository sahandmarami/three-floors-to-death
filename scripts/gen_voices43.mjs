#!/usr/bin/env node
// gen_voices43.mjs — v43: صداهای تازه برای دیالوگ‌های بازنویسی‌شدهٔ پایان +
// بارک‌های پلتفرمر ماریوئی + گویندگی تیتراژ. هم‌لولهٔ gen_voices42.mjs.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_81cff11664ee620900497f86c329db8d4a7d0757f3f75aeb'; // دست‌نخورده — طبق درخواست کاربر
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/repo/scripts/voice43_out';
fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = {
  a: 'pqHfZKP75CvOlQylNhV4',   // ارشان — Bill
  p: 'TX3LPaxmHKxFdv7VOQHJ',   // آرش — Liam
  n: 'nPczCjzI2devNBz1zQrb',   // راوی — Brian
  r: 'JBFqnCBsd6RMkjVDRZzb',   // بی‌سیم — George
  m: 'cgSgspJ2msm6clMCkdW9',   // دکتر مریم — Jessica
  s: 'XrExE9yKIg1WjnnlVkGX',   // دکتر سارا — Matilda
  g: 'pNInz6obpgDQGcFmaJgB',   // نگهبان — Adam
};

const SET = {
  a: { stability: 0.50, style: 0.35 },
  p: { stability: 0.50, style: 0.35 },
  n: { stability: 0.72, style: 0.18 },
  m: { stability: 0.58, style: 0.28 },
  s: { stability: 0.58, style: 0.30 },
  g: { stability: 0.60, style: 0.25 },
};

const FX0 = 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5';
const FX = {
  a: FX0, p: FX0, m: FX0, s: FX0, g: FX0,
  n: 'highpass=f=90,lowshelf=f=180:g=1.6,acompressor=threshold=0.34:ratio=3:attack=15:release=160,loudnorm=I=-17:TP=-1.5',
  k: 'highpass=f=220,lowshelf=f=300:g=3,acompressor=threshold=0.30:ratio=4:attack=10:release=120,loudnorm=I=-16:TP=-1.5',
};

const TAIL = 'مرسی.';

/* ================= دیالوگ نهایی v۴۳ — تک‌منبعِ حقیقت =================
   متن‌ها عیناً در v43_ending.js استفاده می‌شوند. */
const LINES = [
  // ---- رسیدن به پناهگاه
  { k: 'w43n1', w: 'n', t: 'پناهگاه. سی‌وشش شب جنگیدند تا بالاخره دروازه‌اش را ببینند.' },
  { k: 'w43g1', w: 'g', t: 'ایست! تا اسلحه‌ها را تحویل ندهید، هیچ‌کس داخل نمی‌شود.' },
  { k: 'w43p1', w: 'p', t: 'تمامِ دفاع‌مان همین بود... باشه. می‌ذارم.' },
  // ---- خوش‌آمد
  { k: 'w43m1', w: 'm', t: 'خوش اومدی. من دکتر مریمم؛ مسئول بخش پزشکی. اسمت چیه؟' },
  { k: 'w43p2', w: 'p', t: 'آرش. و اون‌طرف هم ارشانه. ما سی‌وشش شب پشت یه برج نیمه‌کاره دووم آوردیم.' },
  { k: 'w43m2', w: 'm', t: 'سی‌وشش شب؟ خودتون؟ امشب غذا و تشک دارید. فردا صبح، همه‌چیز رو می‌بینم.' },
  // ---- آژیر
  { k: 'w43a2', w: 'a', t: 'نیمه‌شبه... ولی این صدا خواب نمی‌ذاره. آژیره!' },
  { k: 'w43m3', w: 'm', t: 'آژیرِ خودِ ماست — با کد قرمز! یعنی خطر، از داخلِ پناهگاهه!' },
  { k: 'w43p3', w: 'p', t: 'اتاق کنترل کجاست؟ هر چی پرونده و سند هست، باید ببینیمش!' },
  // ---- اتاق کنترل
  { k: 'w43p4', w: 'p', t: 'این‌جا میزِ فرماندهیه... همه‌چیز روشنه، ولی یه نفر هم نیست.' },
  { k: 'w43m4', w: 'm', t: 'این پرونده رو دو سال پیش بسته بودم. چرا الان بازه؟' },
  { k: 'w43a3', w: 'a', t: 'پایینش نوشته: پروژهٔ Z — فاز دوم. آرش، فاز دوم!' },
  { k: 'w43p5', w: 'p', t: 'پس فاز اول... همین ویروسی بود که شهر رو بلعید؟' },
  { k: 'w43m5', w: 'm', t: 'اگه جوابِ سؤالت «آره» باشه، این ساختمون هم بخشی از نقشه‌ست. ببرش و بیا!' },
  // ---- فرار
  { k: 'w43a4', w: 'a', t: 'راهِ اصلی بسته‌ست! از کانالِ تهویه بریم — سریع!' },
  // ---- کنار آتش
  { k: 'w43a5', w: 'a', t: 'خب... دیگه نمی‌خوام وانمود کنم. اون پرونده دقیقاً چی بود، مریم؟' },
  { k: 'w43m6', w: 'm', t: 'دو خط بیشتر نبود. نه اسم، نه تاریخ... فقط یه نقشه با یه علامت. سمتِ شمال.' },
  { k: 'w43p6', w: 'p', t: 'یعنی اونا ویروس رو عمداً ساختن؟ دنیای ما آزمایشگاهِ اونا بوده؟' },
  { k: 'w43m7', w: 'm', t: 'من از خودم دورش می‌کردم... ولی شواهد، چیزی غیر از این نمی‌گه.' },
  { k: 'w43k1', w: 'm', t: 'اینجا دکتر ساراست. فرکانسِ قدیمی رو باز کردم؛ تا الان گوش می‌دادم. چیزی دارم که باید ببینید — ایستگاهِ شمالی، قبل از طلوع.' },
  { k: 'w43p7', w: 'p', t: 'ایستگاه شمالی... دقیقاً همون علامتِ روی نقشه. دیگه شانسی نیست.' },
  // ---- جدایی
  { k: 'w43m8', w: 'm', t: 'من با بازمانده‌ها به مقصد دوم می‌رم. رادیو روشن می‌مونه — هر چی فهمیدی، صدایم کن.' },
  { k: 'w43p8', w: 'p', t: 'مراقب خودت باش. دنیا دیگه جایِ مهربونی نیست.' },
  { k: 'w43a6', w: 'a', t: 'بریم. تا طلوعِ آفتاب، نیمهٔ راهه.' },
  // ---- ایستگاه شمالی
  { k: 'w43s1', w: 's', t: 'دیر کردید. فکر می‌کردم دیگه هیچ‌کس اون فرکانسِ قدیمی رو یادش نمونه.' },
  { k: 'w43p9', w: 'p', t: 'تو از اونا هستی؟ از سازنده‌های پروژهٔ Z؟' },
  { k: 'w43s2', w: 's', t: 'من طراحی‌اش کردم. قرار بود درمان باشه... بعد شد سلاح. و بعد، پایانِ همه‌چیز.' },
  { k: 'w43p10', w: 'p', t: 'اون پناهگاه... تله بود؟ ما فقط دادهٔ آزمایش بودیم؟' },
  { k: 'w43s3', w: 's', t: 'شما تنها کسانی بودید که از همه‌چیز زنده رد شدید. برای همین بهتون نیاز دارم — فازِ دو باید متوقف بشه.' },
  { k: 'w43a7', w: 'a', t: 'جادهٔ شمالی سالمه. ماشین آماده‌ست — فقط بگید بریم کجا.' },
  { k: 'w43s4', w: 's', t: 'شمال. آخرین آزمایشگاه. و آخرین فرصت برای برگردوندنِ دنیا.' },
  // ---- حذف از دنده
  { k: 'w43n3', w: 'n', t: 'ماشین در دلِ دره پیچید؛ سه سرنشین، یک راز، و جاده‌ای که به هیچ‌کجای نقشه نمی‌رسید.' },
  // ---- اپیلوگ
  { k: 'w43n4', w: 'n', t: 'چراغ ماشین، مثل ستاره‌ای ریز، در دلِ تاریکی گم شد.' },
  { k: 'w43p11', w: 'p', t: 'فصلِ اول تمومه، ارشان. ولی از امشب، جاده‌ها مالِ ماست.' },
  { k: 'w43a8', w: 'a', t: 'هنوز زنده‌ایم. یعنی هنوز یه شانس هست.' },
  // ---- گویندگی تیتراژ
  { k: 'w43n5', w: 'n', t: 'سه طبقه تا مرگ. پایانِ فصلِ اول... جادهٔ شمالی، هنوز ادامه دارد.' },
  // ---- بارک‌های پلتفرمر (ماریوئی)
  { k: 'p43a', w: 'p', t: 'تنها مونده... فقط باید سریع‌تر از شب باشم.' },
  { k: 'p43b', w: 'p', t: 'پل از وسط شکسته... از روی سکوها می‌پرم.' },
  { k: 'p43c', w: 'p', t: 'نور ایستگاه! درست همون‌جاست که نقشه گفت.' },
];

function scribe(buf) {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'a.mp3');
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'fa');
  const r = fetch(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
  return r.then(async r => { if (!r.ok) return null; const j = await r.json(); return { lang: j.language_code, text: (j.text || '').trim(), words: (j.words || []).filter(w => w.type === 'word') }; });
}
function normW(w) {
  return w.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک').toLowerCase();
}
function durOf(p) {
  try { return Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100; }
  catch { return 2.0; }
}
function cutByWords(rawMp3, sc, outMp3) {
  const dur = durOf(rawMp3);
  const tailFirst = normW(TAIL.split(' ')[0]);
  let cut = null;
  for (let i = sc.words.length - 1; i >= Math.max(0, sc.words.length - 4); i--) {
    if (normW(sc.words[i].text) === tailFirst) { cut = Math.max(0.5, sc.words[i].start - 0.08); break; }
  }
  if (cut == null) cut = dur * 0.72;
  cut = Math.min(cut, dur - 0.2);
  execSync(`ffmpeg -y -v quiet -i ${rawMp3} -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0, cut - 0.08).toFixed(3)}:d=0.08" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
}

let budget = 0, done = 0, fail = 0;
for (const L of LINES) {
  const outMp3 = path.join(OUT_DIR, L.k + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { console.log(`${L.k}: cached`); done++; continue; }
  const vs = SET[L.w];
  const t = L.t.trim();
  budget += t.length + TAIL.length;
  let ok = false;
  for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
    const padded = t + ' ' + TAIL;
    let model = 'eleven_v4';
    let body = { text: padded, model_id: model, language_code: 'fa', seed: Math.floor(Math.random() * 2000000), voice_settings: { stability: vs.stability, similarity_boost: 0.75, style: vs.style, use_speaker_boost: true } };
    let r = await fetch(`${BASE}/text-to-speech/${VOICES[L.w]}?output_format=mp3_22050_32`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body),
    });
    if (!r.ok) {
      const msg = (await r.text()).slice(0, 140);
      console.log(`${L.k}: TTS ${r.status} ${msg}`);
      if (r.status === 400 && /model/i.test(msg)) {
        model = 'eleven_multilingual_v2';
        body = { text: padded, model_id: model, voice_settings: { stability: vs.stability, similarity_boost: 0.75, style: vs.style, use_speaker_boost: true } };
        r = await fetch(`${BASE}/text-to-speech/${VOICES[L.w]}?output_format=mp3_22050_32`, {
          method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body),
        });
      }
      if (!r.ok) { await sleep(2500); continue; }
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const raw = path.join(OUT_DIR, L.k + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    const sc = await scribe(buf);
    if (!sc || !/^(fas|fa|pes)/.test(sc.lang || '')) { console.log(`${L.k}: lang=${sc && sc.lang} X`); fs.unlinkSync(raw); await sleep(1200); continue; }
    const lineWords = t.replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(sc.words.map(w => normW(w.text)));
    const cov = Math.round(lineWords.filter(w => scSet.has(w)).length / lineWords.length * 100);
    if (cov < 55) { console.log(`${L.k}: cov=${cov}% X`); fs.unlinkSync(raw); await sleep(1200); continue; }
    const cutMp3 = path.join(OUT_DIR, L.k + '_cut.mp3');
    cutByWords(raw, sc, cutMp3);
    execSync(`ffmpeg -y -v quiet -i ${cutMp3} -af "${FX[L.w]}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(cutMp3); fs.unlinkSync(raw);
    console.log(`${L.k}: cov=${cov}% OK ${durOf(outMp3)}s`);
    ok = true; done++;
  }
  if (!ok) fail++;
  await sleep(350);
}
console.log('v43 voices done:', done, '/', LINES.length, 'fail:', fail, 'chars ~', budget);
