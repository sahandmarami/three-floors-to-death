// asr_el.mjs — بررسی ASR سه کلیپ تست ElevenLabs v3 فارسی
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = [
  ['George', 'سلام سهند، حالت چطوره؟ امیدوارم هنوز زنده باشی.'],
  ['Sarah', 'آرشان، عجله کن! زامبی‌ها دارن میان سمت ساختمان!'],
  ['Roger', 'دکتر مریم گفت پناهگاه جنوبی هنوز سالمه. باید بریم.'],
];

async function main() {
  const zai = await ZAI.create();
  for (const [name, orig] of SAMPLE) {
    const mp3 = `/home/z/my-project/scripts/eltest_${name}.mp3`;
    const wav = `/home/z/my-project/scripts/eltest_${name}.wav`;
    if (!fs.existsSync(mp3)) { console.log(`[${name}] MISSING`); continue; }
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
        console.log(`[${name}] ${sim}%  «${got.slice(0, 100)}»`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${name}] ASR-ERROR ${e.message.slice(0, 60)}`);
        else await sleep(12000);
      }
    }
    await sleep(4000);
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
