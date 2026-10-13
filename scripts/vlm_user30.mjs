#!/usr/bin/env node
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const SH = '/home/z/my-project/scripts/userui30/';
const files = fs.readdirSync(SH).filter(f => f.endsWith('.jpg'));
const PROMPTS = {
  0: `This is a bug screenshot from a Persian zombie tower-defense game on a Samsung Android phone (2340x1080, landscape). The user reports these problems: buttons falling on top of each other (دکمه ها روی هم میفتی), the BUILD menu showing ALL sections collapsed together instead of one tab at a time, peddler items appearing in the build menu, the backpack (کوله پشتی) taking half the screen when it has items. Describe PRECISELY what you see: 1) Which UI elements overlap each other and where? 2) Is this the build sheet / peddler menu / backpack / something else? 3) How much of the screen do panels cover? 4) Exact visual problems (stacked buttons, misaligned items, broken layout). Be brutally specific.`,
  1: `Bug screenshot from Persian zombie game on Samsung phone (landscape). User says: buttons stack on top of each other, the build/construction menu shows everything at once instead of per-tab sections, and the mysterious peddler (دستفروش مرموز) menu is broken. Describe exactly what UI is visible, which elements overlap, what looks broken/misaligned/cramped. Be specific about every panel, button and list item you can see.`,
  2: `Bug screenshot from Persian zombie game on Samsung phone. User reports the backpack (کوله پشتی) icon is bad and when the backpack has items it takes half the screen. Describe exactly what you see: which panels are open, what's overlapping, the backpack contents layout, icon quality, spacing problems. Be specific.`,
  3: `Bug screenshot from Persian zombie game on Samsung phone. Describe exactly what you see: open menus/panels, overlapping buttons, layout problems, item lists, prices, anything broken or misaligned. Be specific.`,
};
const zai = await ZAI.create();
let i = 0;
for (const f of files) {
  const b64 = fs.readFileSync(SH + f).toString('base64');
  const prompt = PROMPTS[i] || PROMPTS[3];
  i++;
  for (let a = 1; a <= 4; a++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
            { type: 'text', text: prompt + ' Answer concisely in English.' },
        ] }],
        thinking: { type: 'disabled' },
      });
      console.log(`\n===== ${f} =====`);
      console.log((res.choices?.[0]?.message?.content || '').slice(0, 1600));
      break;
    } catch (e) {
      if (a === 4) console.log(`${f} VLM-ERR ${e.message.slice(0, 80)}`);
      else await new Promise(r => setTimeout(r, 10000));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
