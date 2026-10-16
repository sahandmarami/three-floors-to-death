import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
const SHOTS = [
  ['bpk_sheet.png', 'Persian RTL game (780x360). A bottom-sheet "backpack/inventory" panel with a 2-column grid of item cards (icon + name + USE button). Check: 1) Cards look touch-friendly? 2) Names/buttons readable, no overflow? 3) Overall polish /10.'],
  ['bpk_used34.png', 'Same backpack sheet after consuming one item. Check grid updated correctly (one less filled card), no layout break. /10'],
];
for (const [f, prompt] of SHOTS) {
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots34/' + f).toString('base64');
  const res = await zai.chat.completions.createVision({
    messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: prompt + ' Concise English.' },
    ] }],
    thinking: { type: 'disabled' },
  });
  console.log('\n##### ' + f + ' #####');
  console.log(res.choices[0].message.content.trim());
}
