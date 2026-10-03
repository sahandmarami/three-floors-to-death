// VLM بررسی تصاویر منو/فروشگاه
const ZAI = require('z-ai-web-dev-sdk').default;

async function main() {
  const zai = await ZAI.create();
  const shots = [
    ['scripts/shots22/01_menu.png', 'این منوی اصلی بازی «سه طبقه تا بقا» است. از ۱ تا ۱۰ چقدر جذاب و حرفه‌ای است؟ ضعف‌های بصری‌اش را دقیق فهرست کن (چیدمان، تایپوگرافی، پس‌زمینه، دکمه‌ها).'],
    ['scripts/shots22/03_shop_wpn.png', 'پنل فروشگاه سلاح‌ها در سمت راست تصویر است. آیا متن‌ها/تایل‌ها روی هم افتاده‌اند یا نامرتب؟ چند تایل سلاح دیده می‌شود؟ توضیح دقیق بده.'],
    ['scripts/shots22/04_tooltip.png', 'تولتیپ (کادر راهنمای مشکی) کنار پنل فروشگاه باید دیده شود. آیا متن داخلش قاطی/روی‌هم‌افتاده/ناخواناست؟ دقیق توصیف کن.'],
  ];
  for (const [f, q] of shots) {
    const fs = require('fs');
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
          { type: 'text', text: q },
        ],
      }],
      max_tokens: 500,
    });
    console.log('=== ' + f + ' ===');
    console.log(r.choices[0].message.content.trim());
    console.log();
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
