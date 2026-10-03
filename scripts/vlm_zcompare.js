const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/upload/compare_zombies.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'Comparison for a 2D night defense game (dark navy background). LEFT = current in-game zombie (simple vector shapes, ~40x60 shown 2x). MIDDLE = new sprite candidate at same game scale (height 60). RIGHT = same new sprite at 1.4x size (height 84). Answer briefly: 1) Is the new sprite (middle/right) clearly more attractive and detailed than the left one? 2) At the middle size, is it still readable as a zombie? 3) At right size (84px tall), readable and good-looking? 4) Which would you recommend putting in the game: middle scale, right scale, or keep the old left one? 5) Any problem with the new sprite (style clash, too detailed, wrong look for a cartoon night zombie game)?' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('ERR', e.message); });
