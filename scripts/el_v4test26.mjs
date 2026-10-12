// تست eleven_v4 با صداهای پیش‌فرض رایگان + متن فارسی مستقیم
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function tts(voiceId, text, out, model = 'eleven_v4', settings) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model, voice_settings: settings || { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true } })
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync(out, buf);
    console.log(`OK ${out} ${buf.length}B ${((Date.now()-t0)/1000).toFixed(1)}s`);
    return true;
  } else {
    console.log(`FAIL ${out}: ${r.status} ${(await r.text()).slice(0, 150)}`);
    return false;
  }
}

(async () => {
  // سه صدا × یک جمله‌ی کوتاه فارسی — ۳۵-۴۵ کاراکتر هر کدام
  const t1 = 'آخرين شب دنيا رسيد. همه جا سوت و کوره.';
  const t2 = 'آرش، حواست باشه! زامبيا از همه طرف ميخوان.';
  const t3 = 'خب رفيق، خريدم تو رو کامل کردم.';

  // p=سهند(Brian) a=آرشان(Liam) d=دستفروش(Roger)
  await tts('nPczCjzI2devNBz1zQrb', t1, '/home/z/my-project/scripts/tv4_brian.mp3');
  await tts('TX3LPaxmHKxFdv7VOQHJ', t2, '/home/z/my-project/scripts/tv4_liam.mp3');
  await tts('CwhRBWXzGAHq8TQ4Fs17', t3, '/home/z/my-project/scripts/tv4_roger.mp3');

  const sub = await (await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } })).json();
  console.log('QUOTA LEFT:', sub.character_limit - sub.character_count);
})();
