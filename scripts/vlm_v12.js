// تحلیل بصری VLM نسخه‌ی ۱۲ — گفتگوی روشن / تب‌ها / سقوط برج / صفحه باخت
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
    ['scripts/shots12/01_intro_dlg.png',
     'این کات‌سین افتتاحیه‌ی بازی است. آیا: ۱) پایین صفحه جعبه‌ی گفتگو با متن فارسی «روشن و کاملاً خوانا» دیده می‌شود (نه متن سیاهِ محو)؟ ۲) پرتره‌ی شخصیت کنار جعبه هست؟ ۳) اسم گوینده بالای متن هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/03_tab_sur.png',
     'این پنل «ساخت‌وساز» بازی است (سمت راست). آیا: ۱) زیر عنوان، یک ردیف ۴ دکمه‌ی تب (مثل ارتقاء/سلاح‌ها/برجک‌ها/بقا) دیده می‌شود؟ ۲) کاشی «چراغ‌قوه» (آیکون چراغ با مخروط نور) در پنل هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/04_tab_wpn.png',
     'این تب «سلاح‌ها»ی پنل ساخت‌وساز است. آیا: ۱) کاشی سلاحی با قاب طلایی/روشن‌تر و علامت انتخاب دیده می‌شود؟ ۲) پایین صفحه هیچ «نوار سلاح قدیمی» با جعبه‌های قفل‌شده‌ی چسبیده نیست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/05_df_climb.png',
     'این سینماییِ باخت است. آیا: ۱) زامبی‌ها به دیوارِ برجِ وسط «چسبیده‌اند و بالا آمده‌اند» (روی طبقه‌ها)؟ ۲) برج ترک برداشته؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/07_df_col2.png',
     'این ادامه‌ی سقوط برج است. آیا: ۱) طبقه‌های پایینی برج فروریخته‌اند (فقط بخش بالایی مانده یا به هم ریخته)؟ ۲) آوار/غبار/آجر پخش‌شده دیده می‌شود؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/08_df_roof.png',
     'این لحظه‌ی سقوط بام برج است. آیا: ۱) بام/طبقه‌ی آخر برج «کج شده و در حال افتادن به زمین» است؟ ۲) بازیکن کوچک هم در صحنه افتاده/در حال سقوط هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/09_df_dust.png',
     'این پایان سقوط برج است. آیا: ۱) برج دیگر وجود ندارد و جای آن توده‌ی آوار است؟ ۲) زامبی‌ها روی/کنار آوار جمع شده‌اند؟ ۳) زیرنویس فارسی پایین صفحه هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/10_gameover.png',
     'این صفحه‌ی باخت است. آیا: ۱) دکمه‌ی طلایی «ادامه از آخرین روز» دیده می‌شود؟ ۲) دکمه‌ی «شروع از اول» هم هست؟ ۳) آمار بازی (کشتار/سکه/کمبو) نوشته شده؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/11_gameplay.png',
     'این گیم‌پلی شب است. آیا: ۱) برج وسط با زامبی‌های اطراف دیده می‌شود؟ ۲) HUD بالا (جون/سکه/موج/سلاح) خواناست؟ ۳) پنل ساخت‌وساز سمت راست با تب‌ها مرتب است؟ ۴) پایین صفحه جعبه‌های خالیِ چسبیده‌ی اضافی نیست؟ با بله/خیر+یک جمله.'],
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
  console.log('\n========== VLM: ' + pass + ' OK / ' + fail + ' SUSPECT ==========');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
