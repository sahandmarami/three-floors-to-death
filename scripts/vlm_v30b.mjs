#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import { execSync } from 'child_process';

const zai = await ZAI.create();

async function ask(file, prompt) {
  const b64 = fs.readFileSync(file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Answer in English, be precise.' },
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

// Crop bottom half (row 3) and middle (row 2) for finer analysis
execSync(`python3 -c "
from PIL import Image
im = Image.open('/home/z/my-project/scripts/icons.png')
w,h = im.size
im.crop((0, int(h*0.44), w, int(h*0.72))).resize((1536, int(1536*(0.72-0.44)/1.0*0.6667))).save('/home/z/my-project/scripts/icons_row2.png')
im.crop((0, int(h*0.70), w, h)).save('/home/z/my-project/scripts/icons_row3.png')
im.crop((0, 0, w, int(h*0.36))).save('/home/z/my-project/scripts/icons_row1.png')
print('cropped', im.size)
"`);

console.log('===== ROW 2 (support items) =====');
let r = await ask('/home/z/my-project/scripts/icons_row2.png',
`List every icon in this horizontal strip (a row of game item icons). For EACH: what it depicts + bounding box in % (left,top,right,bottom) of THIS strip + cell background color. Persian game items. Be exhaustive.`);
console.log(r.slice(0, 1800));
await new Promise(r2 => setTimeout(r2, 2500));

console.log('\n===== ROW 3 (bottom) =====');
r = await ask('/home/z/my-project/scripts/icons_row3.png',
`List every icon in this horizontal strip (bottom row of a game icon sheet). For EACH: what it depicts (look for: backpack, flashlight, hammer/tool, barricade, turret, campfire, drone, radio, coin, etc.) + bounding box in % (left,top,right,bottom) of THIS strip + cell background. Be exhaustive.`);
console.log(r.slice(0, 1800));
await new Promise(r2 => setTimeout(r2, 2500));

console.log('\n===== BUG ZOOM (vendor menu) =====');
execSync(`python3 -c "
from PIL import Image
im = Image.open('/home/z/my-project/scripts/bug.jpg')
w,h = im.size
im.crop((int(w*0.15), int(h*0.10), int(w*0.85), int(h*0.75))).save('/home/z/my-project/scripts/bug_zoom.jpg')
print('ok')
"`);
r = await ask('/home/z/my-project/scripts/bug_zoom.jpg',
`This is the "مysterious vendor / دستفروش مرموز" shop menu of a Persian zombie game, zoomed. The user says it's messy and broken.
List every visual/layout problem you see: overlapping texts, clipped elements, misaligned rows, unreadable text, wrong RTL direction, ugly spacing, buttons overflowing, labels rendered on top of other labels. Also transcribe ALL Persian text you can read, line by line, with its position.`);
console.log(r.slice(0, 2200));
