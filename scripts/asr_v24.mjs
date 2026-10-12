// asr_v24.mjs — تست کیفیت صدای فارسی edge-tts
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  for (const f of ['t_farid.mp3', 't_dilara.mp3']) {
    const b64 = fs.readFileSync('/home/z/my-project/scripts/voice24_test/' + f).toString('base64');
    const res = await zai.audio.asr({ file: b64, filename: f });
    console.log(`[${f}]`, (typeof res === 'string' ? res : JSON.stringify(res)).slice(0, 300));
  }
}
main().catch(e => console.log('ERR', e.message));
