// asr_el25.mjs — ASR تست‌های ElevenLabs کلید جدید
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const DIR = '/home/z/my-project/scripts/el25_test';
const TARGET = {
  v2_fa_brian:   'یه ویروس شهر رو بی‌صدا کشت',
  v3_fa_brian:   'یه ویروس شهر رو بی‌صدا کشت',
  v3_fing_brian: 'یه ویروس شهر رو بی‌صدا کشت',
  v3_fing_sad:   'یه ویروس شهر رو بی‌صدا کشت',
  v2_fing_brian: 'یه ویروس شهر رو بی‌صدا کشت',
  v2_fa_daniel:  'یه ویروس شهر رو بی‌صدا کشت',
  v3_fing_daniel:'یه ویروس شهر رو بی‌صدا کشت',
  v2_fa_matilda: 'اینجا هنوز امنه ولی دیوارها آسیب دیدن',
  v3_fing_liam:  'صداش رو شنیدی نزدیکه',
  v3_fing_harry: 'من نگهبان آم رو برو کن', // hmm
};

async function main() {
  const zai = await ZAI.create();
  for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.wav'))) {
    const name = f.replace('.wav', '');
    try {
      const b64 = fs.readFileSync(`${DIR}/${f}`).toString('base64');
      const res = await zai.audio.asr.create({ file_base64: b64 });
      const txt = (res.text || JSON.stringify(res)).trim();
      console.log(`\n[${name}]\n  ASR: ${txt.slice(0, 220)}`);
    } catch (e) {
      console.log(`[${name}] ERR ${e.message.slice(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }
}
main();
