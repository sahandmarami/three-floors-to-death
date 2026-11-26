#!/usr/bin/env node
// build_voices44_data.mjs — بسته‌بندی کلیپ‌های v44 در قالب VOICES23
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DIR = '/home/z/my-project/work/three-floors-to-death/scripts/voice44_out';
const OUT = '/home/z/my-project/work/three-floors-to-death/scripts/voices44_data.js';

const keys = fs.readdirSync(DIR).filter(f => f.endsWith('.mp3') && !f.includes('_raw') && !f.includes('_cut'));
let js = '/* v44 — کلیپ‌های صوتی جدید (ElevenLabs، رایگان‌تیر) */\nconst VOICES44_DATA = {\n';
let n = 0;
for (const f of keys.sort()) {
  const k = f.replace('.mp3', '');
  const p = path.join(DIR, f);
  const dur = Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100;
  const b64 = fs.readFileSync(p).toString('base64');
  js += `${k}:{d:${dur},a:"data:audio/mpeg;base64,${b64}"},\n`;
  n++;
}
js += '};\ntry { Object.assign(VOICES23, VOICES44_DATA); } catch (e) {}\n';
fs.writeFileSync(OUT, js);
console.log('voices44_data.js:', n, 'clips,', (js.length / 1048576).toFixed(2), 'MB');
