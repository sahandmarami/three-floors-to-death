#!/bin/bash
# اجرای مقاوم ASR — تا ۲۰ دور؛ اگر مرد، دوباره
for i in $(seq 1 20); do
  cd /home/z/my-project/scripts
  node asr25.mjs >> /tmp/asr25.log 2>&1
  # اگر همه چک شد، تمام
  P=$(python3 -c "
import json,os
d = json.load(open('voice25_asr.json')) if os.path.exists('voice25_asr.json') else {}
R = len([f for f in os.listdir('voice25/_raw') if f.endswith('.mp3')])
print(1 if len(d) >= R else 0)
" 2>/dev/null || echo 0)
  [ "$P" = "1" ] && echo "ASR complete" && break
  sleep 8
done
