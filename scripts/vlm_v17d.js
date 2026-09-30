const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots17/02b_intro_zoom.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'بزرگ‌نمایی جعبه‌ی گفتگوی فارسی. متن اصلی گفتگو (نه دکمه‌ها) را دقیقاً کپی کن و بگو محاوره‌ای است یا رسمی.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim().slice(0, 400));
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
