const fs = require('fs');

async function main() {
  let ZAI;
  try { ZAI = require('/home/z/my-project/node_modules/z-ai-web-dev-sdk'); } catch (e) { ZAI = require('z-ai-web-dev-sdk'); }
  const zai = await (ZAI.default || ZAI).create();

  const shots = [
    ['/home/z/my-project/scripts/shots22v/01_menu.png', 'REDESIGNED MAIN MENU (desktop 1280x720). User previously rated the menu "very ugly" (3/10): 40% dead space, mustard-yellow button, invisible dark buttons, excessive red glow.'],
    ['/home/z/my-project/scripts/shots22v/03_day_dlg.png', 'DAY PANEL + STORY DIALOGUE after wave 1 (Arshan talking, bottom dialogue box with portrait).'],
    ['/home/z/my-project/scripts/shots22v/09_ending_cine.png', 'NEW CINEMATIC ENDING: night scene, shelter building with warm lit windows, red warning light, silhouettes in valley, camera pulled back.'],
    ['/home/z/my-project/scripts/shots22v/10_tbc.png', 'END SCREEN «این داستان ادامه دارد...» with buttons «شروع دوباره» and «بازگشت به منوی اصلی».'],
  ];

  for (const [f, label] of shots) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `This is ${label} of the Persian zombie game "سه طبقه تا مرگ" v22.0. Evaluate in English:
1) VISUAL QUALITY: Is it attractive and professional? Score /10.
2) CONTRAST/READABILITY: Are ALL buttons and texts clearly visible (nothing invisible/camouflaged)? Any clipped or overlapping text?
3) LAYOUT: Any awkward empty space, misalignment, or ugly elements?
4) PERSIAN TEXT: Rendered correctly (RTL, no tofu boxes)?
5) TOP 3 remaining improvements (if any). Be specific and concise.` }
        ]
      }],
      thinking: { type: 'disabled' }
    });
    console.log(`\n########## ${f.split('/').pop()} ##########\n${r.choices[0].message.content}`);
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
