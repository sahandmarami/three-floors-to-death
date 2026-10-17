#!/usr/bin/env node
// gen_voices40extra.mjs — ۵ کلیپ تکمیلی با صدای Bill (ارشان) برای v40
// tb1s/tb2s/tb3s (خط فرمان مینی‌گیم‌ها) + fbw2 (باس) + aw4 (متن v39: خاموش می‌شه)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const KEY = 'sk_81cff11664ee620900497f86c329db8d4a7d0757f3f75aeb';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT_DIR = '/home/z/my-project/scripts/voice30_full';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VOICES = { a: 'pqHfZKP75CvOlQylNhV4' };  // Bill — ارشان
const FX = {
  a: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  au: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
};
const LINES = [
  { key: 'tb1s', who: 'a', fa: 'فرمان با توئه! گاز بده!', mood: null },
  { key: 'tb2s', who: 'a', fa: 'فرمان قایق با توئه! گاز بده!', mood: null },
  { key: 'tb3s', who: 'a', fa: 'گاز بده! از برف رد شو!', mood: null },
  { key: 'fbw2', who: 'a', fa: 'نگهبان آخرین شب میاد!', mood: 'urgent' },
  { key: 'aw4',  who: 'a', fa: 'چراغ‌قوه‌ت داره خاموش می‌شه!', mood: 'urgent' },
];
const TAILS = ['دیگه وقت نیست.', 'چیزی که مهمه زنده موندنه.', 'فردا قراره چی بشه هیچ‌کس نمی‌دونه.', 'باید تا آخرین لحظه ایستادگی کنیم.'];
const MOODS = { urgent: { stability: 0.65, style: 0.15 } };
const SETTINGS = { a: { stability: 0.50, style: 0.35 } };

async function scribe(buf) {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'a.mp3');
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'fa');
  const r = await fetch(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
  if (!r.ok) return null;
  const j = await r.json();
  return { lang: j.language_code, text: (j.text || '').trim(), words: (j.words || []).filter(w => w.type === 'word') };
}
function normW(w) {
  return w.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '')
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
  for (let i = sc.words.length - 1; i >= Math.max(0, sc.words.length - tailLen - 3); i--) {
    if (normW(sc.words[i].text) === tailFirst) { cut = Math.max(0.5, sc.words[i].start - 0.07); break; }
  }
  if (cut == null) cut = dur * 0.6;
  cut = Math.min(cut, dur - 0.2);
  execSync(`ffmpeg -y -v quiet -i ${rawMp3} -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0, cut - 0.08).toFixed(3)}:d=0.08" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
}

for (const L of LINES) {
  const outMp3 = path.join(OUT_DIR, L.key + '.mp3');
  if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 6000) { console.log(`${L.key}: cached`); continue; }
  const vs = { ...SETTINGS[L.who], ...(L.mood ? MOODS[L.mood] : {}) };
  let ok = false;
  for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
    const tail = TAILS[(attempt) % TAILS.length];
    let t = L.fa.trim(); if (!/[.!؟…]$/.test(t)) t += '.';
    const padded = t.length >= 52 ? t : t + ' ' + tail;
    const body = { text: padded, model_id: 'eleven_v4', language_code: 'fa', seed: Math.floor(Math.random() * 2000000), voice_settings: { stability: vs.stability, similarity_boost: 0.75, style: vs.style, use_speaker_boost: true } };
    const r = await fetch(`${BASE}/text-to-speech/${VOICES[L.who]}?output_format=mp3_22050_32`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body),
    });
    if (!r.ok) { console.log(`${L.key}: TTS ${r.status}`); await sleep(2500); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const raw = path.join(OUT_DIR, L.key + '_raw.mp3');
    fs.writeFileSync(raw, buf);
    const sc = await scribe(buf);
    if (!sc || !/^(fas|fa|pes)/.test(sc.lang || '')) { console.log(`${L.key}: lang=${sc && sc.lang} ❌`); fs.unlinkSync(raw); continue; }
    const lineWords = t.replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const scSet = new Set(sc.words.map(w => normW(w.text)));
    const cov = Math.round(lineWords.filter(w => scSet.has(w)).length / lineWords.length * 100);
    if (cov < 60) { console.log(`${L.key}: cov=${cov}% ❌`); fs.unlinkSync(raw); continue; }
    const cutMp3 = path.join(OUT_DIR, L.key + '_cut.mp3');
    if (padded !== t) cutByWords(raw, sc, tail, cutMp3); else fs.copyFileSync(raw, cutMp3);
    const pre = path.join(OUT_DIR, L.key + '_pre.mp3');
    fs.copyFileSync(cutMp3, pre);
    execSync(`ffmpeg -y -v quiet -i ${pre} -filter_complex "${FX[L.mood ? 'au' : 'a']}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
    fs.unlinkSync(pre); fs.unlinkSync(cutMp3); fs.unlinkSync(raw);
    console.log(`${L.key}: cov=${cov}% ✓ ${durOf(outMp3)}s`);
    ok = true;
  }
}
console.log('done');
