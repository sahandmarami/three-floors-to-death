const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  // ۵ شخصیت مختلف را با ASR بررسی کن — آیا گفتار واضح است؟
  const clips = [
    ['voice22/e2a.mp3', 'ارشان (سهند... فکر می‌کنی این بار هم بتونیم ازش جون سالم به در ببریم؟)'],
    ['voice22/e3p.mp3', 'سهند (نمی‌دونم. ولی تا وقتی یه راه باقی مونده، تسلیم نمی‌شیم.)'],
    ['voice22/c4vr.mp3', 'بی‌سیم با افکت رادیویی (هشدار! هشدار! حرکت گسترده در دره شمالی...)'],
    ['voice22/fb1b1.mp3', 'نگهبان هیولا (زره... سنگین... کن!)'],
    ['voice22/i1n.mp3', 'راوی بم (همه‌چیز از یک بیماری ناشناخته شروع شد...)'],
  ];

  for (const [f, label] of clips) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.create({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Transcribe this Persian audio clip exactly. Reply with ONLY the transcription in Persian.' },
        ]
      }],
      // ASR via audio upload isn't in chat API; use the SDK's transcription if available
    });
  }
}
main().catch(e => { console.error('ERR', e.message); });
