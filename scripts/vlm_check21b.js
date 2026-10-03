const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['shots_check/13_v21_studio2.png', 'studio lineup of 4 zombie types (normal/fast/tank/boss) AFTER improvement pass'],
    ['shots_check/14_v21_wave6b.png', 'night gameplay with normal+fast+tank zombies AFTER improvement pass'],
    ['shots_check/15_v21_boss.png', 'final boss wave at night AFTER improvement pass'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync('/home/z/my-project/' + f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `This screenshot shows ${label} in a Persian zombie tower-defense game. A previous art review suggested: zombie-like lurch/hunch pose, cool rim-light for night readability, visible teeth, wider tank stance, aligned glowing eyes on the hunched head. Evaluate in English:
1) Are these improvements visible (hunched lurching poses, rim-light on heads/shoulders, wider tank stance)?
2) Do the zombies now look more menacing/organic vs stiff?
3) Any visual glitch (eyes floating off head, limbs detached, cape clipping badly)?
4) SCORE /10 vs typical quality 2D mobile game character art, one remaining improvement.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n===== ${label} =====`);
    console.log(r.choices[0].message.content);
  }
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
