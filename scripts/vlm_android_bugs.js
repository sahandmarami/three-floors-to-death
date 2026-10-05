const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const files = [
    ['/home/z/my-project/download/drive_assets/extracted/باگه منو .jpg', 'ANDROID MENU SCREEN'],
    ['/home/z/my-project/download/drive_assets/extracted/باگ صفحه با مکان نوشته ها .jpg', 'ANDROID GAMEPLAY SCREEN with text placement'],
  ];

  for (const [f, label] of files) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
          { type: 'text', text: `This is a screenshot (2340x1080 landscape Android phone) of a Persian RTL zombie tower-defense game running in a WebView APK. It is ${label}. The user reported these bugs:
- The game screen is SMALL and does not fill the entire phone screen (there should be no empty/black/white margins around it)
- The screen looks FADED / washed-out (colors not vivid)
- Text is not fully visible / text is cut off or misplaced
Analyze carefully in English:
1) LAYOUT: Describe exactly where the game content ends and empty space begins (left/right/top/bottom margins? letterboxing? which side? roughly what fraction of the screen is unused?). Is there a status bar or navigation bar visible overlapping or shrinking the game?
2) FADING: Do the colors look washed out / pale / dim? What parts look faded?
3) TEXT ISSUES: List every text element that is clipped, cut off, overlapping other elements, or positioned wrongly. Be specific about which text (menu title / buttons / HUD numbers / labels).
4) SCALING: Does the game look stretched, squashed, or correctly proportioned but too small?
5) Anything else broken you notice (touch targets, alignment, RTL direction)?
Give concrete pixel-level observations.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n===================== ${label} =====================`);
    console.log(r.choices[0].message.content);
  }
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
