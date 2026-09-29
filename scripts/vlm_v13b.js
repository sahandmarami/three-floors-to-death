const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots13/_dlg_zoom.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'بزرگ‌نمایی پایین صفحه‌ی بازی است: جعبه‌ی گفتگو + کنارش یک پرتره‌ی مربعی ۹۶px (تصویر شخصیت). آیا پرتره (تصویری غیر از متن — مثلا کتاب/چهره/آیکون) کنار جعبه‌ی گفتگو دیده می‌شود؟ بله/خیر + توصیف کوتاه.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim().slice(0, 400));
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
