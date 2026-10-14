#!/usr/bin/env node
// vlm_cmp291b.mjs — مقایسه مستقیم: شیت محلی باز (تب سلاح) vs نوار کاربر
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui29/new/';
// user's weapon bar zoom + my local sheet open on weapons tab
const b1 = fs.readFileSync(SH + 's1_wpn_zoom.png').toString('base64');
const b2 = fs.readFileSync(SH + 't_wpn_open.png').toString('base64');
const zai = await ZAI.create();
for (let a = 1; a <= 4; a++) {
  try {
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
          { type: 'text', text: 'Image 1 = zoomed crop of USER phone screenshot showing a weapon selector (3 weapons with labels and padlocks). Image 2 = MY local game build with the build-sheet OPEN on weapons tab. Compare the weapon selector in image 1 with the weapon tiles row in image 2: 1) Same visual style? Same icons? Same labels? Same lock badges? Same gold highlight on pistol? 2) Are they the same UI component (build-sheet weapon tab) rendered at different zoom, or different components? 3) In image 2, what text is under each weapon tile? English, concise.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b1}` } },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b2}` } },
      ] }],
      thinking: { type: 'disabled' },
    });
    console.log((res.choices?.[0]?.message?.content || '').slice(0, 1400));
    break;
  } catch (e) {
    if (a === 4) console.log('VLM-ERR ' + e.message.slice(0, 100));
    else await new Promise(r => setTimeout(r, 10000));
  }
}
