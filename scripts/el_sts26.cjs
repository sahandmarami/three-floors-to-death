// تست STS: تبدیل صدای فارسی edge-tts به صدای ElevenLabs از طریق speech-to-speech
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const fs = require('fs');

(async () => {
  // استخراج یک کلیپ فارسی موجود از voices24_data.js
  const src = fs.readFileSync('/home/z/my-project/scripts/voices24_data.js', 'utf8');
  const m = src.match(/i1n:\{d:[\d.]+,a:"(data:audio\/mpeg;base64,[^"]+)"/);
  if (!m) { console.log('clip not found'); return; }
  const buf = Buffer.from(m[1].split(',')[1], 'base64');
  fs.writeFileSync('/home/z/my-project/scripts/sts_in.mp3', buf);
  console.log('input clip:', buf.length, 'bytes');

  // STS با Brian
  const form = new FormData();
  form.append('audio', new Blob([buf], { type: 'audio/mpeg' }), 'in.mp3');
  form.append('model_id', 'eleven_multilingual_sts_v2');
  const t0 = Date.now();
  const r = await fetch(`${BASE}/speech-to-speech/nPczCjzI2devNBz1zQrb?output_format=mp3_22050_32`, {
    method: 'POST', headers: { 'xi-api-key': KEY }, body: form
  });
  console.log('STS Brian status:', r.status, ((Date.now()-t0)/1000).toFixed(1)+'s');
  if (r.ok) {
    const out = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync('/home/z/my-project/scripts/sts_brian.mp3', out);
    console.log('SAVED sts_brian.mp3', out.length, 'bytes');
  } else console.log('ERR:', (await r.text()).slice(0, 300));

  const sub = await (await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } })).json();
  console.log('QUOTA LEFT:', sub.character_limit - sub.character_count);
})();
