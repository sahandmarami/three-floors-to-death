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
    ['scripts/shots17/03b_arshan_zoom.png',
     'بزرگ‌نمایی برج در شب. آیا روی لبه/بالکن طبقه‌ی دوم یک شخصیت انسانی کوچک با کلاه قرمز و بدن سبز ایستاده؟ چه چیزی در دست دارد؟ یک جمله.'],
    ['scripts/shots17/04_tunnel_depth.png',
     'مینی‌گیم فرار از تونل تاریک با چراغ‌قوه. آیا: ۱) دایره‌ی نور چراغ‌قوه دور دونده دیده می‌شود؟ ۲) بعضی موانع/بشکه‌ها کوچک‌تر و کم‌رنگ‌تر از بقیه دیده می‌شوند (عمق/پرسپکتیو)؟ بله/خیر + یک جمله.'],
    ['scripts/shots17/05_zipline_depth.png',
     'مینی‌گیم زیپ‌لاین روی دره برفی. آیا: ۱) دو لایه کوه با فاصله‌ی بصری (یکی دورتر/کم‌رنگ‌تر) دیده می‌شود؟ ۲) بعضی تیرک‌ها/موانع کوچک‌تر و محوتر از بقیه‌اند؟ بله/خیر + یک جمله.'],
    ['scripts/shots17/01_drive_mid.png',
     'مینی‌گیم رانندگی شب. سه جزئیات پرسپکتیو بنویس: جاده به افق، اندازه‌ی موانع دور/نزدیک، اجزای کنار جاده.'],
  ];
  for (const [f, q] of jobs) {
    console.log('===== ' + f.split('/').pop() + ' =====');
    try { console.log((await ask(zai, f, q)).slice(0, 500)); } catch (e) { console.log('ERR ' + e.message); }
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
