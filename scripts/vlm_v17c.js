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
     'گفتگوی کات‌سین افتتاحیه‌ی بازی فارسی (شهر در غروب). پایین صفحه جعبه‌ی گفتگو هست. متن گفتگو را «دقیقاً» کپی کن. بعد بگو: آیا لحن محاوره‌ای است (مثل «اومد»، «مون»، «می‌شنوی» با فعل محاوره‌ای) یا رسمی/ادبی (مثل «آغاز شد»، «می‌مانیم»)؟'],
    ['scripts/shots17/03b_arshan_zoom.png',
     'بزرگ‌نمایی بالای برج سه‌طبقه‌ی بازی در شب. آیا روی لبه‌ی طبقه‌ی دوم برج (کمی بالاتر از پنجره‌ها) یک شخصیت انسانی کوچک ایستاده است؟ چه چیزهایی از او می‌بینی (کلاه؟ بدن سبز؟ دوربین؟ نور؟) با یک جمله.'],
    ['scripts/shots17/01_drive_mid.png',
     'این مینی‌گیم رانندگی است. سه چیز که درباره‌ی عمق/پرسپکتیو می‌بینی بنویس: جاده، موانع، اجزای کنار جاده (درخت/تیرچراغ) — دور و نزدیک چگونه فرق دارند؟'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 700)); } catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
