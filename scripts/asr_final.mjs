// asr_final.mjs — quality gate: ASR-verify 9 sampled new clips (one per character group)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = [
  ['i1n1', 'n', 'همه‌چیز از یه ویروس شروع شد؛ از حومه‌ی شهر، بی‌خبر و بی‌صدا، اومد وسطِ مون.'],
  ['i3a1', 'a', 'چه قدر ساکت شده... انگار کلِ این شهر مالِ خودمون شده.'],
  ['i4p1', 'p', 'شاید فقط خودمون موندیم، نمی‌دونم... ولی تا این برج سرپاست، ما هم سرپاییم.'],
  ['sh9r', 'r', 'تمامِ واحدها گوش کنید! گله‌ی بزرگ از دره‌ی شمالی به سمتِ پناهگاه شما حرکت کرده... زمان ندارید!'],
  ['fb1b1', 'b', 'پشتِ در بمان!'],
  ['pd1a', 'd', 'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟'],
  ['sh3m', 'm', 'خوش اومدید... ما شما رو از دیده‌بان دیدیم. شب‌ها زنده موندن کارِ هر کسی نیست.'],
  ['tbc1n', 'n', 'این داستان ادامه دارد...'],
  ['fbz1', 'a', 'مواظب باش! داره شارژ می‌کنه! بزن بهش!'],
];

async function main() {
  const zai = await ZAI.create();
  let pass = 0, total = 0;
  for (const [key, who, orig] of SAMPLE) {
    const mp3 = `/home/z/my-project/scripts/voice21/${key}.mp3`;
    const wav = `/home/z/my-project/scripts/voice21/${key}_asr.wav`;
    if (!fs.existsSync(mp3)) { console.log(`[${key}] MISSING`); continue; }
    execSync(`ffmpeg -y -v quiet -i ${mp3} -ar 16000 -ac 1 ${wav}`);
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const b64 = fs.readFileSync(wav).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        const got = (res.text || '').trim();
        // word-level similarity
        const ow = orig.replace(/[؛،.!؟...]/g, ' ').split(/\s+/).filter(Boolean);
        const gw = got.replace(/[؛،.!؟]/g, ' ').split(/\s+/).filter(Boolean);
        const oSet = new Set(ow);
        const hits = gw.filter(w => oSet.has(w)).length;
        const sim = Math.round(hits / Math.max(1, ow.length) * 100);
        total++;
        if (sim >= 70) pass++;
        console.log(`[${key}/${who}] ${sim}%  «${got.slice(0, 90)}»`);
        break;
      } catch (e) {
        if (attempt === 5) console.log(`[${key}/${who}] ASR-ERROR`);
        else await sleep(12000);
      }
    }
    await sleep(5000);
  }
  console.log(`\nGATE: ${pass}/${total} clips >= 70% word similarity`);
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
