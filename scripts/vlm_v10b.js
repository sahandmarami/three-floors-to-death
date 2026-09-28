const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots10/06_blackout_flashlight.png', 'این لحظه «قطع برق» در بازی است: صفحه تاریک شده و بازیکن (بالای برج وسط) چراغ‌قوه دارد. آیا: ۱) یک «دایره‌ی نور» روشن و واضح دور بازیکن/بالای برج دیده می‌شود که بیرونش تاریک است؟ ۲) داخل دایره، برج/بازیکن قابل تشخیص است؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots10/05_ch2_fog_night.png', 'این شب مه‌گرفته فصل ۲ است. آیا: ۱) صحنه به‌طور محسوس تیره است؟ ۲) دور بازیکن بالای برج، ناحیه‌ای روشن‌تر (دایره نور محو) دیده می‌شود؟ با بله/خیر+یک جمله.'],
    ['scripts/shots10/12_tr2_tunnel.png', 'این فرار از تونل تاریک است (بازیکن می‌دود و چراغ‌قوه دارد). آیا: ۱) یک دایره نور روشن دور دونده هست و بیرونش تقریباً سیاه؟ ۲) داخل دایره‌ی نور حداقل یک مانع (بشکه/تیرآهن/چاله) دیده می‌شود؟ با بله/خیر+یک جمله.'],
    ['scripts/shots10/09_tr1_car.png', 'این فریم از فروریختن برج با ماشین نجات است. آیا: ۱) ماشین قرمزی در سمت چپ/وسط صحنه دیده می‌شود؟ ۲) برج نیمه‌واریخته (طبقه‌های پایین فروریخته) هست؟ ۳) بازیکن کوچک روی برج/ماشین هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots10/10_tr2_road.png', 'این مینی‌گیم دویدن کنار ماشین در جاده است. آیا: ۱) خط‌چین زرد وسط جاده دیده می‌شود؟ ۲) نوار پیشرفت «فرار» بالای صفحه هست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots10/16_boss_finalnight.png', 'این «آخرین شب» با باس در تاریکی است. آیا: ۱) صفحه خیلی تاریک است ولی ناحیه‌ی روشنی دور برج/بازیکن هست؟ ۲) یک هیولا/زامبی بزرگ در ناحیه روشن یا کنارش (سیلوئت) دیده می‌شود؟ با بله/خیر+یک جمله.'],
  ];
  let pass = 0, fail = 0;
  for (const [p, prompt] of jobs) {
    if (!fs.existsSync('/home/z/my-project/' + p)) { fail++; console.log('\n===== ' + p + ' =====\nMISSING\n'); continue; }
    const b64 = fs.readFileSync('/home/z/my-project/' + p).toString('base64');
    try {
      const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
      ] }] });
      const out = ((res.choices && res.choices[0].message.content) || '').trim();
      const bad = /خیر/.test(out.split('\n')[0]);
      if (bad) fail++; else pass++;
      console.log('\n===== ' + p + ' =====\n' + out + '\n');
    } catch (e) { fail++; console.log('\n===== ' + p + ' =====\nERROR: ' + e.message + '\n'); }
  }
  console.log('\n========== VLM: ' + pass + ' OK / ' + fail + ' SUSPECT ==========');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
