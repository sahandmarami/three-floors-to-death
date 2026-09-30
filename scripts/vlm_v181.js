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
    ['scripts/shots181/01_night_horde.png',
     'شبِ یک بازی دفاع از برج است. بررسی کن: ۱) آسمان شب با ستاره‌ها و ماه رسم شده؟ ۲) برج سه‌طبقه‌ی سنگی با کنگره‌ی بام و پنجره‌های روشن سالم دیده می‌شود؟ ۳) چند زامبی با بدنه‌ی کامل (پا/بدن/سر/چشم قرمز) در حال راه رفتن هستند — آیا زامبی‌ها «کامل» به نظر می‌رسند یا بدنه‌شان ناقص/جعبه‌ای/بدون سر است؟ ۴) لکه‌های خون روی زمین هست؟ ۵) ایراد بصری خاصی (لایه‌ی جاافتاده، مربع سیاه، برج دوبار رسم شده) می‌بینی؟'],
    ['scripts/shots181/02_day.png',
     'روزِ بازی است. بررسی: ۱) آسمان روشن روز + ابرها سالم؟ ۲) تپه‌ها/زمین/چمن و جزئیات زمین (گل/برکه/چراغ) همه حضور دارند؟ ۳) برج با پرچم موج‌دار روی بام؟ ۴) افق ساختمان‌های دور در پس‌زمینه هست؟ ۵) لبه‌ها یا ناحیه‌ای از صحنه خالی/سیاه/جاافتاده دیده می‌شود؟'],
    ['scripts/shots181/03_ch2_dark.png',
     'شبِ تاریکِ لکه‌ای فصل ۲ است (مه انبارها). بررسی: ۱) تاریکی یکنواخت نیست — بعضی نقاط روشن‌تر؟ ۲) چشم‌های قرمزِ زامبی‌ها در تاریکی می‌درخشند (هاله‌ی نرم قرمز)؟ ۳) دایره‌ی نور چراغ‌قوه/نور محیطی دور برج هست؟ ۴) زامبی‌ها کامل رسم شده‌اند؟'],
    ['scripts/shots181/04_menu.png',
     'منوی اصلی بازی. بررسی: ۱) عنوان و دکمه‌های منو خوانا هستند؟ ۲) پس‌زمینه (آسمان/افق/زمین) کامل رسم شده؟ ۳) زامبی‌های تزئینیِ صحنه کامل‌اند (سر و بدن دارند)؟ ۴) مشکل بصری (ناحیه‌ی خالی/دوبار رسم‌شدگی/لایه‌ی غایب) هست؟'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 900)); } catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
