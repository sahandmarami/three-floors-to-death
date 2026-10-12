// asr_v26b.mjs — ممیزی ASR تست‌های language_code و صداهای مختلف
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = [
  ['tv4_liam_lc', 'آرش، حواست باشه! زامبيا از همه طرف ميخوان.'],
  ['tv4_roger_lc', 'خب رفيق، خريدم تو رو کامل کردم.'],
  ['tv4_daniel', 'آرش، حوات باشه! زامبيا از همه طرف ميخوان.'],
  ['tv4_matilda', 'خب رفيق، خريدم تو رو کامل کردم.'],
  ['tv4_adam', 'آرش، حوات باشه! زامبيا از همه طرف ميخوان.'],
  ['tv4_brian2', 'خب رفيق، خريدم تو رو کامل کردم.'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [key, orig] of SAMPLE) {
    const mp3 = `/home/z/my-project/scripts/${key}.mp3`;
    if (!fs.existsSync(mp3)) { console.log(`[${key}] MISSING`); continue; }
    const wav = `/home/z/my-project/scripts/${key}_asr.wav`;
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
        console.log(`[${key}] ${sim}%  «${got.slice(0, 90)}»`);
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
