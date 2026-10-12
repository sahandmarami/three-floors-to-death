// asr_v24b.mjs — quality gate: ASR-verify 8 clips (one per character group)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = [
  ['i1n', 'n', 'یه ویروس، شهر رو بی‌صدا کشت.'],
  ['i3a', 'a', 'چقدر دیگه؟ آب تمومه.'],
  ['i4p', 'p', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'],
  ['c4m1', 'm', 'پیام برج مخابراتی رو گرفتید؟'],
  ['c4vr', 'r', 'هشدار! حرکت گسترده در دره شمالی. همه به مواضع دفاعی!'],
  ['fbd1', 'b', 'در... باز... نکن!'],
  ['pd1a', 'd', 'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟'],
  ['e3p', 'p', 'نمی‌دونم. ولی تسلیم نمی‌شیم.'],
];

async function main() {
  const zai = await ZAI.create();
  let pass = 0, total = 0;
  for (const [key, who, orig] of SAMPLE) {
    const mp3 = `/home/z/my-project/scripts/voice24/${key}.mp3`;
    const wav = `/home/z/my-project/scripts/voice24/${key}_asr.wav`;
    if (!fs.existsSync(mp3)) { console.log(`[${key}] MISSING`); continue; }
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
        total++;
        if (sim >= 70) pass++;
        console.log(`[${key}/${who}] ${sim}%  «${got.slice(0, 80)}»`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${key}/${who}] ASR-ERROR ${e.message.slice(0, 60)}`);
        else await sleep(12000);
      }
    }
    await sleep(4000);
  }
  console.log(`\nGATE: ${pass}/${total} clips >= 70% word similarity`);
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
