import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHECK = {
  f3_brian_sad: 'یه ویروس شهر رو بی‌صدا کشت (آهسته/غمگین)',
  f3_brian_norm: 'تا جای امن پیدا نکنیم وایسیم نمی‌شه',
  f3_harry_ang: 'من نگهبانم رو بکن (خشمگین)',
  f3_liam_urg: 'صداش رو شنیدی نزدیکه (فوری)',
  f3_mati_calm: 'اینجا هنوز امنه ولی دیوارها آسیب دیدند (آرام)',
};
async function main() {
  const zai = await ZAI.create();
  for (const k of Object.keys(CHECK)) {
    for (let a = 1; a <= 5; a++) {
      try {
        const b64 = fs.readFileSync(`/home/z/my-project/scripts/el25_test/${k}.wav`).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${k}] ${res.text.slice(0, 100)}`);
        break;
      } catch (e) {
        if (a === 5) console.log(`[${k}] ERR`);
        else await sleep(10000 * a);
      }
    }
    await sleep(2500);
  }
}
main();
