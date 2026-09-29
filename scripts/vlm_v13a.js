// تحلیل بصری وضعیت فعلی UI (نسخه ۱۲) برای شناسایی مشکلات کاربر
const ZAI = require('z-ai-web-dev-sdk').default;
const fs = require('fs');

async function main() {
  const zai = await ZAI.create();
  const shots = [
    ['shots13/00_menu.png', 'منوی اصلی بازی. آیا پس‌زمینه شلوغ است؟ چه عناصر متنی اضافی‌ای دیده می‌شود؟ فهرست کن همه‌ی متن‌ها/دکمه‌ها/چیپ‌هایی که می‌بینی.'],
    ['shots13/01_day.png', 'صفحه بازی در روز. کجا دکمه توقف ⏸ و صدا 🔊 و چراغ‌قوه 🔦 هستند؟ بالای پنل «ساخت‌وساز» (سمت راست) چه چیپ یا متنی هست؟ آیا چیپ «سلاح در دست» (تپانچه/شاتگان) دقیقا بالای سربرگ ساخت‌وساز نشسته؟ کوله‌پشتی پایین چه شکلی است؟'],
  ];
  for (const [f, q] of shots) {
    const b64 = fs.readFileSync('/home/z/my-project/scripts/' + f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'text', text: q },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
      ]}],
    });
    console.log('===== ' + f + ' =====');
    console.log(r.choices[0].message.content.trim().slice(0, 1200));
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
