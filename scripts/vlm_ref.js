const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/assets/shop-ref.img').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: `این تصویر مرجعی است که کاربر برای «آیکون‌های مکعبی بخش ساخت‌وساز و فروشگاه» یک بازی دفاع از برج فرستاده. آن را با دقت توصیف کن:
۱) تصویر در کل چه چیزی نشان می‌دهد؟ (بازی؟ منو؟ فروشگاه؟ اسکرین‌شات؟)
۲) مکعب‌ها چه شکلی‌اند؟ ایزومتریک سه‌وجهی‌اند (وجه بالا + دو دیواره جانبی) یا تمام‌نما؟
۳) دقیقاً چند مکعب/آیتم در تصویر هست و هر کدام چه رنگی است؟ رنگ‌های اصلی (HEX حدودی) را فهرست کن.
۴) روی وجه بالای مکعب‌ها چه چیزی حک/نشان داده شده؟ (نماد هر آیتم چیست؟)
۵) سایه‌زنی و لبه‌ها چگونه است؟ (لبه‌ی تیره؟ هایلایت روشن؟ outline؟)
۶) اعداد/قیمت/متن روی تصویر هست؟ چه مقدار؟
۷) پس‌زمینه چه رنگی است؟
۸) مکعب‌ها در چه چیدمانی‌اند؟ (ردیف افقی؟ شبکه؟ فاصله‌ها؟)
پاسخ را ساختاریافته و دقیق بده — می‌خواهم از روی توضیحاتت آیکون‌های بازی را دقیقاً به همین سبک بازسازی کنم.` },
    { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
