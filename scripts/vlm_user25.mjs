// vlm_user25.mjs — تحلیل ۵ اسکرین‌شات کاربر برای v25
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const DIR = '/home/z/my-project/user_shots/v25fb';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg')).sort();

const QUESTIONS = [
  `Describe ALL UI buttons/panels visible: their positions, sizes, and which ones OVERLAP each other or go off-screen. Which buttons look too small or badly placed?`,
  `If a merchant/shop panel is visible: where is it, does it cover other buttons, are prices readable? If a build/construction panel is visible: same questions.`,
  `Describe the HUD: coin display, health bar, wave label text (quote it exactly), fullscreen button, pause button. What looks unattractive or misplaced?`,
  `Overall: rate this screen 1-10 for Android touch UX and visual appeal. List concrete fixes needed.`,
];

async function main() {
  const zai = await ZAI.create();
  for (const f of files) {
    const p = `${DIR}/${f}`;
    for (let a = 1; a <= 3; a++) {
      try {
        const b64 = fs.readFileSync(p).toString('base64');
        const res = await zai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
              { type: 'text', text: `You are a senior mobile game UX reviewer. This is a screenshot (2340x1080 landscape) of a Persian zombie tower-defense game running on Android phone, from the actual user who complained: buttons overlap, build button badly placed, merchant panel covers buttons, buttons unattractive. ${QUESTIONS.join(' ')} Answer in English, structured, max 25 lines.` }
            ]
          }],
          thinking: { type: 'disabled' },
          max_tokens: 700
        });
        console.log(`\n${'='.repeat(70)}\n[${f}]\n${'='.repeat(70)}\n` + (res.choices[0].message.content || '').slice(0, 2500));
        break;
      } catch (e) {
        if (a === 3) console.log(`[${f}] ERR ${e.message.slice(0, 120)}`);
        else await sleep(5000 * a);
      }
    }
    await sleep(1200);
  }
}
main();
