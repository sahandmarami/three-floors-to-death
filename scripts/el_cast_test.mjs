// el_cast_test.mjs — تست صداهای بیشتر برای انتخاب بازیگران + چک سهمیه
import fs from 'fs';
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';

async function quota() {
  const r = await fetch(BASE + '/user', { headers: { 'xi-api-key': KEY } });
  const j = await r.json();
  console.log('QUOTA:', j.subscription.character_count, '/', j.subscription.character_limit,
    '→ remaining:', j.subscription.character_limit - j.subscription.character_count);
  return j.subscription.character_limit - j.subscription.character_count;
}

const TESTS = [
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice',   text: 'دکتر مریم هستم. زخمت رو باید همین حالا ببینم.' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', text: 'به همه گزارش می‌دهم: ایستگاه هنوز پابرجاست.' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', text: 'این ساختمون رو تا آخرین نفس نگه می‌داریم.' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River',   text: 'تمام نیروها به مواضع دفاعی برگردن.' },
];

const rem = await quota();
for (const t of TESTS) {
  const r = await fetch(BASE + '/text-to-speech/' + t.id, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: t.text, model_id: 'eleven_v3',
      voice_settings: { stability: 0.45, similarity_boost: 0.8 }
    })
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync('/home/z/my-project/scripts/eltest_' + t.name + '.mp3', buf);
    console.log(t.name, 'OK', buf.length, 'bytes');
  } else console.log(t.name, 'ERR', r.status, (await r.text()).slice(0, 150));
}
await quota();
