// gen_intro26.mjs — تولید ۴ خط اینترو با eleven_v4 + language_code:fa + seed retry
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

const VOICE = { p: 'nPczCjzI2devNBz1zQrb', a: 'TX3LPaxmHKxFdv7VOQHJ', n: 'onwK4e9ZLuTAKqWW03F9' }; // Brian, Liam, Daniel

const LINES = [
  ['i1n', 'n', 'یه ویروس، شهر رو بی‌صدا کشت.'],
  ['i2n', 'n', 'خیابون‌ها خالی موند.'],
  ['i3a', 'a', 'چقدر دیگه؟ آب تمومه.'],
  ['i4p', 'p', 'تا جای امن پیدا نکنیم، وایسیم نمی‌شه.'],
];

async function tts(voiceId, text, out, seed) {
  const body = { text, model_id: 'eleven_v4', language_code: 'fa', voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true } };
  if (seed != null) body.seed = seed;
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync(out, buf);
    return true;
  }
  console.log(`  FAIL ${out}: ${r.status} ${(await r.text()).slice(0, 150)}`);
  return false;
}

(async () => {
  for (const [key, who, text] of LINES) {
    const ok = await tts(VOICE[who], text, `/home/z/my-project/scripts/voice26/${key}.mp3`);
    console.log(`${key} (${who}, ${text.length} chars): ${ok ? 'generated' : 'FAILED'}`);
  }
  const sub = await (await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } })).json();
  console.log('QUOTA LEFT (may lag):', sub.character_limit - sub.character_count);
})();
