const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots203/01_menu.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'منوی اصلی بازی بقا (فارسی). بررسی و صریح جواب بده: ۱) عنوان طلایی بزرگ بالای صفحه هست و زیرش یک خط تگ‌لاین (متن کوچک)؟ ۲) یک خط جداکننده‌ی افقی طلاییِ درخشان بین عنوان و دکمه‌ها؟ ۳) چهار دکمه (یک دکمه‌ی طلایی بزرگ + دکمه‌ی دوم + دو دکمه‌ی کوچک قرصی)؟ ۴) چیدمان تمیز و وسط‌چین، بدون هم‌پوشانی یا عنصر شکسته؟ ۵) کلی جذاب به نظر می‌رسد؟ ایراد بصری خاصی هست؟' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('ERR', e.message); });
