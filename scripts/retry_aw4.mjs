import fs from 'fs';
import { execSync } from 'child_process';
const KEY = 'REMOVED-rotate-key';
const OUT = '/home/z/my-project/scripts/voice30';
const text = 'چراغ‌قوه داره خاموش می‌شه! و دیگه وقت زیادی نداریم.';
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let a = 1; a <= 3; a++) {
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ?output_format=mp3_22050_32`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_v4', language_code: 'fa', seed: Math.floor(Math.random()*2000000),
        voice_settings: { stability: 0.65, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true } })
    });
    if (!r.ok) { console.log('tts', r.status, (await r.text()).slice(0,80)); break; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(OUT + '/aw4_raw.mp3', buf);
    // scribe
    const fd = new FormData();
    fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'a.mp3');
    fd.append('model_id', 'scribe_v1');
    fd.append('language_code', 'fa');
    const s = await (await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd })).json();
    console.log('lang=', s.language_code, 'text=', (s.text||'').slice(0,60));
    if (!/^(fas|fa|pes)/.test(s.language_code||'')) { await sleep(1500); continue; }
    const words = (s.words||[]).filter(w=>w.type==='word');
    // cut at tail start
    const norm = w => String(w).replace(/\u200c/g,'').replace(/[؛،.!؟:\-…«»]/g,'').toLowerCase();
    let cut = null;
    for (let i = Math.max(0, words.length-6); i < words.length; i++) {
      if (norm(words[i].text) === norm('و')) { cut = Math.max(0.5, words[i].start - 0.07); break; }
    }
    const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${OUT}/aw4_raw.mp3`).toString());
    if (cut == null) cut = dur * 0.72;
    cut = Math.min(cut, dur - 0.2);
    execSync(`ffmpeg -y -v quiet -i ${OUT}/aw4_raw.mp3 -t ${cut.toFixed(3)} -af "afade=t=out:st=${Math.max(0,cut-0.08).toFixed(3)}:d=0.08" -ar 24000 -ac 1 -b:a 32k ${OUT}/aw4_cut.mp3`);
    execSync(`ffmpeg -y -v quiet -i ${OUT}/aw4_cut.mp3 -filter_complex "highshelf=f=3400:g=2,acompressor=threshold=0.30:ratio=3:attack=8:release=120,loudnorm=I=-16.5:TP=-1.5" -ar 24000 -ac 1 -b:a 32k ${OUT}/aw4.mp3`);
    console.log('aw4 OK, dur', cut.toFixed(2));
    break;
  } catch (e) { console.log('err', e.message.slice(0,80)); await sleep(2000); }
}
