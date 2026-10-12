import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/shots26/';
const zai = await ZAI.create();
for (const [file, prompt] of [
  ['final_menu.png', 'Main menu of Persian zombie game. IMPORTANT: 1) Does it still show the title + big golden Start button + Continue/Settings/About + version 26 at bottom? 2) NO creator name anywhere? 3) Score /10.'],
  ['final_night.png', 'Night gameplay on Android landscape. Check: 1) Left edge has a vertical column of round action buttons (ear/listen, flashlight, molotov) in the SKY area above the street - NOT on the street where zombies walk? 2) Icons are clean SVG line-art (not emoji)? 3) Coin pill + health + level HUD on top right? 4) Any overlapping buttons anywhere? Score /10.'],
  ['final_merchant.png', 'Merchant shop as centered Android Material dialog with dimmed backdrop on a day scene. 1) Centered card with peddler face + items + prices? 2) X close button in header? 3) No other game button covered/blocked by it? Score /10.'],
  ['final_reopen.png', 'Day scene right after closing merchant dialog. 1) Is there a purple pill button on the LEFT edge (below pause/sound) labeled in Persian for reopening the peddler shop? 2) Scene otherwise clean, no overlaps? Score /10.'],
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
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 650));
      break;
    } catch (e) {
      if (a === 4) console.log(`${file} ERR`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 3000));
}
