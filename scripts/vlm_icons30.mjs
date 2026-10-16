#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const zai = await ZAI.create();
const b64 = fs.readFileSync('/home/z/my-project/scripts/icons30/sheet.png').toString('base64');
const res = await zai.chat.completions.createVision({
  messages: [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
    { type: 'text', text: `This is a contact sheet of 15 cropped game icons (5 per row, 3 rows), each on a dark blue square. Grid order (row-major): row1: pistol, shotgun, rifle(firstaid is 4th? NO — order is: pistol, shotgun, rifle, firstaid, ammobox), row2: energy, vest, grenade, landmine, backpack), row3: runner, shield, radar, binoculars, flashlight).
For EACH of the 15 icons answer briefly: (a) what it depicts, (b) is the crop CLEAN (complete icon, centered, no fragments of neighboring icons, no banner text, no cut-off parts)? Answer as a numbered list 1-15, format: "1. pistol — handgun, clean" or "4. firstaid — red kit with cross, TOP-LEFT CORNER HAS text fragment". Be strict about any contamination.` },
  ] }],
  thinking: { type: 'disabled' },
});
console.log(res.choices?.[0]?.message?.content || 'ERR');
