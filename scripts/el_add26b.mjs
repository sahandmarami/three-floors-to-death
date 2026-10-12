// افزودن صحیح صدای اشتراکی فارسی + تست eleven_v4 با متن فارسی
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function j(url, opts) {
  const r = await fetch(url, { headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, ...opts });
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = txt.slice(0, 500); }
  return { status: r.status, data: d };
}

(async () => {
  // گرفتن public_owner_id برای صداهای فارسی
  const sr = await j(`${BASE}/shared-voices?page_size=40&search=persian`);
  const fa = (sr.data.voices || []).filter(v => v.language === 'fa');
  console.log('FA VOICES with owner:', fa.map(v => `${v.voice_id} | ${v.name} | owner:${v.public_owner_id}`).join('\n  '));

  if (!fa.length) { console.log('no fa voices'); return; }
  const v = fa.find(x => /Roya/.test(x.name)) || fa[0];
  console.log('\nTrying to add:', v.name, v.voice_id, 'owner:', v.public_owner_id);

  // endpoint صحیح: POST /shared-voices/{public_owner_id}/{voice_id}/add
  const add = await j(`${BASE}/shared-voices/${v.public_owner_id}/${v.voice_id}/add`, { method: 'POST', body: JSON.stringify({}) });
  console.log('ADD:', add.status, JSON.stringify(add.data).slice(0, 300));
})();
