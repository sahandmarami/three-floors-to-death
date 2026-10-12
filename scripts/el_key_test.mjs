// تست کلید جدید ElevenLabs برای فارسی — چند مدل/صدا، خروجی mp3
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';

async function j(path, opt) {
  const r = await fetch(BASE + path, opt);
  const txt = await r.text();
  let d = null; try { d = JSON.parse(txt); } catch (e) { d = txt.slice(0, 300); }
  return { status: r.status, data: d };
}

(async () => {
  // 1) کاربر و سهمیه
  const u = await j('/user', { headers: { 'xi-api-key': KEY } });
  console.log('USER:', u.status, JSON.stringify(u.data).slice(0, 400));

  // 2) مدل‌های موجود
  const m = await j('/models', { headers: { 'xi-api-key': KEY } });
  if (m.status === 200 && Array.isArray(m.data)) {
    console.log('MODELS:', m.data.map(x => x.model_id + (x.languages ? ' [' + x.languages.map(l => l.language_id).slice(0, 8).join(',') + ']' : '')).join('\n'));
  } else console.log('MODELS:', m.status, JSON.stringify(m.data).slice(0, 400));

  // 3) لیست صداها (۱۰ تا اول)
  const v = await j('/voices', { headers: { 'xi-api-key': KEY } });
  if (v.status === 200 && v.data.voices) {
    console.log('VOICES:', v.data.voices.slice(0, 12).map(x => x.voice_id + ' | ' + x.name).join('\n'));
  } else console.log('VOICES:', v.status, JSON.stringify(v.data).slice(0, 300));

  // 4) تست تولید فارسی با eleven_v3 (اگر موجود باشد)
  const models = (m.status === 200 && Array.isArray(m.data)) ? m.data.map(x => x.model_id) : [];
  const tryModel = models.includes('eleven_v3') ? 'eleven_v3' : 'eleven_multilingual_v2';
  console.log('TRYING MODEL:', tryModel);
  const r = await fetch(BASE + '/text-to-speech/' + (v.status === 200 && v.data.voices[0] ? v.data.voices[0].voice_id : '21m00Tcm4TlvDq8ikWAM'), {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: 'سلام آرشان، هنوز زنده‌ای؟ صدایم را می‌شنوی؟',
      model_id: tryModel,
      voice_settings: { stability: 0.45, similarity_boost: 0.8 }
    })
  });
  console.log('TTS:', r.status, r.headers.get('content-type'));
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    require('fs').writeFileSync('/home/z/my-project/scripts/el_test_fa.mp3', buf);
    console.log('SAVED el_test_fa.mp3', buf.length, 'bytes');
  } else {
    console.log('TTS ERR:', (await r.text()).slice(0, 400));
  }
})().catch(e => console.error('FAIL', e.message));
