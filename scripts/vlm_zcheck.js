const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/upload/zombie_normal.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'This image was submitted as a "normal zombie" sprite for a 2D tower-defense game. Evaluate it critically and answer each point briefly: 1) Is it a single full-body zombie character? 2) Which direction is it facing (left/right/front/back)? 3) Is it side view suitable for a defense game where zombies walk horizontally toward a tower? 4) Does it have a plain solid background (no scenery, no ground, no other objects)? 5) Art style — describe it (cartoon/pixel/realistic/3D)? Does it have clean bold outlines? 6) Quality issues: blurry, cropped limbs, extra characters, watermark, text, messy edges? 7) Would it look good scaled down to ~35x55 pixels in a dark navy night scene with golden lighting? 8) Overall verdict: GOOD or BAD for this purpose, with one-line reason.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('ERR', e.message); });
