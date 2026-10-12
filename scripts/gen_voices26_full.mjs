#!/usr/bin/env node
// ================================================================
// gen_voices26_full.mjs — بازتولید کامل صداهای ElevenLabs فارسی
// ----------------------------------------------------------------
// اجرا بعد از ریست سهمیه (۱۱ نوامبر ۲۰۲۶) یا بعد از افزودن $5 اعتبار:
//   node scripts/gen_voices26_full.mjs free     → صداهای پیش‌فرض رایگان
//   node scripts/gen_voices26_full.mjs native   → صداهای بومی فارسی (نیاز به $5)
//
// روش (اثبات‌شده در جلسه ۱۲ اکتبر):
//   eleven_v4 + language_code:'fa' → ~۴۰-۶۰٪ موفقیت در هر تلاش
//   → retry با seed های متفاوت + ممیزی ASR (آستانه ۶۵٪)
//   → fallback خودکار به کلیپ edge-tts موجود
// خروجی: scripts/voice26_full/*.mp3 + scripts/voices26_data.js
// ================================================================
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const KEY = process.env.EL_KEY || 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const MODE = process.argv[2] || 'free'; // free | native
const OUT_DIR = '/home/z/my-project/scripts/voice26_full';
const DATA_JS = '/home/z/my-project/scripts/voices26_data.js';
const MAX_ATTEMPTS = 4;
const ASR_GATE = 65;

// صداهای پیش‌فرض رایگان (اثبات‌شده: Liam/Brian/Daniel گاهی فارسی)
const FREE_VOICES = {
  p: 'nPczCjzI2devNBz1zQrb', // Brian — سهند
  a: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — آرشان (تست ۱۰۰٪)
  m: 'Xb7hH8MSUJpSbSDYk0k2', // Alice — مریم
  n: 'onwK4e9ZLuTAKqWW03F9', // Daniel — راوی
  r: 'SAz9YHcvj6GT2YYXdXww', // River — بی‌سیم
  b: 'N2lVS1w4EtoT3dr4eOWO', // Callum — نگهبان
  d: 'CwhRBWXzGAHq8TQ4Fs17', // Roger — دستفروش
};
// صداهای بومی فارسی کتابخانه (نیاز به $5 اعتبار — خودشان فارسی بلدند)
const NATIVE_VOICES = {
  p: 'XzieuK0bwYWT9Kl1LhLs', // Hooman — Dry Isfahani Friend
  a: 'xKk80LgyXTAl6McCiFke', // Kaveh — Cheerful Kermani
  m: '8Ebkg5uUcbSbeqGucAoR', // Setareh — Expressive Tehrani
  n: 'ndcUYGFbbd96WXiZVVaQ', // Roya — Warm Tehrani Narrator
  r: 'VKDkQOjcRZb7aNtJGaWt', // Kourosh — Confident Mashhadi
  b: 'GSj19hKjOQsPFCZlq1le', // Farideh — با FX بم/هیولایی
  d: 'N7wuKHXQQ5fKd75noieq', // Niloofar — Curious Tehrani
};
const VOICES = MODE === 'native' ? NATIVE_VOICES : FREE_VOICES;

// FX پس‌پردازش per character (از v24)
const FX = {
  p: 'lowshelf=f=210:g=2.5,acompressor=threshold=0.32:ratio=3:attack=12:release=140,loudnorm=I=-17:TP=-1.5',
  a: 'highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5',
  m: 'acompressor=threshold=0.30:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
  n: 'aecho=0.6:0.24:60|110:0.16|0.09,lowshelf=f=180:g=2,acompressor=threshold=0.30:ratio=3.2:attack=14:release=160,loudnorm=I=-17.5:TP=-1.5',
  r: 'highpass=f=380,lowpass=f=2900,volume=2.1,acompressor=threshold=0.28:ratio=8:attack=5:release=55,loudnorm=I=-15.5:TP=-1.0',
  b: 'asetrate=24000*0.82,aresample=24000,atempo=1.18,volume=1.35,acompressor=threshold=0.26:ratio=9:attack=4:release=40,loudnorm=I=-16:TP=-1.0',
  d: 'lowshelf=f=260:g=1.5,volume=1.1,acompressor=threshold=0.32:ratio=2.6:attack=10:release=130,loudnorm=I=-17:TP=-1.5',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ttsOnce(voiceId, text, seed) {
  const body = {
    text, model_id: 'eleven_v4', language_code: 'fa',
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true }
  };
  if (seed != null) body.seed = seed;
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) return Buffer.from(await r.arrayBuffer());
  const err = await r.text();
  console.log(`    TTS fail ${r.status}: ${err.slice(0, 100)}`);
  if (r.status === 401 || r.status === 402) throw new Error('QUOTA_OR_PLAN:' + r.status);
  return null;
}

