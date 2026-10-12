// asr_v26c.mjs — ممیزی STS خروجی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const zai = await ZAI.create();
  const orig = 'یه ویروس، شهر رو بی‌صدا کشت.'; // i1n متن اصلی
  const mp3 = '/home/z/my-project/scripts/sts_brian.mp3';
  const wav = '/home/z/my-project/scripts/sts_brian_asr.wav';
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
      console.log(`[sts_brian] ${sim}%  «${got.slice(0, 90)}»`);
      break;
    } catch (e) {
      if (attempt === 5) console.log(`[sts_brian] ASR-ERROR ${e.message.slice(0, 60)}`);
      else await sleep(12000);
    }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
