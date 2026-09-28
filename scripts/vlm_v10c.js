// بزرگ‌نمایی نواحی کلیدی دو اسکرین‌شات مشکوک + پرسش دقیق VLM
const fs = require('fs');
const { execSync } = require('child_process');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');

const py = `
from PIL import Image
def zoom(src, box, dst, scale=2):
    im = Image.open(src).crop(box)
    im = im.resize((im.width*scale, im.height*scale), Image.LANCZOS)
    im.save(dst)
# برج و بازیکن: مرکز تصویر، بالای زمین (blackout)
zoom('scripts/shots10/06_blackout_flashlight.png', (330, 80, 770, 420), 'scripts/shots10/_z_blackout_tower.png', 2)
# کل نوار بالا (boss bar) در آخرین شب
zoom('scripts/shots10/16_boss_finalnight.png', (0, 0, 1100, 140), 'scripts/shots10/_z_boss_topbar.png', 2)
# نواحی چپ و راست افق (جای احتمالی باس)
zoom('scripts/shots10/16_boss_finalnight.png', (0, 200, 360, 560), 'scripts/shots10/_z_boss_left.png', 2)
zoom('scripts/shots10/16_boss_finalnight.png', (740, 200, 1100, 560), 'scripts/shots10/_z_boss_right.png', 2)
# مرکز (برج+بازیکن) در آخرین شب
zoom('scripts/shots10/16_boss_finalnight.png', (350, 120, 750, 480), 'scripts/shots10/_z_boss_center.png', 2)
print('done')
`;
fs.writeFileSync('/tmp/_zoom.py', py);
console.log(execSync('python3 /tmp/_zoom.py', { cwd: '/home/z/my-project' }).toString());

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
  console.log('\n== _z_blackout_tower ==\n' + await ask(zai, 'scripts/shots10/_z_blackout_tower.png',
    'این برش بزرگ‌نمایی‌شده‌ی وسط صفحه در لحظه‌ی «قطع برق» است (بازیکن بالای برج چراغ‌قوه دارد). آیا دور بازیکن/بالای برج یک ناحیه‌ی روشن‌ترِ دایره‌ای نسبت به پس‌زمینه‌ی تیره دیده می‌شود؟ فقط بله/خیر + یک جمله.'));
  console.log('\n== _z_boss_topbar ==\n' + await ask(zai, 'scripts/shots10/_z_boss_topbar.png',
    'این برش بزرگ‌نمایی‌شده‌ی نوار بالای صفحه در «آخرین شب» است. آیا یک نوار سلامت قرمز/زرشکی با قاب و اسم دیده می‌شود؟ فقط بله/خیر + یک جمله.'));
  console.log('\n== _z_boss_left ==\n' + await ask(zai, 'scripts/shots10/_z_boss_left.png',
    'در این برش از سمت چپ صحنه‌ی تاریک، آیا هیولا/زامبی بزرگی (سilhئت با چشم‌های بنفش/قرمز) دیده می‌شود؟ فقط بله/خیر + یک جمله.'));
  console.log('\n== _z_boss_right ==\n' + await ask(zai, 'scripts/shots10/_z_boss_right.png',
    'در این برش از سمت راست صحنه‌ی تاریک، آیا هیولا/زامبی بزرگی (سیلوئت با چشم‌های بنفش/قرمز) دیده می‌شود؟ فقط بله/خیر + یک جمله.'));
  console.log('\n== _z_boss_center ==\n' + await ask(zai, 'scripts/shots10/_z_boss_center.png',
    'در این برش وسط صحنه‌ی تاریک (برج و بازیکن)، آیا نور چراغ‌قوه دور بازیکن دیده می‌شود؟ آیا زامبی/دشمنی در محدوده یا لبه‌ی نور هست؟ فقط بله/خیر + یک جمله.'));
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
