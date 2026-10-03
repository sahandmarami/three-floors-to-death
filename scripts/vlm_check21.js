const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['shots_check/11_v21_studio.png', 'studio lineup of 4 zombie types (normal/fast/tank/boss)'],
    ['shots_check/10_v21_wave6.png', 'night gameplay with zombies walking'],
    ['shots_check/12_v21_attack.png', 'zombie attacking the tower'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync('/home/z/my-project/' + f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `This screenshot shows ${label} in a Persian zombie tower-defense game (dark night palette with gold accents). The zombies are newly redesigned vector graphics. Evaluate critically in English:
1) QUALITY: Do the zombies look detailed and polished (anatomy, shading, outlines, torn clothes, accessories like helmet/crown/cape) or still too simple/flat?
2) READABILITY: Are they clearly visible and readable against the dark background at gameplay size?
3) ANIMATION/POSE: Does the pose look natural?
4) TYPE DISTINCTION: Can you tell the zombie types apart (normal green, fast lean runner, tank with steel helmet, boss red with crown and cape)?
5) Any visual glitches (broken limbs, misplaced parts, clipping)?
6) Overall verdict: SCORE /10 for zombie art quality, and one concrete improvement suggestion.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n===== ${label} =====`);
    console.log(r.choices[0].message.content);
  }
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
