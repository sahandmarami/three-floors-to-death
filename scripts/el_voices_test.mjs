// تست صوتی چند صدای eleven_v3 فارسی + ذخیره
import fs from 'fs';
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';

const TESTS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',  text: 'سلام سهند، حالت چطوره؟ امیدوارم هنوز زنده باشی.' },  // مرد گرم
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',   text: 'آرشان، عجله کن! زامبی‌ها دارن میان سمت ساختمان!' },  // زن بالغ
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger',   text: 'دکتر مریم گفت پناهگاه جنوبی هنوز سالمه. باید بریم.' }, // مرد آرام
];

for (const t of TESTS) {
  const r = await fetch(BASE + '/text-to-speech/' + t.id, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: t.text,
      model_id: 'eleven_v3',
      voice_settings: { stability: 0.4, similarity_boost: 0.85 }
    })
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync('/home/z/my-project/scripts/eltest_' + t.name + '.mp3', buf);
    console.log(t.name, 'OK', buf.length, 'bytes');
  } else {
    console.log(t.name, 'ERR', r.status, (await r.text()).slice(0, 200));
  }
}
