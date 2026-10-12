import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots26/';
const SHOTS = [
  ['v26_intro2.png', 'Story-motion cutscene: dark alley with moon and approaching zombie threat. 1) Describe the BACKGROUND ZOMBIES if visible - detailed hunched silhouettes with dangling arms, or plain stick figures? 2) Ground: puddles/moon reflections? 3) Score /10.'],
  ['v26_intro3.png', 'Story-motion cutscene: two survivors discover a half-built building (the game tower). 1) Describe the BUILDING: does it have 3 tapered floors (wider at bottom), different color per floor (stone/brick/blue), battlements (crenellations) on roof, arched door, rebar on unfinished top? 2) Ground rubble/rebar details? 3) Score /10.'],
  ['v26_intro4.png', 'Story-motion cutscene: fortifying the building - character on ladder boarding windows. 1) Building: 3 tapered floors + red flag on pole + battlements? 2) Work props: ladder, work lamp, planks, red toolbox, sawhorse? 3) Score /10.'],
  ['v26_intro5.png', 'Last intro scene. Describe building consistency (3-floor tapered tower with flag?) and overall cinematic quality. Score /10.'],
];
const zai = await ZAI.create();
for (const [file, prompt] of SHOTS) {
  const b64 = fs.readFileSync(SH + file).toString('base64');
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: prompt + ' Concise English.' },
        ]}],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${file} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 800));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 3000));
}
