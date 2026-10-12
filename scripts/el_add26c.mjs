// بررسی جزئیات صدای اشتراکی و endpoint های مختلف افزودن
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';
const ROYA = 'ndcUYGFbbd96WXiZVVaQ';
const OWNER = '64cbc624eb5aab4e95a968e1f41d75402277cca6e549036ed17e56ea33bbbc9e';

async function j(url, opts) {
  const r = await fetch(url, { headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, ...opts });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt.slice(0, 400); }
  return { status: r.status, data: d };
}

(async () => {
  // جزئیات کامل صدای Roya
  for (const url of [
    `${BASE}/shared-voices/${OWNER}/${ROYA}`,
    `${BASE}/shared-voices/${ROYA}`,
  ]) {
    const r = await j(url);
    console.log('GET', url.slice(24, 80), '→', r.status, JSON.stringify(r.data).slice(0, 400));
  }

  // تلاش‌های مختلف add
  for (const [url, body] of [
    [`${BASE}/shared-voices/${OWNER}/${ROYA}/add`, { new_name: 'Roya FA' }],
    [`${BASE}/shared-voices/${ROYA}/add`, { new_name: 'Roya FA' }],
  ]) {
    const r = await j(url, { method: 'POST', body: JSON.stringify(body) });
    console.log('POST', url.slice(24, 80), '→', r.status, JSON.stringify(r.data).slice(0, 200));
  }

  // صداهای من بعد از تلاش
  const my = await j(`${BASE}/voices`);
  console.log('\nMY VOICES:', (my.data.voices || []).map(v => `${v.voice_id}|${v.name}|${(v.labels||{}).language||''}`).join('\n  '));
})();
