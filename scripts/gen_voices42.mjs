#!/usr/bin/env node
// gen_voices42.mjs — v42: پرکردن شکاف‌های صوتی + خط‌های تازهٔ دستفروش
// ۴۴ کلیپِ داستانی که در v41 کلیدشان بود اما صدایی نداشتند (هماهنگ‌نبودن صحبت‌ها!)
// + خط‌های معنادار تازهٔ دستفروش (بدون «بخرِ» تکراری) + تیزر Z پایان
// همان خط لولهٔ gen_voices40extra.mjs: eleven_v4 fa + scribe_v1 (تأیید پوشش کلمات) + ffmpeg
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_81cff11664ee620900497f86c329db8d4a7d0757f3f75aeb'; // دست‌نخورده — طبق درخواست کاربر
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/tftd/scripts/voice42_out';
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
  d1: 'iP95p4xoKVk53GoZ742B',  // شنل‌پوش مرموز — Chris
  d2: 'bIHbv24MWmeRgasZH58o',  // پیرمرد — Will
  d3: 'SOYHLrjzK2X1ezoPC6cr',  // ماسک گاز — Harry
  d4: 'cjVigY5qzO86Huf0OWal',  // بارانی‌زرد — Eric
  d5: 'SAz9YHcvj6GT2YYXdXww',  // چرخ‌دسته — River
  z: 'N2lVS1w4EtoT3dr4eOWO',   // صدای Z — Callum (هیکی و مرموز)
};

const SET = {
  a: { stability: 0.50, style: 0.35 },
  p: { stability: 0.50, style: 0.35 },
  n: { stability: 0.72, style: 0.18 },
  r: { stability: 0.62, style: 0.22 },
  m: { stability: 0.58, style: 0.28 },
  s: { stability: 0.58, style: 0.28 },
  g: { stability: 0.60, style: 0.25 },
  d1: { stability: 0.44, style: 0.50 },   // مرموز و کشیده
  d2: { stability: 0.50, style: 0.40 },
  d3: { stability: 0.75, style: 0.12 },   // خشک و کوتاه
  d4: { stability: 0.42, style: 0.52 },   // پرانرژی
  d5: { stability: 0.58, style: 0.30 },
  z: { stability: 0.50, style: 0.55 },
};

// زنجیرهٔ صداگذاری پس از تولید (طبق v40 + حالت‌های ویژه)
const FX0 = 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5';
const FX = {
  a: FX0, p: FX0, n: 'highpass=f=90,lowshelf=f=180:g=1.6,acompressor=threshold=0.34:ratio=3:attack=15:release=160,loudnorm=I=-17:TP=-1.5',
  r: 'highpass=f=220,lowshelf=f=300:g=3,acompressor=threshold=0.30:ratio=4:attack=10:release=120,loudnorm=I=-16:TP=-1.5', // رادیویی فلزی
  m: FX0, s: FX0, g: FX0,
  d1: 'highpass=f=140,lowshelf=f=200:g=2.2,acompressor=threshold=0.30:ratio=3.4:attack=12:release=150,loudnorm=I=-16:TP=-1.5',
  d2: FX0, d4: FX0, d5: FX0,
  d3: 'highpass=f=340,bandpass=f=900:width_type=h:width=700,acompressor=threshold=0.30:ratio=4:attack=10:release=120,loudnorm=I=-16:TP=-1.5', // ماسک گاز
  z: 'asetrate=24000*0.80,aresample=24000,atempo=1/0.80,lowshelf=f=180:g=3,acompressor=threshold=0.28:ratio=4:attack=10:release=130,loudnorm=I=-16:TP=-1.5', // بم و ترسناک
};

const TAIL = 'مرسی.'; // دنبالهٔ کوتاه برای برش تمیز — با scribe بریده می‌شود

