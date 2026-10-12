// asr_retry26.mjs — ممیزی i1n_r2 و بازفحش i2n
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = [
  ['i1n_r2', 'یه ویروس شهر رو بی‌صدا کشت'],
  ['i2n', 'خیابون‌ها خالی موند'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [key, orig] of SAMPLE) {
    const mp3 = `/home/z/my-project/scripts/voice26/${key}.mp3`;
    if (!fs.existsSync(mp3)) { console.log(`[${key}] MISSING`); continue; }
    const wav = `/home/z/my-project/scripts/voice26/${key}_asr.wav`;
    execSync(`ffmpeg -y -v quiet -i ${mp3} -ar 16000 -ac 1 ${wav}`);
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const b64 = fs.readFileSync(wav).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        const got = (res.text || '').trim();
        const ow = orig.replace(/[؛،.!؟...]/g, ' ').split(/\s+/).filter(Boolean);
        const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
        const oSet = new Set(ow);
        const hits = gw.filter(w => oSet.has(w)).length;
        const sim = Math.round(hits / Math.max(1, ow.length) * 100);
        const isCjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(got);
        console.log(`[${key}] ${sim}%${isCjk ? ' ⚠️CJK' : ''}  «${got.slice(0, 90)}»`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${key}] ASR-ERROR ${e.message.slice(0, 60)}`);
        else await sleep(12000);
      }
    }
    await sleep(4000);
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
