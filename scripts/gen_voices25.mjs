// gen_voices25.mjs — تولید همه صداهای v25 با ElevenLabs v3 (فارسی ایرانی)
// بازیگران (تأیید ASR): p/n=George · a/d=Roger · m=Alice · r=Matilda · b=نگه‌داری از v24 (غرش)
// fallback: هر خط ناموفق → کلیپ edge-tts از voices24_data.js
import fs from 'fs';
import { execSync } from 'child_process';

const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT = '/home/z/my-project/scripts/voice25';
fs.mkdirSync(OUT, { recursive: true });

// خطوط از dialogues23 (ساختار اجرای پایتون) — این‌جا مستقیم از JSON تولید می‌کنیم
// اجرا: ابتدا py برای استخراج خطوط به JSON
const LINES = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/lines25.json', 'utf8'));

const CAST = {
  p: { id: 'JBFqnCBsd6RMkjVDRZzb', set: { stability: 0.50, similarity_boost: 0.80 } }, // سهند — گرم/مسئول
  n: { id: 'JBFqnCBsd6RMkjVDRZzb', set: { stability: 0.68, similarity_boost: 0.90 } }, // راوی — رسمی
  a: { id: 'CwhRBWXzGAHq8TQ4Fs17', set: { stability: 0.33, similarity_boost: 0.75 } }, // ارشان — پرانرژی
  d: { id: 'CwhRBWXzGAHq8TQ4Fs17', set: { stability: 0.28, similarity_boost: 0.70 } }, // دستفروش — شلوغ
  m: { id: 'Xb7hH8MSUJpSbSDYk0k2', set: { stability: 0.55, similarity_boost: 0.85 } }, // مریم — آرام
  r: { id: 'XrExE9yKIg1WjnnlVkGX', set: { stability: 0.62, similarity_boost: 0.85 } }, // بی‌سیم — رادیو
};
const SKIP_WHO = new Set(['b']);   // غرش هیولا: از v24 می‌ماند

// FX پس‌پردازش به تفکیک شخصیت (همان زنجیره‌ی v24)
const FX = {
  p: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  m: 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n: 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r: 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  d: 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const dur = f => {
  try {
    return Math.round(parseFloat(execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${f}`).toString().trim()) * 100) / 100;
  } catch (e) { return 2.0; }
};

async function quotaLeft() {
  try {
    const r = await fetch(BASE + '/user', { headers: { 'xi-api-key': KEY } });
    const j = await r.json();
    return j.subscription.character_limit - j.subscription.character_count;
  } catch (e) { return 99999; }
}

async function genOne(item) {
  const [key, who, text] = item;
  const mp3 = `${OUT}/${key}.mp3`;
  if (fs.existsSync(mp3) && fs.statSync(mp3).size > 8000) return [key, 'skip'];
  if (SKIP_WHO.has(who)) return [key, 'monster-keep'];
  const c = CAST[who]; if (!c) return [key, 'no-cast'];
  const raw = `${OUT}/_raw_${key}.mp3`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${BASE}/text-to-speech/${c.id}?output_format=mp3_22050_32`, {
        method: 'POST',
        headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: c.set })
      });
      if (r.ok) {
        fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
        execSync(`ffmpeg -y -v quiet -i ${raw} -af "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 48k ${mp3}`);
        fs.unlinkSync(raw);
        return [key, 'ok'];
      }
      console.log(`  ${key} http ${r.status} attempt ${attempt}`);
    } catch (e) { console.log(`  ${key} err ${e.message.slice(0, 50)} attempt ${attempt}`); }
    await sleep(2500 * attempt);
  }
  return [key, 'FAIL'];
}

async function main() {
  console.log('lines:', LINES.length, 'chars:', LINES.reduce((s, l) => s + l[2].length, 0));
  let q = await quotaLeft();
  console.log('quota remaining:', q);
  const results = [];
  // دو کارگر — سهمیه رایگان، ملایم
  const queue = [...LINES];
  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      const res = await genOne(item);
      results.push(res);
      if (res[1] === 'ok') console.log('ok', res[0]);
      if (res[1] === 'FAIL') console.log('FAIL', res[0]);
    }
  }
  await Promise.all([worker(), worker()]);
  const fails = results.filter(r => r[1] === 'FAIL').map(r => r[0]);
  console.log(`\nGenerated: ${results.filter(r => r[1] === 'ok').length}, failed: ${fails.length}`, fails);
  console.log('quota remaining after:', await quotaLeft());
  fs.writeFileSync('/home/z/my-project/scripts/voice25_results.json', JSON.stringify(results));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
