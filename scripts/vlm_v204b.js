const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function ask(zai, f, prompt) {
  const b64 = fs.readFileSync('/home/z/my-project/' + f).toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  return ((res.choices && res.choices[0].message.content) || '').trim();
}
async function main() {
  const zai = await ZAI.create();
  console.log('===== 09_boss_late =====');
  console.log(await ask(zai, 'scripts/shots204/09_boss_late.png',
    'شب آخر بازی: «باس نگهبان» زامبی بزرگ زره‌پوش باید کامل در صحنه باشد. بررسی: ۱) باس بزرگ زره‌دار/تاج‌دار کامل دیده می‌شود؟ ۲) نسبت به برج بزرگ و مهیب است؟ ۳) روی زمین ایستاده؟ ۴) هاله/جزئیات دیده می‌شود؟ ۵) ایراد بصری؟'));
  console.log('===== 08_menu_late =====');
  console.log(await ask(zai, 'scripts/shots204/08_menu_late.png',
    'منوی اصلی بازی (فارسی). حالا باید یکی-دو زامبی تزئینی با اسپرایت تصویری واقعی در صحنه (دور برج) دیده شوند. بررسی: ۱) زامبی کارتونی واقعی دیده می‌شود؟ ۲) با صحنه هماهنگ است؟ ۳) ایراد بصری؟'));
}
main().catch(e => { console.error('ERR', e.message); });
