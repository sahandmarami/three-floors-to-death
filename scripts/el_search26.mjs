// جستجوی دقیق صداهای فارسی کتابخانه + تست تولید multilingual_v2 با متن فارسی مستقیم
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function j(url, opts) {
  const r = await fetch(url, { headers: { 'xi-api-key': KEY }, ...opts });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt.slice(0, 400); }
  return { status: r.status, data: d };
}

(async () => {
  // 1) جستجوی چندگانه در کتابخانه اشتراکی
  for (const q of ['persian', 'farsi', 'iran', 'farsi']) {
    try {
      const r = await j(`${BASE}/shared-voices?page_size=40&search=${encodeURIComponent(q)}`);
      const vs = r.data.voices || [];
      console.log(`SEARCH "${q}" (${vs.length}):`, vs.map(v => `${v.voice_id} | ${v.name} | ${v.language || (v.verified||{}).language || ''} | accent:${(v.verified||{}).accent || ''} | gender:${(v.verified||{}).gender || ''}`).join('\n  '));
    } catch (e) { console.log(`search ${q} err:`, e.message); }
  }

  // 2) لیست مدل‌ها
  const models = await j(`${BASE}/models`);
  console.log('\nMODELS:', (models.data || []).map(m => `${m.model_id} [${(m.languages||[]).map(l=>l.language_id).join(',')||'any'}]`).join('\n  '));
})();
