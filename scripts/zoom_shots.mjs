// zoom_shots.mjs — detailed VLM look at cropped regions
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const tasks = [
    ['/home/z/my-project/download/drive_assets2/shot2_bottom.jpg',
     'این نوار پایینی یک اسکرین‌شات بازی است. دقیق اسم/متن همه‌ی دکمه‌ها و عناصر را بخوان و بگو کدام دقیقاً بریده شده یا ناقص است.'],
    ['/home/z/my-project/download/drive_assets2/shot2_bl.jpg',
     'این گوشه‌ی پایین-چپ یک اسکرین‌شات بازی است. دقیق بگو چه دکمه‌ها/متن‌هایی اینجاست، متن داخل هر کدام چیست، و هر کدام چقدر از لبه‌ی پایین بریده شده‌اند.'],
  ];
  for (const [path, q] of tasks) {
    const b64 = fs.readFileSync(path).toString('base64');
    const res = await zai.chat.completions.createVision({
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
        { type: 'text', text: q }
      ]}]
    });
    console.log('\n==== ' + path.split('/').pop() + ' ====\n' + (res.choices[0].message.content || '').slice(0, 1500));
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
