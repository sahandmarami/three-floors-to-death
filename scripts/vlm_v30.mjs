#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const zai = await ZAI.create();

async function ask(file, prompt) {
  const b64 = fs.readFileSync(file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer in English, be precise and concise.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      return (res.choices?.[0]?.message?.content || '');
    } catch (e) {
      if (a === 4) return 'VLM-ERR ' + e.message.slice(0, 100);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

// 1) ICON SHEET — describe layout & bounding boxes
console.log('===== ICON SHEET (icons.png 1536x1024) =====');
let r = await ask('/home/z/my-project/scripts/icons.png',
`This is an icon sheet for a zombie survival game. List EVERY distinct icon/symbol you can see, arranged as a grid or scattered.
For EACH icon give: 1) what it depicts (e.g. pistol, shotgun, hammer, backpack, flashlight, other), 2) approximate bounding box as PERCENTAGE of image width/height (left%, top%, right%, bottom%), 3) background color of its cell, 4) art style.
Also note the overall grid structure (how many rows/columns) and any text visible.`);
console.log(r.slice(0, 2500));
await new Promise(r2 => setTimeout(r2, 2500));

// 2) BUG SCREENSHOT
console.log('\n\n===== BUG SCREENSHOT (bug.jpg 2340x1080) =====');
r = await ask('/home/z/my-project/scripts/bug.jpg',
`This is a screenshot from a Persian zombie tower-defense game on Android (landscape). The user says something is broken/buggy here.
Describe EXACTLY what you see: 1) Which UI elements are visible (buttons, menus, HUD)? 2) Anything misplaced, overlapping, cut off, unreadable, corrupted, or wrong? 3) Read any Persian text you can see. 4) What is the game state (menu, gameplay, day/night)? Be very specific about the BUG/problem.`);
console.log(r.slice(0, 2500));
