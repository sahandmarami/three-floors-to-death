#!/usr/bin/env node
// build_voices42_data.mjs — ساخت voices42_data.js از mp3های تولیدشده
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const DIR = '/home/z/my-project/tftd/scripts/voice42_out';
const OUT = '/home/z/my-project/tftd/scripts/voices42_data.js';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mp3'));
let out = '/* v42 — کلیپ‌های تازه: شکاف‌های صوتی داستان + خط‌های دستفروش + تیزر Z\n   آرش=Liam · ارشان=Bill · مریم=Jessica · سارا=Matilda · نگهبان=Adam · راوی=Brian · بی‌سیم=George · Z=Callum\n   دستفروش: Chris/Will/Harry/Eric/River */\nconst VOICES42_DATA = {\n';
let n = 0, bytes = 0;
for (const f of files.sort()) {
  const key = f.replace('.mp3', '');
  if (key.endsWith('_raw') || key.endsWith('_cut')) continue;
  const p = path.join(DIR, f);
  const dur = Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100;
  const b64 = fs.readFileSync(p).toString('base64');
  out += `${key}:{d:${dur},a:"data:audio/mpeg;base64,${b64}"},\n`;
  n++; bytes += b64.length;
}
out += '};\n';
fs.writeFileSync(OUT, out);
console.log(`voices42_data.js: ${n} clips, ${(bytes / 1048576).toFixed(1)} MB base64`);
