// test_key28.mjs — تست کلید جدید ElevenLabs کاربر
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io';
async function main() {
  try {
    const r = await fetch(`${BASE}/v1/user`, { headers: { 'xi-api-key': KEY } });
    console.log('user status:', r.status);
    if (r.ok) {
      const j = await r.json();
      console.log('tier:', j.subscription && j.subscription.tier);
      console.log('character_count:', j.subscription && j.subscription.character_count);
      console.log('character_limit:', j.subscription && j.subscription.character_limit);
      console.log('remaining:', (j.subscription && j.subscription.character_limit) - (j.subscription && j.subscription.character_count));
    } else {
      console.log('body:', (await r.text()).slice(0, 200));
    }
    // تست TTS کوتاه فارسی
    const t = await fetch(`${BASE}/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ?output_format=mp3_22050_32`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text: 'امشب باید زنده بمونیم و بس. فردا روز روشنی است.',
        model_id: 'eleven_v4', language_code: 'fa', seed: 12345,
        voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }
      })
    });
    console.log('tts status:', t.status);
    if (t.ok) {
      const buf = Buffer.from(await t.arrayBuffer());
      console.log('tts bytes:', buf.length);
    } else {
      console.log('tts body:', (await t.text()).slice(0, 200));
    }
  } catch (e) { console.log('ERR', e.message); }
}
main();
