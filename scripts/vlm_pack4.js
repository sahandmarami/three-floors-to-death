const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk');
async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/upload/sheet_all4.png').toString('base64');
  const res = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [
    { type: 'text', text: 'Sheet of 4 zombie sprites for a 2D night tower-defense game (left to right: NORMAL zombie h~84px, FAST runner zombie h~84px, TANK zombie h~104px, BOSS guardian h~175px — game display scales). Evaluate strictly: 1) Is the art style CONSISTENT across all 4 (same style family, outlines, coloring)? 2) Facing direction of each (must be side view facing LEFT for walking toward a tower)? 3) Is each readable and good-looking at its displayed scale? 4) Do they visually read as: normal / fast-skinny / tank-heavy / boss-imposing? 5) Any sprite with quality problems (blurriness, weird anatomy, cropped parts, clashing style)? 6) FINAL VERDICT: are all 4 suitable to put in the game together? If any should be rejected, say which.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,' + b64 } },
  ] }] });
  console.log(((res.choices && res.choices[0].message.content) || '').trim());
}
main().catch(e => { console.error('ERR', e.message); });
