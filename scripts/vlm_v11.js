// تحلیل بصری VLM نسخه‌ی ۱۱ — گفتگو/پرتره/باس/موبایل
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
    ['scripts/shots11/01_intro_dlg.png',
     'این کات‌سین افتتاحیه‌ی بازی است. آیا: ۱) پایین صفحه یک «جعبه‌ی گفتگو» با متن فارسی دیده می‌شود؟ ۲) سمت چپِ جعبه یک پرتره‌ی دایره‌ای/مربع مدور (شخصیت) هست؟ ۳) بالای متن، اسم گوینده نوشته شده؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/02_intro_dlg2.png',
     'این صحنه‌ی دیگر همان کات‌سین است. آیا جعبه‌ی گفتگو با پرتره‌ی متفاوت (کلاه قرمز یا رادیو یا کلاه‌کاپ) دیده می‌شود؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/05_tr1_dlg.png',
     'این «انتقال فصل» است (فروریختن برج/فرار). آیا: ۱) جعبه‌ی گفتگو با پرتره دیده می‌شود؟ ۲) صحنه‌ی سینمایی (لرزش/آوار/ماشین) پشت آن هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/03_boss.png',
     'این «آخرین شب» با غول نگهبان است. آیا: ۱) یک هیولای بزرگ قرمز/زرشکی با شانه‌های زره‌دار و تاج/شاخ در صحنه هست؟ ۲) نوار جون او بالای صفحه هست؟ ۳) صحنه تاریک است؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/04b_victory_dawn.png',
     'این صحنه‌ی سحرِ پیروزی است. آیا: ۱) جعبه‌ی گفتگو (راوی/ارشان) دیده می‌شود؟ ۲) صحنه در نور طلوع/روشن است؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/06_mobile_portrait.png',
     'این نمای عمودی گوشی است. آیا یک پیام راهنمای «چرخاندن گوشی» (آیکون چرخش + متن) روی صفحه دیده می‌شود؟ با بله/خیر+یک جمله.'],
    ['scripts/shots11/07_mobile_landscape.png',
     'این نمای افقی باریک (موبایل) از بازی است. آیا صحنه‌ی بازی (برج وسط + HUD بالا) خوانا و بی‌به‌هم‌ریختگی دیده می‌شود؟ با بله/خیر+یک جمله.'],
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
