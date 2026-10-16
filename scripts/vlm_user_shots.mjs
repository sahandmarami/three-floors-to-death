#!/usr/bin/env node
// vlm_user_shots.mjs — re-analyze user's 4 phone screenshots (2340x1080)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const DIR = '/home/z/my-project/download/drive_v33/';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg'));
const zai = await ZAI.create();
for (const file of files) {
  const b64 = fs.readFileSync(DIR + file).toString('base64');
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
            { type: 'text', text: 'This is a phone screenshot (2340x1080, Persian RTL game). Describe EXACTLY what you see with special attention to: 1) Any LARGE AMOUNTS of Persian text flooding the screen or stacked in a corner (this is a reported bug - text spam when buying molotov from clues panel)? 2) Which UI panels/buttons are visible (build dock, clues panel, circles/rail on left edge)? 3) Any text overflow, overlapping, or broken layout? Be very precise and concise.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log(res.choices[0].message.content.trim());
      break;
    } catch (e) {
      if (a === 3) console.log(`\n===== ${file} FAILED: ${e.message} =====`);
      else await new Promise(r => setTimeout(r, 1500));
    }
  }
}
