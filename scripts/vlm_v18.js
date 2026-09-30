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
    ['scripts/shots18/03_arshan_roof_day.png',
     'بالا-وسط تصویر یک برج سه‌طبقه‌ی سنگی با کنگره (دندانه‌های بام) دیده می‌شود. آیا بالای بامِ برج، پشت کنگره‌ها، یک شخصیت انسانی کوچک ایستاده است؟ توصیف کن: جای پایه (روی بام یا معلق در هوا؟)، رنگ کلاه، رنگ لباس. آیا جای ایستادنش «منطقی» به نظر می‌رسد (پایش روی سکوی بام است یا وارونه می‌ایستد/معلق است)؟'],
    ['scripts/shots18/02_arshan_roof_night.png',
     'شب است. بالای برج کنگره‌دار چیزی می‌درخشد. آیا یک شخصیت کوچک با کلاه قرمز و لباس سبز پشت کنگره‌های بام ایستاده و منبع نور زرد/فانوس در دست دارد؟ جای ایستادنش روی بام منطقی است؟'],
    ['scripts/shots18/04_drive_car.png',
     'مینی‌گیم رانندگی از نمای پشت ماشین قرمز. داخل شیشه‌ی عقب ماشین دو سر دیده می‌شود. کدام سر سمت چپ و کدام سمت راست است؟ سر سمت چپ چه رنگ کلاهی دارد و سر سمت راست چه رنگی؟ (راننده در ایران سمت چپ می‌نشیند)'],
    ['scripts/shots18/01_intro_dlg.png',
     'جعبه‌ی گفتگوی پایین صفحه: آیا جعبه خوانا و با کنتراست خوب روی پس‌زمینه است؟ (می‌خواهیم مطمئن شویم حذف افکت بلور، ظاهر را خراب نکرده). متن داخل جعبه را کپی کن و بگو لحنش محاوره‌ای است یا ادبی.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 800)); } catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
