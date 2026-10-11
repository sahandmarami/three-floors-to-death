// analyze_shots_v214.mjs — VLM analysis of user's 3 new screenshots
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const questions = [
    'این اسکرین‌شات منوی بازی است که کاربر می‌گوید «خیلی بد ریخته». دقیق بگو: ۱) چه چیزهایی زشت یا به‌هم‌ریخته‌اند؟ ۲) کدام دکمه‌ها/متن‌ها ناقص، بریده یا خارج از صفحه‌اند؟ ۳) فاصله‌گذاری، هم‌پوشانی و چیدمان چه ایرادهایی دارد؟ ۴) رنگ/کنتراست ایراد دارد؟',
    'این اسکرین‌شات داخل بازی (گیم‌پلی) است. کاربر می‌گوید «بعضی دکمه‌ها کامل دیده نمی‌شوند». دقیق بگو: ۱) کدام دکمه‌ها/آیکون‌ها بریده یا ناقص‌اند؟ ۲) کدام متن‌ها بیرون از قاب یا روی‌هم‌افتاده‌اند؟ ۳) مشکل از کجاست (لبه‌ی صفحه؟ مقیاس؟ جای عنصر)؟',
    'این اسکرین‌شات سوم بازی است — منو یا صحنه‌ی دیگر. دقیق بگو همه‌ی ایرادهای نمایشی که می‌بینی: دکمه‌های ناقص، متن‌های بریده، به‌هم‌ریختگی چیدمان، مشکلات فاصله و هم‌پوشانی.'
  ];
  for (let i = 1; i <= 3; i++) {
    const b64 = fs.readFileSync(`/home/z/my-project/download/drive_assets2/shot${i}.jpg`).toString('base64');
    const res = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: questions[i-1] }
        ]
      }]
    });
    console.log(`\n===== SHOT ${i} =====\n` + (res.choices[0].message.content || '').slice(0, 2500));
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
