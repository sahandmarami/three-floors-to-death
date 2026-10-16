#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const zai = await ZAI.create();
for (const f of ['bug1_panel_L.png', 'bug1_panel_R.png']) {
  const b64 = fs.readFileSync('/home/z/my-project/bugs29/crops/' + f).toString('base64');
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
        { type: 'text', text: 'Persian zombie game build-menu panel (part ' + f + '). For EACH item tile visible, describe: the ICON (what does it depict - gun/turret/binoculars/flashlight?), the Persian label under/near it, and price number. Also read the tab buttons if visible. List every tile in order left-to-right. Be concise.' },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log('\n===== ' + f + ' =====');
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
  } catch (e) { console.log(f, 'ERR', e.message.slice(0, 100)); }
}
