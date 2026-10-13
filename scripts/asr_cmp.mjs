import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHECK = {
  a_Harry_up_p: 'آماده‌ست امیدوارم تخته‌ها دوام بیارن',
  n_raw_p: 'یه ویروس شهر رو بی‌صدا کشت',
  p_Bill_p: 'تا جای امن پیدا نکنیم وایسیم نمی‌شه',
};
async function main() {
  const zai = await ZAI.create();
  for (const k of Object.keys(CHECK)) {
    for (let a = 1; a <= 5; a++) {
      try {
        const b64 = fs.readFileSync(`/home/z/my-project/scripts/el25_test/${k}.wav`).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${k}] ${res.text.slice(0, 90)}`);
        break;
      } catch (e) {
        if (a === 5) console.log(`[${k}] ERR`);
        else await sleep(9000 * a);
      }
    }
    await sleep(2000);
  }
}
main();
