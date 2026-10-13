// asr_check28.mjs — ممیزی دو کلیپ بازسازی‌شده‌ی v28 (لحن موقعیت)
import fs from 'fs';
const KEY = 'REMOVED-rotate-key';
const s = fs.readFileSync('/home/z/my-project/scripts/voices28_data.js', 'utf8');
const re = /([a-zA-Z0-9]+):\{d:([\d.]+),a:"([^"]*)"/g;
const clips = {}; let m;
while ((m = re.exec(s))) clips[m[1]] = { d: +m[2], a: m[3] };
for (const id of ['c4v4', 'aw2', 'w1a', 't1a1']) {
  const c = clips[id];
  const buf = Buffer.from(c.a.split(',')[1], 'base64');
  const mp3 = `/tmp/v28_${id}.mp3`;
  fs.writeFileSync(mp3, buf);
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-speech/speech-to-speech'.replace('speech-to-speech/speech-to-speech', 'speech-to-text'), {
    method: 'POST',
    headers: { 'xi-api-key': KEY },
    body: (() => { const fd = new FormData(); fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), `${id}.mp3`); fd.append('model_id', 'scribe_v1'); return fd; })(),
  });
  const j = await r.json();
  console.log(id, '· lang=' + (j.language_code || j.language_probability && '?' || '?'), '· text=', (j.text || JSON.stringify(j)).slice(0, 120));
}
