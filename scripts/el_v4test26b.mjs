// تست‌های بیشتر: language_code=fa + صداهای مختلف + seed های مختلف
const KEY = 'REMOVED-rotate-key';
const BASE = 'https://api.elevenlabs.io/v1';

async function tts(voiceId, text, out, body) {
  const r = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_v4', ...body })
  });
  if (r.ok) {
    const buf = Buffer.from(await r.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync(out, buf);
    return buf.length;
  }
  console.log(`  FAIL ${out}: ${r.status} ${(await r.text()).slice(0, 120)}`);
  return 0;
}

(async () => {
  const t2 = 'آرش، حواست باشه! زامبيا از همه طرف ميخوان.';
  const t3 = 'خب رفيق، خريدم تو رو کامل کردم.';

  // 1) language_code=fa با Liam و Roger (شکست‌خورده‌ها)
  await tts('TX3LPaxmHKxFdv7VOQHJ', t2, '/home/z/my-project/scripts/tv4_liam_lc.mp3', { language_code: 'fa' });
  await tts('CwhRBWXzGAHq8TQ4Fs17', t3, '/home/z/my-project/scripts/tv4_roger_lc.mp3', { language_code: 'fa' });

  // 2) صداهای دیگر با v4 بدون language_code
  await tts('onwK4e9ZLuTAKqWW03F9', t2, '/home/z/my-project/scripts/tv4_daniel.mp3', {});
  await tts('XrExE9yKIg1WjnnlVkGX', t3, '/home/z/my-project/scripts/tv4_matilda.mp3', {});
  await tts('pNInz6obpgDQGcFmaJgB', t2, '/home/z/my-project/scripts/tv4_adam.mp3', {});

  // 3) Brian با جمله‌ی دوم (تکرارپذیری)
  await tts('nPczCjzI2devNBz1zQrb', t3, '/home/z/my-project/scripts/tv4_brian2.mp3', {});

  const sub = await (await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': KEY } })).json();
  console.log('QUOTA LEFT:', sub.character_limit - sub.character_count);
})();
