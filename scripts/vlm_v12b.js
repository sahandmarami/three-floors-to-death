// تحلیل بصری VLM نسخه‌ی ۱۲ — بخش دوم: پرتره + تب‌ها (بزرگ‌نمایی)
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
    ['scripts/shots12/01_intro_dlg_zoom.png',
     'این بزرگ‌نمایی جعبه‌ی گفتگوی پایین صفحه است. آیا: ۱) یک «پرتره‌ی مربع مدور» (تصویر شخصیت) کنار جعبه‌ی متن دیده می‌شود؟ ۲) متن فارسی داخل جعبه روشن و خواناست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/03_tab_sur_zoom.png',
     'این بزرگ‌نمایی پنل «ساخت‌وساز» در روز است. آیا: ۱) زیر عنوان پنل، ردیفی از ۴ دکمه‌ی تب کوچک دیده می‌شود (یکی روشن/طلایی)؟ ۲) کاشی‌هایی با آیکون (مثل چراغ‌قوه با مخروط نور، باتری، کنسرو، کیت) و نوار قیمت دیده می‌شوند؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/04_tab_wpn.png',
     'این تب «سلاح‌ها»ی پنل ساخت‌وساز در روز است. آیا: ۱) کاشی سلاحی با قاب طلایی روشن‌تر از بقیه (انتخاب‌شده/در دست) دیده می‌شود؟ ۲) دکمه‌ی طلایی «شب شود» بالای صفحه هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/11_gameplay_day.png',
     'این نمای کامل بازی در «روز» است. آیا: ۱) پنل ساخت‌وساز با تب‌ها سمت راست باز است؟ ۲) پایین-چپ فقط یک قرص کوچک «کوله» هست (نه ۶ جعبه‌ی خالی چسبیده)؟ ۳) پایین-وسط هیچ نوار سلاح قدیمی نیست؟ با بله/خیر+یک جمله.'],
  ];
  let pass = 0, fail = 0;
  for (const [p, prompt] of jobs) {
    if (!fs.existsSync('/home/z/my-project/' + p)) { fail++; console.log('\n===== ' + p + ' =====\nMISSING'); continue; }
    try {
      const out = await ask(zai, p, prompt);
      const bad = /خیر/.test(out.split('\n')[0]);
      if (bad) fail++; else pass++;
      console.log('\n===== ' + p.split('/').pop() + ' =====\n' + out);
    } catch (e) { fail++; console.log('\n===== ' + p + ' =====\nERROR: ' + e.message); }
  }
  console.log('\n========== VLM-2: ' + pass + ' OK / ' + fail + ' SUSPECT ==========');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
