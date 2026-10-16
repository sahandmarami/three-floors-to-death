#!/usr/bin/env node
// vlm40.mjs — ممیزی بصری جلسه ۴۰ (منو روشن‌تر / متن پایین / آیکون کوله / قیمت سلاح)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const SH = '/home/z/my-project/scripts/shots40/';
const JOBS = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/shots40/jobs.json', 'utf8'));

const zai = await ZAI.create();
for (const [file, prompt] of JOBS) {
  if (!fs.existsSync(SH + file)) { console.log(`\n===== ${file} MISSING =====`); continue; }
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' کوتاه و دقیق جواب بده.' },
        ]}],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((r.choices?.[0]?.message?.content || '').slice(0, 900));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 100)}`);
      else await new Promise(r2 => setTimeout(r2, 10000));
    }
  }
  await new Promise(r3 => setTimeout(r3, 2500));
}
