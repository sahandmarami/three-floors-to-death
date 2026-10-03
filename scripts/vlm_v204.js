const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function ask(zai, f, prompt) {
  const b64 = fs.readFileSync('/home/z/my-project/' + f).toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  return ((res.choices && res.choices[0].message.content) || '').trim();
}
async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots204/03_night_fast.png',
     'شبِ بازیِ دفاع از برج (فارسی). بررسی کن: ۱) چند زامبیِ کارتونی با اسپرایت تصویری واقعی (نه شکل هندسی ساده) در حال راه‌رفتن به سمت برج دیده می‌شوند؟ ۲) انیمیشن/ژست طبیعی است (کج‌شدن/گام)؟ ۳) زامبی‌ها نسبت به برج و صحنه اندازه‌ی معقول دارند (نه غول‌آسا/نه مورچه)؟ ۴) پاها روی خط زمین است؟ ۵) ایراد بصری (شناور بودن، بریدگی، تاری مزاحم)؟'],
    ['scripts/shots204/06_boss.png',
     'شب آخر بازی: «باس نگهبان» زامبی بزرگ زره‌پوش باید در صحنه باشد (کنار برج). بررسی: ۱) باس بزرگِ زره‌دار/تاج‌دار دیده می‌شود؟ ۲) نسبت به برج و زامبی‌های دیگر بزرگ‌تر و مهیب است؟ ۳) روی زمین ایستاده (نه شناور/نه فرورفته)؟ ۴) ایراد بصری؟'],
    ['scripts/shots204/07_boss_cracked.png',
     'همان صحنه‌ی باس اما «پنجره‌ی زره‌ترکیده» فعال است — باید شکست‌های بنفشِ تپنده روی بدنه‌ی باس دیده شود. بررسی: ۱) خطوط/درخشش بنفش روی باس هست؟ ۲) ایراد بصری؟'],
    ['scripts/shots204/01_menu_sprites.png',
     'منوی اصلی بازی (فارسی) با دو زامبیِ تزئینی دور صحنه. بررسی: ۱) زامبی(ها) با اسپرایت تصویری واقعی دیده می‌شوند؟ ۲) با پس‌زمینه/برج صحنه هماهنگ‌اند؟ ۳) ایراد بصری؟'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log(await ask(zai, f, q)); } catch (e) { console.log('ERR', e.message); }
  }
}
main().catch(e => { console.error('ERR', e.message); });
