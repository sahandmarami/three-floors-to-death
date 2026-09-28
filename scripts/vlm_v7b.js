const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots7/11_shake_full_cracks.png', 'این فریمِ کاملِ مرحله‌ی «لرزش و ترک‌خوردن برج» است (لحظه‌ی ۱٫۶ ثانیه). آیا: ۱) ترک‌های تیره‌ی واضح (با لبه‌ی روشن) روی بدنه‌ی برج دیده می‌شوند؟ ۲) نوارهای سیاه سینمایی بالا/پایین صفحه هستند؟ ۳) زیرنویس فارسی پایین صفحه دیده می‌شود؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots7/12_collapse_debris.png', 'این فریم فروریختن طبقه‌های برج است. آیا: ۱) قطعات آجر/سنگ پراکنده در هوا اطراف برج دیده می‌شوند؟ ۲) ابر غبار (لکه‌های محو روشن) اطراف پایه‌ی برج هست؟ ۳) طبقه‌های پایین در حال محو شدن‌اند و توده‌ی آوار پایه در حال شکل‌گیری است؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots7/08_day_second_tower.png', 'این صحنه‌ی روز بعد از رسیدن به برج دوم است. به افق پشت تپه‌ها دقت کن: آیا: ۱) ساختمان‌های افق، شکسته/فروریخته با لبه‌های ناهموار دیده می‌شوند؟ ۲) لکه‌های نارنجی آتش یا دود روی ساختمان‌ها هست؟ ۳) برج رنگ‌بندی جدید دارد (پایین سبز-خاکی، وسط فیروزه، بالا زرشکی)؟ ۴) آیکون‌های پنل سمت راست مکعب‌های سه‌بعدی‌اند؟ با بله/خیر+یک جمله جواب بده.'],
    ['scripts/shots7/09_wave6_newtower.png', 'این موج ۶ در شب روی برج دوم است. آیا: ۱) پس‌زمینه‌ی شهر، سوخته/دودی با لکه‌های آتش نارنجی است؟ ۲) ماه و ستاره‌ها در آسمان‌اند؟ ۳) برج جدید با رنگ فیروزه/زرشکی وسط صحنه است؟ ۴) زامبی‌ها در صحنه حضور دارند؟ با بله/خیر+یک جمله جواب بده.'],
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
