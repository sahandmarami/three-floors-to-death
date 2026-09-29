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
    ['scripts/shots17/02_intro_dlg.png',
     'گفتگوی کات‌سین افتتاحیه‌ی بازی فارسی. آیا: ۱) جعبه‌ی گفتگو با متن فارسی خوانا پایین صفحه است؟ ۲) پرتره‌ی شخصیت کنار متن دیده می‌شود؟ ۳) متن جمله‌ی محاوره‌ای است (مثل «اومد وسطِ مون» با «ون» نوشتاری)، نه ادبی/رسمی؟ با بله/خیر + نقل قول کوتاه از متن.'],
    ['scripts/shots17/03_arshan_night.png',
     'صحنه‌ی دفاع شب‌هنگام بازی: برج سه‌طبقه وسط، زامبی‌ها در حال حمله. آیا: ۱) یک شخصیت کوچک انسانی روی لبه/بالکن طبقه‌ی دوم برج (سمت راست برج) دیده می‌شود؟ ۲) او کلاه/سر قرمز یا مشخصه‌ی بصری متمایز دارد؟ ۳) هاله‌ی نور گرمی دور او هست (شب است)؟ با بله/خیر + یک جمله.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 500)); } catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
