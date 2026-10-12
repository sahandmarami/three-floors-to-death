// تست تولید صدای فارسی با Roya + eleven_v4 و ممیزی
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';
const ROYA = 'ndcUYGFbbd96WXiZVVaQ';

(async () => {
  const text = 'سلام سهند، من رويا هستم. برات از آخرين شب دنيا حرف ميزنم.';
  console.log('TEXT:', text, '| chars:', text.length);
  const t0 = Date.now();
  const r = await fetch(`${BASE}/text-to-speech/${ROYA}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_v4' })
  });
  console.log('TTS v4 status:', r.status);
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync('/home/z/my-project/scripts/test_roya_v4.mp3', buf);
    console.log('SAVED test_roya_v4.mp3', buf.length, 'bytes', ((Date.now()-t0)/1000).toFixed(1)+'s');
  } else {
    console.log('ERROR:', (await r.text()).slice(0, 400));
    // fallback: تست با eleven_v3
    const r2 = await fetch(`${BASE}/text-to-speech/${ROYA}?output_format=mp3_22050_32`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_v3' })
    });
    console.log('TTS v3 status:', r2.status);
    if (r2.ok) {
      const buf = Buffer.from(await r2.arrayBuffer());
      const fs = await import('fs');
      fs.writeFileSync('/home/z/my-project/scripts/test_roya_v3.mp3', buf);
      console.log('SAVED test_roya_v3.mp3', buf.length, 'bytes');
    } else console.log('v3 ERROR:', (await r2.text()).slice(0, 400));
  }
})();
