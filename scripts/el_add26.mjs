// تست: آیا می‌توان صدای اشتراکی فارسی را به کتابخانه‌ی من اضافه و با آن تولید کرد؟
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function j(url, opts) {
  const r = await fetch(url, { headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, ...opts });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt.slice(0, 500); }
  return { status: r.status, data: d };
}

(async () => {
  // مدل‌ها
  const models = await j(`${BASE}/models`);
  console.log('MODELS:', (models.data || []).map(m => `${m.model_id} [${(m.languages||[]).map(l=>l.language_id).join(',')||'any'}]`).join('\n  '));

  // تلاش برای افزودن صدای Roya (گوینده‌ی گرم) به کتابخانه‌ی من
  const ROYA = 'ndcUYGFbbd96WXiZVVaQ';
  const add = await j(`${BASE}/voices/add/${ROYA}`, { method: 'POST' });
  console.log('\nADD ROYA:', add.status, JSON.stringify(add.data).slice(0, 300));

  // اگر موفق بود، تست تولید با متن فارسی
  if (add.status === 200 || add.status === 201) {
    const vid = add.data?.voice_id || ROYA;
    const t0 = Date.now();
    const r = await fetch(`${BASE}/text-to-speech/${vid}?output_format=mp3_22050_32`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text: 'سلام، من رويا هستم. اين يک آزمايش است.',
        model_id: 'eleven_multilingual_v2'
      })
    });
    console.log('TTS status:', r.status, r.headers.get('content-type'));
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      const fs = await import('fs');
      fs.writeFileSync('/home/z/my-project/scripts/test_roya.mp3', buf);
      console.log('saved test_roya.mp3', buf.length, 'bytes', ((Date.now()-t0)/1000).toFixed(1)+'s');
    } else {
      console.log('TTS error:', (await r.text()).slice(0, 300));
    }
  }
})();
