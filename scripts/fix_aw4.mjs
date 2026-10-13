#!/usr/bin/env node
// fix_aw4.mjs — تولید خط aw4 با قاعده‌ی پذیرش درست (بطری≈باتری)
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
const BASE = 'https://api.elevenlabs.io/v1';
const OUT = '/home/z/my-project/scripts/voice27_full';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FA = 'باتری چراغ\u200cقوه تموم می\u200cشه!';
const VID = 'TX3LPaxmHKxFdv7VOQHJ'; // Liam — آرش
const TAILS = ['فردا قراره چی بشه رو هیچ‌کس نمی‌دونه', 'باید تا آخرین لحظه ایستادگی کنیم و بس', 'این تازه اول ماجراست رفیق من', 'چیزی که الان مهمه اینه که زنده بمونیم'];
const FXA = 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5';

async function scribe(p) {
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(p)], { type: 'audio/mpeg' }), 'a.mp3');
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', 'fa');
  const r = await fetch(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
  if (!r.ok) { console.log('scribe', r.status); return null; }
  const j = await r.json();
  return { lang: j.language_code, text: (j.text || '').trim(), words: (j.words || []).filter(w => w.type === 'word') };
}
function normW(w) {
  return w.replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '').replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک').toLowerCase();
}

(async () => {
  for (let att = 1; att <= 5; att++) {
    const tail = TAILS[att % 4];
    const padded = FA + ' ' + tail;
    const body = { text: padded, model_id: 'eleven_v4', language_code: 'fa', seed: Math.floor(Math.random() * 2000000), voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true } };
    const r = await fetch(`${BASE}/text-to-speech/${VID}?output_format=mp3_22050_32`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, body: JSON.stringify(body) });
    if (!r.ok) { console.log('tts', r.status); continue; }
    const raw = `${OUT}/aw4_raw.mp3`;
    fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    const sc = await scribe(raw);
    if (!sc || !/^(fas|fa|pes)/.test(sc.lang || '')) { console.log(`att${att}: lang=${sc && sc.lang} ❌`); continue; }
    // پذیرش با جایگزینی بطری=باتری
    const scTxt = sc.text.replace(/بطری/g, 'باتری');
    const scSet = new Set(scTxt.split(/\s+/).map(normW).filter(Boolean));
    const lineWords = FA.replace(/[!]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const hits = lineWords.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / lineWords.length * 100);
    console.log(`att${att}: cov=${cov}% «${sc.text.slice(0, 50)}»`);
    if (cov < 75) continue;
    // برش کلمه‌ای
    const tailFirst = normW(tail.split(' ')[0]);
    const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${raw}`).toString().trim());
    let cut = null;
    for (let i = Math.max(0, sc.words.length - 10); i < sc.words.length; i++) {
      if (normW(sc.words[i].text) === tailFirst) { cut = Math.max(0.5, sc.words[i].start - 0.07); break; }
    }
    if (cut == null) cut = dur * 0.45;
    execSync(`ffmpeg -y -v quiet -i ${raw} -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0, cut - 0.08).toFixed(3)}:d=0.08" -ar 24000 -ac 1 -b:a 32k ${OUT}/aw4_cut.mp3`);
    execSync(`ffmpeg -y -v quiet -i ${OUT}/aw4_cut.mp3 -filter_complex "${FXA}" -ar 24000 -ac 1 -b:a 32k ${OUT}/aw4.mp3`);
    fs.unlinkSync(raw); fs.unlinkSync(`${OUT}/aw4_cut.mp3`);
    console.log('✓ aw4 FIXED');
    return;
  }
  console.log('aw4 → edge-tts fallback می‌ماند');
})();