const LINES = [
  // ---------- ۴۴ کلیپِ گمشدهٔ داستان ----------
  { k: 'c3ca', w: 'a', t: 'اینجا نوشته برج مخابراتی تو کوهستانه.' },
  { k: 'c3cb', w: 'p', t: 'اگه کار کنه، پیام کامل‌تری می‌گیریم.' },
  { k: 'c3cd', w: 'p', t: 'زوده. اول باید برسیم.' },
  { k: 'c1e1a', w: 'a', t: 'ساختمون دیگه مثل روز اول نیست.' },
  { k: 'c1e1b', w: 'p', t: 'ما هم مثل روز اول نیستیم.' },
  { k: 'c1e1d', w: 'p', t: 'اون روز باید راه خروج داشته باشیم.' },
  { k: 'c4f3', w: 'm', t: 'از برج خبر رسید. حرکتی در دره شمالیه.' },
  { k: 't30a1', w: 'a', t: 'برج داره می‌ریزه! سریع، باید از اینجا بریم!' },
  { k: 't30a2', w: 'a', t: 'طناب رو بگیر! من ماشین رو آماده کردم. زود باش، وقت نداریم!' },
  { k: 't30n1', w: 'n', t: 'آن‌ها درست پیش از فروریختن برج فرار کردند؛ اما راه پناهگاه هنوز طولانی بود.' },
  { k: 't30p1', w: 'p', t: 'همه‌جا رو مه گرفته! حتی مسیر رودخونه رو هم نمی‌بینم!' },
  { k: 't30a3', w: 'a', t: 'چراغ قایق رو روشن کردم. آروم جلو برو و حواست به مسیر باشه!' },
  { k: 't30n2', w: 'n', t: 'آن‌ها از کانال گذشتند و به پاسگاه نظامی رسیدند؛ جایی که شاید سرنخی از مسیر پناهگاه پیدا می‌شد.' },
  { k: 't30a4', w: 'a', t: 'جاده پر از زامبیه! باید از مسیر کوهستانی بریم.' },
  { k: 't30p2', w: 'p', t: 'با این برف و باد؟ اگه توی مسیر گیر کنیم چی؟' },
  { k: 't30n3', w: 'n', t: 'پس از عبور از مسیر برفی، برج مخابراتی در دوردست دیده شد. شاید آنجا راه ارتباط با پناهگاه را پیدا می‌کردند.' },
  { k: 'c3n1', w: 'n', t: 'آن‌سوی کانال، ایستگاهی متروک بود؛ نشانه‌هایی از زندگی، بی‌کسی.' },
  { k: 'c3a1', w: 'a', t: 'انگار یه گروهی اینجا زندگی می‌کرده.' },
  { k: 'c3p1', w: 'p', t: 'آثارش هست. ولی کجا رفتن؟' },
  { k: 'h30m1', w: 'm', t: 'خوش اومدید. از برج دیده‌بانی شما رو دیدیم. رسیدن به اینجا کار آسونی نبوده.' },
  { k: 'h30a1', w: 'a', t: 'اینجا واقعاً امنه؟ دیگه مجبور نیستیم هر شب فرار کنیم؟' },
  { k: 'h30m2', w: 'm', t: 'فعلاً دیوارها پابرجان؛ اما آذوقه‌مون محدوده و رادیو هم درست کار نمی‌کنه.' },
  { k: 'h30p1', w: 'p', t: 'من رادیو رو بررسی می‌کنم. شاید بتونیم با بقیهٔ بازمانده‌ها ارتباط بگیریم.' },
  { k: 'h30a2', w: 'a', t: 'من هم دیوارها رو تقویت می‌کنم. این بار قرار نیست فقط دو نفر از برج دفاع کنن.' },
  { k: 'h30m3', w: 'm', t: 'کمی استراحت کنید. از فردا باید برای روزهای سخت آماده بشیم.' },
  { k: 'f30r', w: 'r', t: 'توجه به تمام واحدها! یک گروه بزرگ از زامبی‌ها از درهٔ شمالی به سمت پناهگاه در حرکت است. همهٔ نیروها آمادهٔ دفاع شوند!' },
  { k: 'f30a', w: 'a', t: 'صدای آژیر رو می‌شنوی؟ انگار تازه شروع شده...' },
  { k: 'f30n', w: 'n', t: 'آن‌ها به پناهگاه رسیده بودند؛ اما امنیتی که دنبالش بودند، شاید فقط آغاز نبردی بزرگ‌تر بود.' },
  { k: 't2n1', w: 'n', t: 'رفتند؛ بی‌آنکه بدانند آن‌سوی کانال چیست.' },
  { k: 't2a1', w: 'a', t: 'باورم نمی‌شه ترکش کردیم.' },
  { k: 't2p1', w: 'p', t: 'اونجا رو برای زندگی آماده کردیم، نه زندان.' },
  { k: 't2p2', w: 'p', t: 'تا خودمون نبینیم، اعتماد نمی‌کنیم.' },
  { k: 'n30a', w: 'n', t: 'همه‌چیز با یک ویروس شروع شد؛ بی‌سروصدا از حاشیهٔ شهر رسید و کم‌کم همه‌چیز را تغییر داد.' },
  { k: 'n30b', w: 'n', t: 'چند هفته بیشتر طول نکشید. خیابان‌ها خالی شدند و صدای زندگی جای خودش را به سکوت داد.' },
  { k: 's30a', w: 'a', t: 'عجیبه... یه زمانی این خیابون‌ها پر از آدم بود.' },
  { k: 's30p', w: 'p', t: 'نمی‌دونم چند نفر زنده موندن؛ ولی تا وقتی این برج پابرجاست، هنوز یه شانس داریم.' },
  { k: 's30b', w: 'a', t: 'طبقهٔ سوم جای خوبیه برای دیده‌بانی. از اون بالا می‌تونیم قبل از رسیدن زامبی‌ها ببینیمشون.' },
  { k: 's30n', w: 'n', t: 'آن دو با هر وسیله‌ای که پیدا می‌کردند، برج را محکم‌تر کردند. می‌دانستند شب که برسد، دیگر فرصتی برای اشتباه ندارند.' },
  { k: 'k30a', w: 'a', t: 'صبر کن... اون صدا رو شنیدی؟ دارن میان!' },
  { k: 'k30p', w: 'p', t: 'آره، دیدمشون! آماده شو؛ این اولین شبه!' },
  { k: 'r30r', w: 'r', t: 'توجه، توجه! همهٔ بازماندگان به سمت پاسگاه شمالی حرکت کنند. آنجا آخرین نقطهٔ امن شناخته‌شده است. این پیام تکرار خواهد شد.' },
  { k: 'r30a', w: 'a', t: 'شنیدی؟ پس هنوز آدم‌های دیگه‌ای هم زنده‌ان!' },
  { k: 'r30p', w: 'p', t: 'اول باید امشب رو زنده بمونیم. وقتی راه باز شد، دنبال پاسگاه می‌ریم.' },
  { k: 'r30n', w: 'n', t: 'سفر آن‌ها از همان شب آغاز شد؛ سی‌وشش شب مبارزه، برای رسیدن به جایی که شاید هنوز امیدی در آن باقی مانده باشد.' },
  // ---------- خط‌های تازهٔ دستفروش (معنادار، بی‌تکرار) ----------
  { k: 'q1a', w: 'd1', t: 'امشب باد از درهٔ شمالی می‌وزد. چیزی که باهاش میاد، جنسِ من نیست.' },
  { k: 'q1b', w: 'd1', t: 'عصای من پیش از هر خطر تکان می‌خوره. امشب، از لحظه‌ی رسیدنم، داره می‌لرزه.' },
  { k: 'q1c', w: 'd1', t: 'سرنخ‌هات رو جمع کن، آرش. من همه‌چیز رو از دو طرفِ این شهر دیده‌ام.' },
  { k: 'q1d', w: 'd1', t: 'پروژهٔ Z؟ مثل آینه‌ست؛ خودت باید ببینیش. من فقط جنس می‌فروشم.' },
  { k: 'q2a', w: 'd2', t: 'تو جوانیِ من، شب‌ها مالِ خواب بود. حالا شب‌ها فقط مالِ زنده‌موندنه!' },
  { k: 'q2b', w: 'd2', t: 'جنسام قدیمین، مثل خودم؛ ولی هر دو هنوز کار می‌کنیم!' },
  { k: 'q2c', w: 'd2', t: 'این بسته‌رو از یه داروخانه برداشتم؛ صاحبش دیگه بهش نیاز نداشت.' },
  { k: 'q3a', w: 'd3', t: 'باد از دره میاد. بوی گله‌ی جدید رو میاره.' },
  { k: 'q3b', w: 'd3', t: 'کالا مرتبه. انتخاب کن. وقت کمه.' },
  { k: 'q3c', w: 'd3', t: 'اسمت رو ماسکم نوشتم، آرش. قصه‌ش درازه.' },
  { k: 'q4a', w: 'd4', t: 'امشب از جاده گذشتم؛ زامبی‌ها مثل صفِ نونوایی برمی‌گشتن!' },
  { k: 'q4b', w: 'd4', t: 'یه کارتون از پناهگاهِ قدیمی پیدا کردم؛ اینا توش بود!' },
  { k: 'q4c', w: 'd4', t: 'فردا اگه زنده بودی، یه جوکِ تازه دارم؛ مالِ قبلِ ویروسه!' },
  { k: 'q5a', w: 'd5', t: 'از سه تا ایستگاه گذشتم؛ همه خاموش بودن. رادیو رو روشن نگه دار.' },
  { k: 'q5b', w: 'd5', t: 'چرخ‌دسته‌ام صدا میده، ولی هنوز می‌چرخه؛ مثل ما.' },
  { k: 'q5c', w: 'd5', t: 'هر شب یکی از چراغ‌های شهر خاموش میشه؛ ولی تو هنوز ایستادی.' },
  { k: 'pa1', w: 'p', t: 'امشب در انتظارمون چیه؟' },
  { k: 'pa2', w: 'p', t: 'دربارهٔ پروژهٔ Z چی می‌دونی؟' },
  { k: 'pa3', w: 'p', t: 'این سرنخ‌ها رو دیدی؟ یه چیزیش می‌فهمی؟' },
  { k: 'pa4', w: 'p', t: 'تو دقیقاً کی هستی؟ چرا همیشه قبل از غروب می‌رسی؟' },
  { k: 'pa5', w: 'p', t: 'اونا که از پناهگاه رفتن... کجا رفتن؟' },
  // ---------- تیزر Z پایان ----------
  { k: 'zb1', w: 'z', t: 'آرش... هنوز نفهمیدی من کی‌ام. ولی جاده‌ی شمالی، راهِ منِه.' },
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

let budget = 0;
for (const L of LINES) {
  const outMp3 = path.join(OUT_DIR, L.k + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { console.log(`${L.k}: cached`); continue; }
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
    if (!sc || !/^(fas|fa|pes)/.test(sc.lang || '')) { console.log(`${L.k}: lang=${sc && sc.lang} ❌`); fs.unlinkSync(raw); await sleep(1200); continue; }
    const lineWords = t.replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(sc.words.map(w => normW(w.text)));
    const cov = Math.round(lineWords.filter(w => scSet.has(w)).length / lineWords.length * 100);
    if (cov < 60) { console.log(`${L.k}: cov=${cov}% ❌`); fs.unlinkSync(raw); await sleep(1200); continue; }
    const cutMp3 = path.join(OUT_DIR, L.k + '_cut.mp3');
    cutByWords(raw, sc, cutMp3);
    execSync(`ffmpeg -y -v quiet -i ${cutMp3} -af "${FX[L.w]}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(cutMp3); fs.unlinkSync(raw);
    console.log(`${L.k}: cov=${cov}% ✓ ${durOf(outMp3)}s`);
    ok = true;
  }
  await sleep(400);
}
console.log('chars billed ~', budget, '→ done');
