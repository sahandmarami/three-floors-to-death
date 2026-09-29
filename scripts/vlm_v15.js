// تحلیل بصری VLM نسخه‌ی ۱۵ — تأیید رفع ۸ ایراد گزارش‌شده توسط کاربر
const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');

async function ask(zai, p, prompt) {
  const b64 = fs.readFileSync('/home/z/my-project/' + p).toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  return ((res.choices && res.choices[0].message.content) || '').trim();
}

async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots15/00_menu.png',
     'منوی اصلی بازی فارسی. آیا: ۱) منو تمیز است (عنوان طلایی + ۲ دکمه‌ی بزرگ + ۳ دکمه‌ی کوچک)؟ ۲) در پایین منو هیچ متن «نسخه...» وجود ندارد؟ ۳) پس‌زمینه آرام است؟ با بله/خیر + یک جمله.'],
    ['scripts/shots15/02_day_bottomright.png',
     'صفحه‌ی روز بازی در نمای موبایل (برج سه‌طبقه وسط صفحه است). آیا: ۱) دکمه‌ی زرد «🌙 شب شود» در پایینِ سمتِ راست صفحه است و روی بدنه‌ی برج نمی‌نشیند؟ ۲) متنی روی متن دیگر یا روی برج افتاده؟ با بله/خیر + توضیح کوتاه.'],
    ['scripts/shots15/04_peddler_shop.png',
     'صفحه‌ی روز بازی با پنل فروش «دستفروش مرموز» (بنفش، سمت چپ‌بالا) و ستون دکمه‌های کنترل در لبه‌ی چپِ وسط صفحه. آیا: ۱) پنل دستفروش بالاتر از وسط صفحه است؟ ۲) گوشه یا بدنه‌ی پنل روی دکمه‌های ستون چپ (توقف/صدا/چراغ) افتاده؟ با بله/خیر + یک جمله.'],
    ['scripts/shots15/05_defeat_cine.png',
     'کات‌سین سقوط برج در بازی. آیا: ۱) برج در حال فروریختن دیده می‌شود (طبقه‌ها مایل/آوار)؟ ۲) نوارهای سینمایی سیاه بالا/پایین هستند و زیرنویس خواناست؟ ۳) دکمه‌ی «رد کردن» در گوشه دیده می‌شود؟ با بله/خیر + یک جمله.'],
    ['scripts/shots15/06_gameover.png',
     'صفحه‌ی «باخت» بازی. آیا: ۱) صفحه ساده و تمیز است (یک عنوان، یک خط زیرنویس، یک خط آمار، فقط ۲ دکمه)؟ ۲) دکمه‌ها «تلاش دوباره» و «منوی اصلی» هستند؟ ۳) صفحه شلوغ و پر از آمار طولانی است؟ با بله/خیر + یک جمله.'],
    ['scripts/shots15/07_night.png',
     'شبِ بازی با زامبی‌ها و برج. آیا: ۱) ستون دکمه‌های چپ (توقف/صدا/چراغ) آزاد و قابل کلیک است؟ ۲) پنل ساخت‌وساز جمع شده و صحنه‌ی شلیک آزاد است؟ با بله/خیر + یک جمله.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 700)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
