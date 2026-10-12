// vlm26a.mjs — تحلیل بصری شات‌های وضعیت فعلی (createVision)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const SH = '/home/z/my-project/scripts/shots26/';
const SHOTS = [
  ['phone_intro2.png', 'Story-motion cutscene scene from Persian zombie game. Describe: 1) The GROUND/background scenery quality - is it boring/ugly or nice? 2) The background ZOMBIES - how do they look, are they ugly? 3) Overall graphic quality score /10 with reasons.'],
  ['phone_intro3.png', 'Story-motion cutscene: the BUILDING scene. Describe exactly how the building looks (shape, floors, windows, colors, details). Is it detailed or plain? Score /10.'],
  ['phone_gameplay1.png', 'Gameplay on Android landscape phone. Describe: 1) Positions of ALL visible buttons/icons (pause, sound, flashlight, listen/ear, molotov, build panel). 2) Which buttons sit on the street area where zombies walk from left/right? 3) Any overlapping buttons? 4) Score /10.'],
  ['phone_merchant.png', 'Merchant/vendor shop UI on Android phone during gameplay. Describe: 1) Where is the merchant purchase box positioned? 2) Does it cover/overlap other game buttons? Which ones? 3) Score /10.'],
  ['desktop_merchant.png', 'Merchant shop UI on desktop. Same questions: position, overlap with other buttons, score /10.'],
];

const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: prompt + ' Answer concisely in English.' },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 900));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 3000));
}
