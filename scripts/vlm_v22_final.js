// VLM تأیید نهایی v21.1 — منو/فروشگاه/دستفروش
const ZAI = require('z-ai-web-dev-sdk').default;

async function main() {
  const zai = await ZAI.create();
  const shots = [
    ['scripts/shots22/10_menu_new.png', 'این منوی اصلی بازطراحی‌شده‌ی بازی «سه طبقه تا بقا» است (قاب شیشه‌ای وسط + چیپ آمار + پانوشت). از ۱ تا ۱۰ چقدر جذاب است؟ (قبلاً ۷٫۵ بود) سه بهبود مهم دیده‌شده را بگو و اگر ایراد جدی مانده بنویس.'],
    ['scripts/shots22/11_shop_wpn_3guns.png', 'پنل فروشگاه سمت راست، تب «سلاح‌ها»: باید ۳ کاشی تفنگ دیده شود (کلت/شاتگان/مسلسل). آیا ۳ کاشی هست؟ کاشی سوم (مسلسل) کم‌رنگ/قفل به نظر می‌رسد؟ متن‌ها مرتب‌اند؟'],
    ['scripts/shots22/12_tooltip_locked.png', 'تولتیپ تیره کنار پنل: نام طلایی + توضیح + وضعیت قفل با جداکننده. آیا خوانا و مرتب است؟ متن وضعیت قفل را بخوان.'],
    ['scripts/shots22/13_peddler_new.png', 'پنل بنفش «دستفروش مرموز» سمت چپ با ۵ کالا. نام و توضیح هر کالا زیر هم و قیمت قرص طلایی. متن‌ها خوانا و جدا از هم‌اند یا هنوز قاطی‌اند؟ یکی دو نام کالا را بخوان.'],
  ];
  for (const [f, q] of shots) {
    const fs = require('fs');
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
        { type: 'text', text: q },
      ]}],
      max_tokens: 420,
    });
    console.log('=== ' + f + ' ===');
    console.log(r.choices[0].message.content.trim());
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
