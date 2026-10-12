import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHECK = {
  i1n: 'یه ویروس شهر رو بی‌صدا کشت',
  i3a: 'چقدر دیگه آب تمومه',
  w1a: 'آماده‌ست امیدوارم تخته‌ها دوام بیارن',
  w1b: 'در رو نگه دار حواست به پنجره‌ها باشه',
};
async function main() {
  const zai = await ZAI.create();
  for (const k of Object.keys(CHECK)) {
    const p = `/home/z/my-project/scripts/el25_test/v25_${k}.wav`;
    for (let a = 1; a <= 4; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.audio.asr.create({ file_base64: b64 });
        console.log(`[${k}] ASR: ${res.text.slice(0, 90)}  (هدف: ${CHECK[k]})`);
        break;
      } catch (e) {
        if (a === 4) console.log(`[${k}] ERR`);
        else await sleep(8000 * a);
      }
    }
    await sleep(1500);
  }
}
main();
