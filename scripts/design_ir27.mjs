#!/usr/bin/env node
// design_ir27.mjs — ساخت ۳ صدای ایرانی با Voice Design + ASR + افزودن به کتابخانه
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT = '/home/z/my-project/scripts/voice27_design';
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

async function asr(p) {
  const wav = p.replace('.mp3', '.wav');
  execSync(`ffmpeg -y -v quiet -i ${p} -ar 16000 -ac 1 ${wav}`);
  for (let i = 0; i < 4; i++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      return (res.text || '').trim();
    } catch (e) { await sleep(9000); }
  }
  return '';
}

const DESIGNS = [
  {
    id: 'arash',
    name: 'آرش IR — جوان ایرانی',
    desc: 'A young Iranian man in his early twenties from Tehran, speaking Persian (Farsi) with a warm, energetic, street-smart tone. Slightly hoarse young male voice, emotional and brave, like a hero character in an Iranian action drama. Natural Tehrani accent.',
    text: 'آرش: چقدر دیگه؟ آب تمومه. پدر: تا جای امن پیدا نکنیم وایسیم نمی‌شه. آرش: پس بزن بریم، من جلو می‌افتم. ما تا آخرین شب با هم می‌مونیم.'
  },
  {
    id: 'pedar',
    name: 'پدر IR — میان‌سال ایرانی',
    desc: 'A middle-aged Iranian man around fifty, speaking Persian (Farsi) with a calm, deep, fatherly, heroic voice. Weathered and resolute, like a wise father in an Iranian cinema film. Slight rasp, steady pacing, Tehrani accent.',
    text: 'پدر: مگه می‌شه تو این همه بلا یکی زنده بمونه؟ آرش: تا وقتی که ما کنارشایم، هرچی شده، باهم می‌مونیم. پدر: بخدا حق با توئه رفیق.'
  },
  {
    id: 'ravayan',
    name: 'راوی IR — گوینده سینمایی',
    desc: 'A deep cinematic Iranian narrator voice, Persian (Farsi) male in his forties, like an Iranian movie trailer voice-over artist. Gravelly, ominous, epic tone with slow deliberate pacing, Tehrani accent.',
    text: 'یه ویروس، شهر رو بی‌صدا کشت. برج مخابراتی آخرین ستون فقرات منه س. فقط چند نفر موندن که باید تا آخرین شب زنده بمونن.'
  }
];

for (const d of DESIGNS) {
  console.log(`\n=== DESIGN ${d.id} ===`);
  const r = await fetch(`${BASE}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_description: d.desc, text: d.text, loudness: 0.4, quality: 0.9 })
  });
  if (!r.ok) { console.log('FAIL', r.status, (await r.text()).slice(0, 200)); continue; }
  const j = await r.json();
  const previews = j.previews || [];
  console.log(`got ${previews.length} previews`);
  let bestIdx = -1, bestSim = -1, bestVid = null;
  for (let i = 0; i < previews.length; i++) {
    const pv = previews[i];
    const mp3 = `${OUT}/${d.id}_p${i}.mp3`;
    fs.writeFileSync(mp3, Buffer.from(pv.audio_base64, 'base64'));
    const got = await asr(mp3);
    const chinese = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got);
    const ow = new Set(d.text.replace(/[؛،.!؟:...]/g, ' ').split(/\s+/).filter(Boolean));
    const gw = got.replace(/[؛،.!؟:]/g, ' ').split(/\s+/).filter(Boolean);
    const hits = gw.filter(w => ow.has(w)).length;
    const sim = chinese ? 0 : Math.round(hits / Math.max(1, ow.length) * 100);
    console.log(`  p${i} [${pv.generated_voice_id}] sim=${sim}%${chinese ? ' CHINESE!' : ''} «${got.slice(0, 60)}»`);
    if (sim > bestSim) { bestSim = sim; bestIdx = i; bestVid = pv.generated_voice_id; }
  }
  if (bestVid && bestSim >= 50) {
    // افزودن به کتابخانه
    const add = await fetch(`${BASE}/text-to-voice`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_name: d.name, voice_description: d.desc, generated_voice_id: bestVid })
    });
    const aj = await add.text();
    console.log(`ADD ${d.id}: ${add.status} — ${aj.slice(0, 150)}`);
    fs.writeFileSync(`${OUT}/${d.id}_added.json`, JSON.stringify({ vid: bestVid, name: d.name, sim: bestSim, add: aj.slice(0, 300) }, null, 1));
  } else {
    console.log(`skip add (best ${bestSim}%)`);
  }
}
// لیست صداهای من
const me = await fetch(`${BASE}/voices`, { headers: { 'xi-api-key': KEY } });
const mj = await me.json();
console.log('\nMY VOICES:', (mj.voices || []).map(v => `${v.voice_id}|${v.name}`).join('\n  '));
