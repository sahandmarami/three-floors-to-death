#!/usr/bin/env node
// patch voices30_data.js: swap aw4 to fresh retry audio
import fs from 'fs';
import { execSync } from 'child_process';
const DATA = '/home/z/my-project/scripts/voices30_data.js';
const MP3 = '/home/z/my-project/scripts/voice30/aw4.mp3';
let js = fs.readFileSync(DATA, 'utf8');
const dur = Math.round(parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${MP3}`).toString().trim()) * 100) / 100;
const b64 = fs.readFileSync(MP3).toString('base64');
const re = /aw4:\{d:[\d.]+,a:"data:audio\/mpeg;base64,[^"]+"\}/;
if (!re.test(js)) { console.log('aw4 entry not found!'); process.exit(1); }
js = js.replace(re, `aw4:{d:${dur},a:"data:audio/mpeg;base64,${b64}"}`);
fs.writeFileSync(DATA, js);
console.log('aw4 patched, dur', dur, 'file', (fs.statSync(DATA).size / 1048576).toFixed(1) + 'MB');
