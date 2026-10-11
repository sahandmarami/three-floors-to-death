const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['/home/z/my-project/scripts/shots22news/shot1.jpg', 'screenshot 1 (19:26:14)'],
    ['/home/z/my-project/scripts/shots22news/shot2.jpg', 'screenshot 2 (19:26:36)'],
    ['/home/z/my-project/scripts/shots22news/shot3.jpg', 'screenshot 3 (19:26:45)'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: `This is ${label} of the Persian zombie tower-defense game "سه طبقه تا مرگ" (Three Floors to Death), taken on the user's REAL Android phone (2340x1080, Persian UI). The user complained: (a) the menu looks VERY UGLY ("منو خیلی زشته"), and (b) some in-game buttons are COMPLETELY INVISIBLE / can't be seen.
Analyze critically in English, be very specific:
1) WHAT SCREEN is this (main menu / gameplay / shop / pause / settings / intro)? What elements are visible?
2) UGLINESS: describe exactly what looks bad visually (layout, colors, spacing, text styling, empty areas, stretched graphics, misaligned items, unreadable text). Give concrete examples with locations (left/right/top/bottom, pixel regions if possible).
3) INVISIBLE/BROKEN BUTTONS: list any button/control that is invisible, nearly invisible, cut off, black-on-black, behind other elements, or off-screen. Also any completely black/empty areas that look like a rendering bug.
4) TEXT: any Persian text clipped, overlapping, too small, low-contrast?
5) SCORE /10 for visual quality and list the TOP 5 concrete fixes you would make to THIS screen.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    const txt = r.choices[0].message.content;
    console.log(`\n########## ${label} ##########\n${txt}`);
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
