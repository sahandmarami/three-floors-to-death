import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots26/';
const zai = await ZAI.create();
for (const [file, prompt] of [
  ['v26_scene2_desk.png', 'Cinematic scene in a dark alley at night with moon. Look for BACKGROUND ZOMBIES approaching. Describe them: are they detailed dark silhouettes with hunched backs, dangling arms, tilted heads, glowing red eyes? Or crude stick figures? Also check ground: puddles with moonlight reflections? Score /10.'],
  ['v26_scene3_desk.png', 'Scene where survivors discover the half-built tower building with flashlights. 1) Building: 3 tapered floors with different colors, battlements, rebar on top, arched door, rubble? 2) Ground details: scattered bricks/rubble/rebar? 3) Two survivors with flashlight beams? Score /10.'],
]) {
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
      if (a === 4) console.log(`${file} ERR`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 3000));
}
