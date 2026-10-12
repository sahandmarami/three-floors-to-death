// بررسی سهمیه ElevenLabs + لیست صداهای فارسی کتابخانه اشتراکی
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';

async function j(url, opts) {
  const r = await fetch(url, { headers: { 'xi-api-key': KEY }, ...opts });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt.slice(0, 300); }
  return { status: r.status, data: d };
}

(async () => {
  // 1) سهمیه
  const sub = await j(`${BASE}/user/subscription`);
  console.log('SUB:', JSON.stringify(sub.data, null, 1).slice(0, 600));

  // 2) صداهای اشتراکی فارسی
  let voices = [];
  try {
    const vl = await j(`${BASE}/shared-voices?page_size=100&search=`);
    voices = (vl.data.voices || []).filter(v => /persian|farsi|iran/i.test(JSON.stringify(v)));
    console.log('PERSIAN SHARED VOICES:', voices.map(v => `${v.voice_id} | ${v.name} | ${v.language} | ${v.public_owner_id || ''}`).join('\n'));
  } catch (e) { console.log('shared-voices err', e.message); }

  // 3) صداهای شخصی من
  const myv = await j(`${BASE}/voices`);
  console.log('MY VOICES:', (myv.data.voices || []).map(v => `${v.voice_id} | ${v.name}`).join('\n') || '(none)');

  // 4) مدل‌ها
  const models = await j(`${BASE}/models`);
  console.log('MODELS:', (models.data || []).map(m => m.model_id).join(', '));
})();
