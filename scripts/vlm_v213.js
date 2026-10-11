const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['/home/z/my-project/scripts/shots213/phone_menu.png', 'MAIN MENU at phone-viewport 780x360 (simulating a 2340x1080 Android phone like the user reported bugs on)'],
    ['/home/z/my-project/scripts/shots213/phone_wave.png', 'GAMEPLAY with zombies at phone-viewport 780x360'],
    ['/home/z/my-project/scripts/shots213/phone_shelter.png', 'SURVIVOR SHELTER INTERIOR scene at phone-viewport 780x360'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `This is a screenshot from the rebuilt game v21.3 — ${label}. The user previously reported: game screen too small with black bars around it (letterboxing), colors looking faded, text cut off. These were supposedly fixed by making the game world width adaptive and filling the whole viewport. Verify critically in English:
1) FULLSCREEN: Does the game content now fill the ENTIRE image edge-to-edge with NO black/empty bars on any side? (This is the #1 fix to verify)
2) TEXT: Is all text fully visible, readable, not clipped or overlapping? Which text elements (if any) still have problems?
3) LAYOUT: Any elements misplaced, floating, or overlapping wrongly? Any furniture/characters in weird positions (for the shelter shot: heater/kitchen on left, beds on right, radio table in middle, characters around it)?
4) QUALITY: Does the art look sharp and colorful (not washed out)?
5) Verdict: PASS or FAIL for each of the 4 points above + overall score /10.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n===================== ${label.split(' (')[0]} =====================`);
    console.log(r.choices[0].message.content);
  }
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