async function asrCheck(mp3Path, origText, zai) {
  const wav = mp3Path.replace('.mp3', '_asr.wav');
  execSync(`ffmpeg -y -v quiet -i ${mp3Path} -ar 16000 -ac 1 ${wav}`);
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const b64 = fs.readFileSync(wav).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      const got = (res.text || '').trim();
      if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got)) return { pass: false, got, sim: 0 };
      const ow = origText.replace(/[؛،.!؟...]/g, ' ').split(/\s+/).filter(Boolean);
      const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
      const oSet = new Set(ow);
      const hits = gw.filter(w => oSet.has(w)).length;
      const sim = Math.round(hits / Math.max(1, ow.length) * 100);
      return { pass: sim >= ASR_GATE, got, sim };
    } catch (e) {
      if (attempt === 5) return { pass: false, got: 'ASR-ERROR', sim: 0 };
      await sleep(12000);
    }
  }
}

function durOf(p) {
  try {
    return Math.round(parseFloat(execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${p}`).toString().trim()) * 100) / 100;
  } catch { return 2.0; }
}

async function main() {
  // خطوط از dialogues23.py
  const py = fs.readFileSync('/home/z/my-project/scripts/dialogues23.py', 'utf8');
  const lines = [];
  for (const m of py.matchAll(/\('([a-z0-9]+)',\s*'([pamnrbd])',\s*'([^']+)',\s*'([^']+)'\)/g)) {
    lines.push({ key: m[1], who: m[2], fa: m[3] });
  }
  console.log(`MODE=${MODE} · ${lines.length} lines`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();

  const results = {}; // key -> {ok, from}
  let stopAll = false;

  for (const { key, who, fa } of lines) {
    const outMp3 = path.join(OUT_DIR, key + '.mp3');
    if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 8000) {
      results[key] = { ok: true, from: 'cached' };
      continue;
    }
    if (stopAll) { results[key] = { ok: false, from: 'quota-stop' }; continue; }

    const voiceId = VOICES[who];
    let passBuf = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const seed = 3 + attempt * 11 + (fa.length % 7);
      const buf = await ttsOnce(voiceId, fa, seed).catch(e => { if (String(e.message).startsWith('QUOTA_OR_PLAN')) stopAll = true; return null; });
      if (stopAll) break;
      if (!buf) continue;
      const raw = path.join(OUT_DIR, key + '_raw.mp3');
      fs.writeFileSync(raw, buf);
      const chk = await asrCheck(raw, fa, zai);
      console.log(`  [${key}/${who}] attempt${attempt}: ${chk.sim}% ${chk.pass ? 'PASS' : 'fail'} «${(chk.got || '').slice(0, 50)}»`);
      if (chk.pass) { passBuf = buf; fs.unlinkSync(raw); break; }
      await sleep(3000);
    }
    if (passBuf) {
      // پس‌پردازش FX + ذخیره
      fs.writeFileSync(path.join(OUT_DIR, key + '_pre.mp3'), passBuf);
      execSync(`ffmpeg -y -v quiet -i ${OUT_DIR}/${key}_pre.mp3 -filter_complex "${FX[who] || FX.p}" -ar 24000 -ac 1 -b:a 32k ${outMp3}`);
      fs.unlinkSync(path.join(OUT_DIR, key + '_pre.mp3'));
      results[key] = { ok: true, from: 'elevenlabs' };
    } else {
      results[key] = { ok: false, from: 'edge-tts-fallback' };
    }
    await sleep(2000);
  }

  // ساخت voices26_data.js — هر خط: ElevenLabs در صورت موفقیت، وگرنه edge-tts موجود
  const old = fs.readFileSync('/home/z/my-project/scripts/voices24_data.js', 'utf8');
  const getOld = k => {
    const m = old.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\{d:([\\d.]+),a:"(data:audio\\/mpeg;base64,[^"]+)"'));
    return m ? { d: m[1], a: m[2] } : null;
  };
  let js = `/* v26 — صداهای ElevenLabs فارسی (mode=${MODE}) + fallback edge-tts بومی
     تولید: gen_voices26_full.mjs — ممیزی ASR آستانه ${ASR_GATE}٪
     ${new Date().toISOString()} */\nconst VOICES23 = {\n`;
  let nEl = 0, nEdge = 0;
  for (const { key } of lines) {
    const r = results[key];
    const elMp3 = path.join(OUT_DIR, key + '.mp3');
    if (r && r.ok && fs.existsSync(elMp3) && fs.statSync(elMp3).size > 4000) {
      const b64 = fs.readFileSync(elMp3).toString('base64');
      js += `${key}:{d:${durOf(elMp3)},a:"data:audio/mpeg;base64,${b64}"},\n`;
      nEl++;
    } else {
      const o = getOld(key);
      if (o) { js += `${key}:{d:${o.d},a:"${o.a}"},\n`; nEdge++; }
    }
  }
  js += '};\n';
  fs.writeFileSync(DATA_JS, js);
  const report = { mode: MODE, elevenlabs: nEl, edgeFallback: nEdge, stopped: stopAll };
  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\nDONE:', JSON.stringify(report));
  console.log('→', DATA_JS, `(${(fs.statSync(DATA_JS).size / 1048576).toFixed(1)}MB)`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
