// بررسی دقیق برش‌های مشکوک v15
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
    ['scripts/shots15/crop_day_top.png',
     'این برش بالای صفحه‌ی روزِ بازی است (ناحیه‌ی اعلان). دقیق بگو: ۱) چند خط متن فارسی می‌بینی و متن‌ها دقیقاً چه هستند؟ ۲) آیا دو خط متن روی هم افتاده‌اند (هم‌پوشانی واقعی) یا فقط نزدیک/زیر هم‌اند؟ با متن دقیق پاسخ بده.'],
    ['scripts/shots15/crop_day_btn.png',
     'این برش پایینِ راست صفحه‌ی روز بازی است. آیا دکمه‌ی زرد «شب شود» و متن راهنمای زیرش خوانا و جدا از تصویر برج‌اند؟ آیا چیزی روی دکمه افتاده؟ با بله/خیر + یک جمله.'],
    ['scripts/shots15/crop_defeat_bl.png',
     'این برش پایینِ چپ کات‌سین سقوط برج است. دقیق بگو چه عناصری می‌بینی (متن/دکمه/نوار سیاه)؟ آیا دکمه یا نوشته‌ای مثل «رد کردن» این‌جا هست؟ دقیق پاسخ بده.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 600)); }
    catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
