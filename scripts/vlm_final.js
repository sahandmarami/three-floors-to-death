const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots5/05_menu_clean.png', 'این منوی اصلی بازی فارسی است بعد از اصلاح. آیا: ۱) هیچ پنل آمار/ساخت‌وساز/نوار سلاحی در صفحه نیست (فقط عنوان+جمله+دکمه‌ها)? ۲) منو حال‌وهوای تمیز و جذاب دارد؟ ۳) صحنه‌ی زنده‌ی بازی (برج/زامبی/شب) دیده می‌شود؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots5/06_wave1_night.png', 'این صحنه‌ی شبِ موج ۱ بازی است. آیا: ۱) HUD بالا (جون/سکه/موج فارسی) برگشته؟ ۲) پنل آیکونی ساخت‌وساز سمت راست دیده می‌شود؟ ۳) زامبی‌ها از کناره‌ها می‌آیند؟ ۴) نوار سلاح پایین هست؟ با بله/خیر+یک جمله جواب بده.'],
  ];
  for (const [p, prompt] of jobs) {
    const b64 = fs.readFileSync('/home/z/my-project/' + p).toString('base64');
    try {
      const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
      ] }] });
      console.log('\n===== ' + p + ' =====\n' + ((res.choices && res.choices[0].message.content) || '').trim() + '\n');
    } catch (e) { console.log('\n===== ' + p + ' =====\nERROR: ' + e.message + '\n'); }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
