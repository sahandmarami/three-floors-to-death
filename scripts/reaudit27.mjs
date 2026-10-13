#!/usr/bin/env node
// reaudit27.mjs — ممیزی مجدد آهسته فایل‌های تست
import fs from 'fs';
import { execSync } from 'child_process';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ZAI = (await import('z-ai-web-dev-sdk')).default;
const zai = await ZAI.create();

const targets = [
  ['m2_v2_short', 'یه ویروس، شهر رو بی\u200cصدا کشت.'],
  ['m2_v4_40ch', 'یه ویروس، شهر رو بی\u200cصدا کشت. باید بمونیم.'],
  ['m2_v2_20ch', 'چقدر دیگه؟ آب تمومه.'],
  ['m2_v2_28b', 'یه ویروس، شهر رو بی\u200cصدا کشت.'],
];
for (const [f, txt] of targets) {
  const p = `/home/z/my-project/scripts/voice27_test/${f}.mp3`;
  if (!fs.existsSync(p)) { console.log(`${f}: MISSING`); continue; }
  for (let i = 0; i < 8; i++) {
    try {
      const b64 = fs.readFileSync(p.replace('.mp3', '.wav')).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      const got = (res.text || '').trim();
      const cjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got);
      console.log(`${f}: ${cjk ? '❌ چینی' : got ? '✓ فارسی' : '؟ خالی'} «${got.slice(0, 45)}»`);
      break;
    } catch (e) { await sleep(20000); }
  }
  await sleep(8000);
}
