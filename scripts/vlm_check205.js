const fs = require('fs');
const path = '/home/z/my-project/node_modules/z-ai-web-dev-sdk';

async function main() {
  let ZAI;
  try { ZAI = require(path); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['shots_check/03_menu_v205.png', 'main menu'],
    ['shots_check/04_gameplay_v205.png', 'gameplay with zombies'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync('/home/z/my-project/' + f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `This is the ${label} of a Persian zombie tower-defense game. Answer briefly in English: 1) Is the screen rendering correctly (no blank/black screen, no broken layout)? 2) What main elements do you see? 3) Any visual problems?` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n===== ${label} (${f}) =====`);
    console.log(r.choices[0].message.content);
  }
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
