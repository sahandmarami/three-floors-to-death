// تحلیل بصری VLM نسخه‌ی ۱۴ — تأیید رفع ۹ مشکل گزارش‌شده توسط کاربر
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
    ['scripts/shots14/00_menu.png',
     'منوی اصلی بازی فارسی. آیا: ۱) منو تمیز است (عنوان طلایی + ۲ دکمه‌ی بزرگ + ۳ دکمه‌ی کوچک + خط «نسخه ۱۴»، بدون متن/شعار اضافه)؟ ۲) پس‌زمینه آرام است (حداکثر ۲ زامبی، پرده‌ی تیره)؟ با بله/خیر + یک جمله.'],
    ['scripts/shots14/02_day_bottom.png',
     'صفحه‌ی روز در بازی (نمای باریک موبایل). آیا: ۱) دکمه‌ی زرد «🌙 شب شود» در پایینِ وسط صفحه است؟ ۲) متن اعلان بالای صفحه روی دکمه یا متن دیگری افتاده؟ ۳) متنی روی متن دیگر هست؟ با بله/خیر + توضیح کوتاه.'],
    ['scripts/shots14/04_peddler_dlg.png',
     'صحنه‌ی روز بازی با یک شخصیت مرموز (شنل تیره، فانوس) کنار پایینِ برج و جعبه‌ی گفتگو پایین صفحه. آیا: ۱) شخصیت دستفروش با فانوس روشن جلوی برج ایستاده؟ ۲) جعبه‌ی گفتگو (پرتره + متن) خوانا است؟ ۳) صحنه شلوغ/نامرتب است؟ با بله/خیر + یک جمله.'],
    ['scripts/shots14/06_surtab_icons.png',
     'پنل ساخت‌وساز بازی، تب «بقا» فعال. آیا ۴ کاشی (چراغ‌قوه/باتری/کنسرو/کیت) هرکدام آیکون رنگیِ واقعی دارند (نه جعبه‌ی خاکستری خالی)؟ با بله/خیر + اینکه هر کاشی چه چیزی نشان می‌دهد.'],
    ['scripts/shots14/07_fit_480.png',
     'بازی در پنجره‌ی خیلی کوچک (۴۸۰×۳۲۰). آیا کل قاب بازی (از لبه‌های چپ/راست/بالا/پایین) داخل صفحه جا شده و چیزی بریده نشده؟ با بله/خیر + یک جمله.'],
    ['scripts/shots14/01_intro_dlg.png',
     'کات‌سین افتتاحیه‌ی بازی فارسی. آیا: ۱) جعبه‌ی گفتگو با متن فارسی درست و خوانا هست؟ ۲) پرتره‌ی شخصیت هست؟ ۳) متن ناخوانا/بریده/روی‌هم‌افتاده هست؟ با بله/خیر + یک جمله.'],
    ['scripts/shots14/03_savecode_632.png',
     'صفحه‌ی «کد سیو» در نمای باریک. آیا: ۱) متن‌ها و دکمه‌ها مرتب و بدون هم‌پوشانی‌اند؟ ۲) کد داخل کادر جا شده؟ با بله/خیر + یک جمله.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 700)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
