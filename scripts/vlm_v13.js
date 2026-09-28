// تحلیل بصری VLM نسخه‌ی ۱۳ — منو/ریل چپ/نوار ارتقا/گفتگو
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
    ['scripts/shots13/00_menu.png',
     'منوی اصلی بازی فارسی. آیا: ۱) منو «تمیز و کم‌ازدحام» است (عنوان بزرگ طلایی + حداکثر ۲ دکمه‌ی بزرگ + ۳ دکمه‌ی کوچک قرصی + یک خط نسخه)؟ ۲) پس‌زمینه‌ی پشت متن‌ها تیره و خوانا است؟ ۳) متن اضافه‌ی طولانی (توضیحات چندخطی) دیده نمی‌شود؟ با بله/خیر + یک جمله.'],
    ['scripts/shots13/02_day_rail.png',
     'صفحه‌ی بازی در روز. آیا: ۱) ستونی از ۳ دکمه‌ی گرد (⏸ 🔊 🔦) به «لبه‌ی چپِ وسطِ تصویر» چسبیده است؟ ۲) بالای پنل «ساخت‌وساز» (راست) هیچ چیپ یا متن اضافه (مثل اسم سلاح) نشسته؟ ۳) بالای صفحه فقط چیپ‌های جون/سکه/موج هستند؟ با بله/خیر + یک جمله.'],
    ['scripts/shots13/03_upgrade_bar.png',
     'پنل ساخت‌وساز بازی (سمت راست). آیا زیر کاشی‌های آیتم «نوار پیشرفت/سطح» با قطعات طلایی روشن و قابل‌دیدن دیده می‌شود (نه نقطه‌های ریز نامرئی)؟ با بله/خیر + یک جمله.'],
    ['scripts/shots13/01_intro_dlg.png',
     'کات‌سین افتتاحیه. آیا: ۱) جعبه‌ی گفتگو با متن فارسی روشن و خوانا هست؟ ۲) پرتره‌ی شخصیت کنارش هست؟ با بله/خیر + یک جمله.'],
    ['scripts/shots13/05_night.png',
     'شب گیم‌پلی. آیا: ۱) ریل ۳ دکمه‌ای چپ وسط، بدون هم‌پوشانی با زامبی‌ها/برج دیده می‌شود؟ ۲) صحنه شلوغ نیست؟ با بله/خیر + یک جمله.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 500)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
