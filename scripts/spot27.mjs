#!/usr/bin/env node
// spot27.mjs — ممیزی نهایی چند کلیپ تصادفی بعد از FX
import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'sk_1359c0fa2aedced92e946a20b44d8d62521428778df8cc62';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = '/home/z/my-project/scripts/voice27_full';
const checks = [
  ['i3a', 'چقدر دیگه؟ آب تمومه.'],
  ['c4m1', 'پیشنهادت چیه؟'],  // متن واقعی از dialogues خوانده شود
  ['pd1l', '؟'],
  ['e1n', '؟'],
  ['c1w4r', '؟'],
];
// متن واقعی خطوط
const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'/g)) {
  const c = checks.find(x => x[0] === m[1]);
  if (c && c[1] === '؟') c[1] = m[3];
}
function normW(w) {
  return w.replace(/\u200c/g, '').replace(/[؛،.!؟:\-…«»]/g, '').replace(/[آأإ]/g, 'ا').replace(/[یيئ]/g, 'ی').replace(/[ك]/g, 'ک').toLowerCase();
}
(async () => {
  for (const [key, txt] of checks) {
    const p = `${OUT}/${key}.mp3`;
    if (!fs.existsSync(p)) { console.log(`${key}: MISSING`); continue; }
    const fd = new FormData();
    fd.append('file', new Blob([fs.readFileSync(p)], { type: 'audio/mpeg' }), 'a.mp3');
    fd.append('model_id', 'scribe_v1');
    fd.append('language_code', 'fa');
    const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
    if (!r.ok) { console.log(`${key}: scribe ${r.status}`); continue; }
    const j = await r.json();
    const t = (j.text || '').trim();
    const scSet = new Set(t.split(/\s+/).map(normW).filter(Boolean));
    const lw = txt.replace(/[.!؟…]+$/, '').split(/\s+/).map(normW).filter(Boolean);
    const hits = lw.filter(w => scSet.has(w)).length;
    const cov = Math.round(hits / lw.length * 100);
    const dur = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim();
    console.log(`${key} [${j.language_code}] ${cov}% · ${dur}s · «${t.slice(0, 50)}»`);
    await sleep(1500);
  }
})();
