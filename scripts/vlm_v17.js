// بررسی بصری سریع v17 — صحنه‌ی رانندگی
const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots17/01_drive_mid.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'اسکرین‌شات مینی‌گیم رانندگی شب‌هنگام در بازی فارسی. آیا: ۱) جاده با پرسپکتیو به سمت افق می‌رود (باریک‌تر در دور می‌شود)؟ ۲) ماشین قرمز از پشت دیده می‌شود (چراغ‌های عقب/اسپویلر) و دو سر در شیشه‌ی عقب؟ ۳) زامبی/مانعی روی جاده دیده می‌شود؟ ۴) نوار پیشرفت بالای صفحه هست؟ با بله/خیر + یک جمله.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim().slice(0, 600));
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
