// تحلیل بصری VLM نسخه‌ی ۱۲ — بخش سوم: شلوغی شب + موبایل
const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');

async function ask(zai, p, prompt) {
  const b64 = fs.readFileSync('/home/z/my-project/' + p).toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  return ((res.choices && res.choices[0].message.content) || '').trim();
}

async function main() {
  const zai = await ZAI.create();
  const jobs = [
    ['scripts/shots12/13_night_busy.png',
     'این گیم‌پلی شب بازی با چند زامبی است. آیا: ۱) برج وسط و زامبی‌ها به‌وضوح از هم جدا و قابل تشخیص‌اند (نه قاطی‌شده و نامفهوم)؟ ۲) پایین صفحه تمیز است (فقط یک قرص کوچک کوله سمت چپ)؟ ۳) HUD بالا شلوغِ گیج‌کننده نیست؟ با بله/خیر+یک جمله.'],
    ['scripts/shots12/14_mobile.png',
     'این نمای باریک/موبایلی بازی است. آیا صحنه (برج + HUD بالا + پنل یا قرص کوله) مرتب و خوانا دیده می‌شود؟ با بله/خیر+یک جمله.'],
  ];
  let pass = 0, fail = 0;
  for (const [p, prompt] of jobs) {
    if (!fs.existsSync('/home/z/my-project/' + p)) { fail++; console.log('\n===== ' + p + ' =====\nMISSING'); continue; }
    try {
      const out = await ask(zai, p, prompt);
      const bad = /خیر/.test(out.split('\n')[0]);
      if (bad) fail++; else pass++;
      console.log('\n===== ' + p.split('/').pop() + ' =====\n' + out);
    } catch (e) { fail++; console.log('\n===== ' + p + ' =====\nERROR: ' + e.message); }
  }
  console.log('\n========== VLM-3: ' + pass + ' OK / ' + fail + ' SUSPECT ==========');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
