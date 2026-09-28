const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots7/13_collapse_zoom.png', 'این بزرگ‌نمایی ناحیه‌ی برج در حال فروریختن است. آیا: ۱) قطعات آجر/سنگ (لکه‌های کوچک قهوه‌ای/خاکی) در هوا اطراف برج دیده می‌شوند؟ ۲) جرقه‌های نارنجی/زرد درخشان کوچک بین آوار هست؟ ۳) ابر غبار (مه روشن) اطراف پایه هست؟ ۴) طبقه‌های پایین برج در حال محو شدن‌اند؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots7/14_night_city_zoom.png', 'این بزرگ‌نمایی نیمه‌ی چپ صحنه‌ی شب در شهر سوخته است. آیا: ۱) ساختمان‌های افق با بام‌های شکسته/ناهموار دیده می‌شوند؟ ۲) لکه‌های نور نارنجی/آتش روی ساختمان‌ها هست؟ ۳) ستون دود خاکستری بالا رونده دیده می‌شود؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots7/15_day_city_zoom.png', 'این بزرگ‌نمایی صحنه‌ی روز در شهر سوخته (برج دوم) است. آیا: ۱) ساختمان‌های افق، تیره/سوخته با لبه‌های فروریخته‌اند؟ ۲) نقاط نارنجی آتش یا دود خاکستری روی افق دیده می‌شود؟ ۳) برج سه‌طبقه با رنگ‌بندی فیروزه/زرشکی وسط صحنه است؟ با بله/خیر+یک جمله جواب بده.'],
  ];
  for (const [p, prompt] of jobs) {
    const b64 = fs.readFileSync('/home/z/my-project/' + p).toString('base64');
    try {
      const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
      ] }] });
      console.log('\n===== ' + p + ' =====\n' + ((res.choices && res.choices[0].message.content) || '').trim() + '\n');
    } catch (e) { console.log('\n===== ' + p + ' =====\nERROR: ' + e.message + '\n'); }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
