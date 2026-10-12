// vlm26b.mjs — تحلیل بصری v26
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots26/';
const SHOTS = [
  ['v26_intro3.png', 'Story-motion scene: discovering the half-built BUILDING. Compare with expectations: 1) Does the building look like a 3-floor TOWER with tapered floors (wider at bottom), stone/brick/red/blue color floors, battlements on roof, arched door? 2) Quality of ground details (rubble, rebar)? 3) Score /10.'],
  ['v26_intro4.png', 'Story-motion scene: fortifying the building (boarding windows). 1) Does the building match a tapered 3-floor tower with red flag? 2) Are work props visible (ladder, lamp, planks, toolbox)? 3) Score /10.'],
  ['v26_intro2.png', 'Story-motion alley scene with approaching zombies. 1) How do the background ZOMBIES look now - detailed silhouettes or stick figures? 2) Ground details (puddles reflecting moonlight)? 3) Score /10.'],
  ['v26_night.png', 'Gameplay night scene on phone: 1) Where are the action buttons (ear/listen, flashlight)? Left edge column ABOVE the street, or ON the street where zombies walk? 2) Any buttons overlapping? 3) Are icons crisp SVG style (not emoji)? Score /10.'],
  ['v26_merchant.png', 'Merchant shop UI as centered Android-style dialog card. 1) Is it centered with dimmed backdrop? 2) Does it overlap ANY other buttons? 3) Score /10.'],
  ['v26_merchant_closed.png', 'Day scene after closing merchant dialog. 1) Is there a purple pill button on the left edge to reopen the shop? 2) Does the scene look clean without overlaps? Score /10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Concise English answer.' },
        ]}],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 700));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 3000));
}
