import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const files = process.argv.slice(2);

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
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
              { type: 'text', text: 'این اسکرین‌شات یک بازی اندرویدی فارسی است. با دقت فوق‌العاده جزئیات را توصیف کن: ۱) آیا متن فارسی غیرعادی/سرریزشدهای گوشه یا وسط صفحه هست؟ دقیقا کجا و چه محتوایی؟ متن را کلمه‌به‌کلمه بخوان. ۲) دکمه‌های گوشه چپ صفحه را توصیف کن (اندازه/ترتیب/هم‌پوشانی/فاصله). ۳) وضعیت پنل‌ها/شیت‌های باز. ۴) هرگونه مشکل UI دیگر (متن بیرون‌زده، بریدگی، اندازه‌های ناهماهنگ). جدا و دقیق پاسخ بده.' },
            ]
          }],
          thinking: { type: 'disabled' },
        });
        console.log(`\n===== ${f} =====`);
        console.log((r.choices?.[0]?.message?.content || '').slice(0, 2500));
        break;
      } catch (e) {
        if (a === 4) console.log(`\n===== ${f} VLM-ERR ${e.message.slice(0, 120)}`);
        else await new Promise(r => setTimeout(r, 8000));
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
main();
