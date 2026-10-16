import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
for (const f of ['clue_sheet.png', 'molo_bought34.png']) {
  const b64 = fs.readFileSync('/home/z/my-project/scripts/shots34/' + f).toString('base64');
  const res = await zai.chat.completions.createVision({
    messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: 'Persian RTL game (780x360). A bottom-sheet panel slides up from the bottom (Android style) with a grab-handle bar, header with icon+title+close X, and list of touch cards. Evaluate: 1) Does it look like a proper Android bottom sheet? 2) Are cards big enough for touch? 3) Any text overflow/overlap? 4) Does it cover the left rail buttons at top-left? 5) Overall polish score /10. Concise English.' },
    ] }],
    thinking: { type: 'disabled' },
  });
  console.log('\n##### ' + f + ' #####');
  console.log(res.choices[0].message.content.trim());
}
