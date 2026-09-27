/* تحلیل بصری اسکرین‌شات‌های نسخه‌ی ۵٫۰ با مدل بینایی */
const fs = require('fs');
const path = require('path');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');

const SHOTS = '/home/z/my-project/scripts/shots5';

const PROMPTS = {
  '01_menu.png': [
    'این اسکرین‌شات منوی اصلی یک بازی فارسی است.',
    '۱) آیا منو تمیز و مینیمال است (عنوان بزرگ + یک جمله + دکمه‌ها)؟ ۲) آیا چیپ‌ها/برچسب‌های اضافه و شلوغی حذف شده‌اند؟ ۳) آیا صحنه‌ی زنده‌ی بازی (برج و زامبی‌ها) پشت منو دیده می‌شود؟ ۴) متن فارسی سالم است (بدون مربع/tofu)؟',
    'با بله/خیر + یک جمله جواب بده.',
  ].join('\n'),
  '02_day_morning.png': [
    'این صحنه‌ی «روز» در بازی است (بعد از پاک‌سازی موج).',
    '۱) آیا آسمان روشن و آبی روز است و خورشید دیده می‌شود؟ ۲) آیا ماه/ستاره‌ها محو شده‌اند؟ ۳) آیا دکمه‌ی طلایی «شب شود — موج ۲» در پایین وسط دیده می‌شود؟ ۴) آیا پنل آیکونی ساخت‌وساز سمت راست دیده می‌شود؟ ۵) آیا هیچ زامبی زنده‌ای در صحنه نیست؟',
    'با بله/خیر + یک جمله جواب بده.',
  ].join('\n'),
  '03_tooltip.png': [
    'این صحنه‌ی روز با تولتیپ باز‌شده‌ی آیتم «برجک مسلسل» است.',
    '۱) آیا تولتیپ تیره کنار پنل سمت راست با نام «برجک مسلسل» و متن توضیح فارسی دیده می‌شود؟ ۲) آیا کاشی‌های پنل آیکون‌های تصویری دارند (نه فقط متن)؟ ۳) آیا برجک نصب‌شده روی زمین دیده می‌شود؟',
    'با بله/خیر + یک جمله جواب بده.',
  ].join('\n'),
  '04_night_wave2.png': [
    'این صحنه‌ی «شب» موج ۲ بعد از کلیک «شب شود» است.',
    '۱) آیا آسمان دوباره تاریک شب است (ماه/ستاره)؟ ۲) آیا زامبی‌ها از کناره‌ها آمده‌اند؟ ۳) آیا برجک نصب‌شده‌ی قبلی همچنان روی زمین است؟ ۴) آیا HUD بالا سکه/جون/موج را فارسی نشان می‌دهد؟',
    'با بله/خیر + یک جمله جواب بده.',
  ].join('\n'),
};

async function main() {
  const zai = await ZAI.create();
  for (const [file, prompt] of Object.entries(PROMPTS)) {
    const p = path.join(SHOTS, file);
    if (!fs.existsSync(p)) { console.log(`-- ${file}: NOT FOUND`); continue; }
    const b64 = fs.readFileSync(p).toString('base64');
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
          ],
        }],
      });
      const out = (res.choices && res.choices[0].message.content) || '(empty)';
      console.log(`\n===== ${file} =====\n${out.trim()}\n`);
    } catch (e) {
      console.log(`\n===== ${file} =====\nERROR: ${e.message}\n`);
    }
  }
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
