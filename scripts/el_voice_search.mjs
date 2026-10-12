// el_voice_search.mjs — جست‌وجوی صدای فارسی/ایرانی در کتابخانه صداهای اشتراکی
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function search(query) {
  const r = await fetch(`${BASE}/shared-voices?page_size=12&search=${encodeURIComponent(query)}&language=${encodeURIComponent('fa')}`, {
    headers: { 'xi-api-key': KEY }
  });
  console.log(`--- search "${query}" (lang=fa): ${r.status}`);
  if (r.ok) {
    const j = await r.json();
    for (const v of (j.voices || [])) {
      console.log(`  ${v.voice_id} | ${v.name} | ${v.language} | ${v.gender} | accent:${v.accent} | ${v.description ? v.description.slice(0, 60) : ''} | uses:${v.use_count} | models:${(v.models || []).join(',')}`);
    }
    if (!j.voices || !j.voices.length) console.log('  (empty)');
  } else {
    console.log('  err:', (await r.text()).slice(0, 200));
  }
}

await search('persian');
await search('farsi');
await search('iran');
// بدون فیلتر زبان، فقط جست‌وجوی نام
const r2 = await fetch(`${BASE}/shared-voices?page_size=15&search=${encodeURIComponent('persian')}`, { headers: { 'xi-api-key': KEY } });
console.log('--- search "persian" (any lang):', r2.status);
if (r2.ok) {
  const j2 = await r2.json();
  for (const v of (j2.voices || [])) {
    console.log(`  ${v.voice_id} | ${v.name} | ${v.language} | ${v.gender} | uses:${v.use_count}`);
  }
}
