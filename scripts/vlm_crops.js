const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const prompts = {
    R0C0: 'مکعب ردیف۱-ستون۱ (گروه ارتقاء)', R0C1: 'مکعب ردیف۱-ستون۲ (گروه ارتقاء)',
    R0C2: 'مکعب ردیف۱-ستون۳ (گروه ارتقاء)', R0C3: 'مکعب ردیف۱-ستون۴ (گروه ارتقاء)',
    R1C0: 'مکعب ردیف۲-ستون۱ (گروه سلاح‌ها)', R1C1: 'مکعب ردیف۲-ستون۲ (گروه سلاح‌ها)',
    R1C2: 'مکعب ردیف۲-ستون۳ (گروه سلاح‌ها)', R1C3: 'مکعب ردیف۲-ستون۴ (گروه سلاح‌ها)',
    R2C0: 'مکعب ردیف۳-ستون۱ (گروه برجک‌ها)', R2C1: 'مکعب ردیف۳-ستون۲ (گروه برجک‌ها)',
    R2C2: 'مکعب ردیف۳-ستون۳ (گروه برجک‌ها)', R2C3: 'مکعب ردیف۳-ستون۴ (گروه برجک‌ها)',
  };
  for (const key of Object.keys(prompts)) {
    const p = '/home/z/my-project/assets/crops/cube_' + key + '.png';
    if (!fs.existsSync(p)) { console.log(key + ': MISSING'); continue; }
    const b64 = fs.readFileSync(p).toString('base64');
    try {
      const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
        { type: 'text', text: `این ${prompts[key]} است که از تصویر فروشگاه برش خورده. در ۳ خط پاسخ بده:
۱) نماد روی مکعب دقیقاً چیست؟ (مثلاً: قلب با پلاس / کفش با فلش / سپر / گلوله‌ها با فلش / چه نوع اسلحه‌ای / چه نوع برجکی)
۲) رنگ اصلی مکعب چه است؟
۳) آیا برش تمیز است؟ یعنی فقط همین یک مکعب کامل دیده می‌شود بدون این‌که بخشی از مکعب همسایه یا متن عنوان داخلش افتاده باشد؟ (تمیز/آلوده)` },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
      ] }] });
      console.log('\n===== ' + key + ' =====\n' + ((res.choices && res.choices[0].message.content) || '').trim());
    } catch (e) { console.log('\n===== ' + key + ' =====\nERROR: ' + e.message); }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
