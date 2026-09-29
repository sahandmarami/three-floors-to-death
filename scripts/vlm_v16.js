// تحلیل بصری VLM نسخه‌ی ۱۶ — تأیید رفع ۳ ایراد گزارش‌شده توسط کاربر:
// ۱) دکمه‌ی «شب شود» داخل پنل ساخت‌وساز (نه گوشه‌ی شناور) ۲) کوله‌پشتی خوشگل
// ۳) تاریکی لکه‌ای/متغیر فصل ۲ + قطع برق با چراغ‌قوه
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
    ['scripts/shots16/01_day_panel.png',
     'صفحه‌ی «روز» بازی فارسی (بین موج‌ها). پنل «ساخت‌وساز» سمت راست صفحه است. آیا: ۱) یک دکمه‌ی طلایی «🌙 شب شود» به‌صورت نوارِ زیرِ سربرگِ پنل ساخت‌وساز دیده می‌شود (نه دکمه‌ی شناور بزرگ در گوشه‌ی صفحه)؟ ۲) هیچ دکمه‌ی زرد شناورِ جدا در پایین یا گوشه‌ی صفحه نیست؟ ۳) صفحه تمیز و بدون متنِ روی متن است؟ با بله/خیر + یک جمله.'],
    ['scripts/shots16/02_backpack.png',
     'پایینِ صفحه‌ی روزِ بازی: نوار «کوله‌پشتی» سمت چپ با چند جاخالی مربعی. آیا: ۱) جاخالی‌ها قاب‌های رنگی متفاوت دارند (سبز/آبی/زرد) و آیکون‌های رنگی داخلشان دیده می‌شود؟ ۲) ظاهر جاخالی‌ها مرتب و خوشگل است (نه جعبه‌های خاکستری یک‌دست)؟ ۳) شمارنده‌ی «کوله ۵/۶» کنارشان هست؟ با بله/خیر + یک جمله.'],
    ['scripts/shots16/03_ch2_night.png',
     'شبِ فصل ۲ بازی (منطقه‌ی انبارها، برج وسط). آیا: ۱) تاریکی یکنواخت نیست — بعضی نقاط صفحه تاریک‌تر و بعضی روشن‌تر دیده می‌شوند (لکه‌ای/متغیر)؟ ۲) دور برج/بازیکن ناحیه‌ی روشن‌تر (نور) دیده می‌شود؟ ۳) صحنه کاملاً سیاه و غیرقابل‌تشخیص نیست؟ با بله/خیر + یک جمله.'],
    ['scripts/shots16/04_blackout.png',
     'لحظه‌ی «قطع برق» در بازی: آیا: ۱) یک دایره‌ی نور روشن (چراغ‌قوه) دور بازیکن روی برج دیده می‌شود؟ ۲) بیرونِ دایره‌ی نور، صحنه تاریک است ولی هنوز لکه‌ای/غیر یکنواخت؟ ۳) کل صفحه سیاه مطلق نیست؟ با بله/خیر + یک جمله.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 700)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
