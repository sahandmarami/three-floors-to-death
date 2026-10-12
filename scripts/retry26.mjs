// retry26.mjs — تلاش مجدد خطوط ناموفق با seed های متفاوت
const KEY = 'sk_eaf7367e4b56bcfdbac92769cd5b03ee25f4d0921795634e';
const BASE = 'https://api.elevenlabs.io/v1';

async function tts(voiceId, text, out, seed) {
  const body = { text, model_id: 'eleven_v4', language_code: 'fa', seed, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true } };
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync(out, buf);
    console.log(`OK ${out} ${buf.length}B seed=${seed}`);
    return true;
  }
  console.log(`FAIL ${out}: ${r.status} ${(await r.text()).slice(0, 120)}`);
  return false;
}

(async () => {
  // i1n — راوی: این‌بار Brian (روی جمله‌ی مشابه قبلاً موفق بود) با seed
  await tts('nPczCjzI2devNBz1zQrb', 'یه ویروس، شهر رو بی‌صدا کشت.', '/home/z/my-project/scripts/voice26/i1n_r2.mp3', 7);
  // i2n — Daniel با seed متفاوت
  await tts('onwK4e9ZLuTAKqWW03F9', 'خیابون‌ها خالی موند.', '/home/z/my-project/scripts/voice26/i2n_r2.mp3', 13);
  const sub = await (await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } })).json();
  console.log('QUOTA LEFT (may lag):', sub.character_limit - sub.character_count);
})();
