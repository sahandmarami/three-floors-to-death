// analyze_user_ui.mjs — تحلیل اسکرین‌شات گوشی کاربر (UI داخل بازی)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync('/home/z/my-project/upload/user_ui.jpg').toString('base64');
  const res = await zai.chat.completions.createVision({
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
        { type: 'text', text: `This is a REAL Android phone screenshot (2340x1080) of a Persian RTL zombie tower-defense game "سه طبقه تا مرگ" showing IN-GAMEPLAY UI problems the user complains about. The user says: buttons are too small/invisible, some elements stick OUT of the frame, stop/pause buttons are not mobile-friendly, HUD is desktop-sized not phone-sized. Analyze PRECISELY: 1) List every UI element you see (buttons, bars, text, coins/money display, weapon slots, pause/stop buttons, wave indicators) with its position (top/bottom/left/right/center). 2) Which elements look TOO SMALL to touch with a finger? 3) Which elements are clipped/out of frame or overlapping? 4) Where is the money/coins display currently and is it prominent? 5) What does the ideal mobile HUD layout look like for this game? Answer in English, compact bullet list.` }
      ]
    }],
    thinking: { type: 'disabled' },
    max_tokens: 800
  });
  console.log(res.choices[0].message.content || 'EMPTY');
}
main();
