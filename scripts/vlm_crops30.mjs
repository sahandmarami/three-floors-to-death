import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const files = process.argv.slice(2);
const PROMPT = 'این بخشی از اسکرین‌شات بازی است (زوم‌شده). هر متن فارسی قابل مشاهده را کلمه‌به‌کلمه و دقیق بنویس، با موقعیتش. مخصوصا متن‌هایی که روی هم افتاده/سرریز شده/گنجیده نشده‌اند. فقط متن‌ها را فهرست کن.';

async function main() {
  const zai = await ZAI.create();
  for (const f of files) {
    const b64 = fs.readFileSync(f).toString('base64');
    for (let a = 1; a <= 4; a++) {
      try {
        const r = await zai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
              { type: 'text', text: PROMPT },
            ]
          }],
          thinking: { type: 'disabled' },
        });
        console.log(`\n===== ${f} =====`);
        console.log((r.choices?.[0]?.message?.content || '').slice(0, 1800));
        break;
      } catch (e) {
        if (a === 4) console.log(`\n===== ${f} VLM-ERR ${e.message.slice(0, 120)}`);
        else await new Promise(r => setTimeout(r, 8000));
      }
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}
main();
