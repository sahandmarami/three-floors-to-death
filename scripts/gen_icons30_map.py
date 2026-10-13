#!/usr/bin/env python3
# generate icons30 map JS from uris.json
import json
uris = json.load(open('/home/z/my-project/scripts/icons30/uris.json'))
js = '/* ---------- ۳۰-۱) آیکون‌های برش‌خورده از شیت کاربر (icons.png) ---------- */\n'
js += 'const ICONS30 = {\n'
for k in sorted(uris):
    js += f"  {k}: '{uris[k]}',\n"
js += '};\n'
open('/home/z/my-project/scripts/icons30_map.js', 'w').write(js)
import os
print('written', os.path.getsize('/home/z/my-project/scripts/icons30_map.js'), 'bytes')
