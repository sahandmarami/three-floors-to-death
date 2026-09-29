// تحلیل بصری VLM نسخه‌ی ۱۴ — نمای باریک ۶۳۲px (موبایل افقی)
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
    ['scripts/shots14/07_savecode_632.png',
     'صفحه‌ی «کد سیو» بازی در نمای باریک موبایل. دقیق بگو: ۱) آیا متنی روی متن دیگر/روی دکمه افتاده؟ کدام متن‌ها؟ ۲) آیا متن راهنمای طولانی یا کد از کادر بیرون زده؟ ۳) مشکل چیدمانی که می‌بینی چیست؟'],
    ['scripts/shots14/08_continue_day_632.png',
     'نمای باریک موبایل بازی بعد از «ادامه‌ی سیو» در روز. فهرست کن: همه‌ی متن‌ها و پنل‌ها روی صفحه + اینکه آیا متنی روی متن/پنل دیگر افتاده است؟ (مثلاً اعلان وسط با دکمه‌ی «شب شود» یا پنل‌های کناری). دقیق باش.'],
    ['scripts/shots14/09_day_peddler_632.png',
     'نمای باریک موبایل بازی در روز با پنل دستفروش. آیا: ۱) پنل دستفروش (چپ) با دکمه‌ی «شب شود» (وسط) یا اعلان تصویر برخورد/هم‌پوشانی دارد؟ ۲) پنل ساخت‌وساز (راست) با دکمه‌ی وسط برخورد دارد؟ ۳) چیز نامرئی/خراب دیگری هست؟'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 1500)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
