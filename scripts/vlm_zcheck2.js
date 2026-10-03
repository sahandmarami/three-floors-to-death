const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/upload/zombie_small_test.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'This is a zombie game sprite scaled down to game size (~66x86 px, displayed on dark navy). At this small scale, is the character still clearly readable as a zombie (silhouette, pose, face)? Or does it become mush? Verdict: READABLE or MUSHY, one line reason.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('ERR', e.message); });
