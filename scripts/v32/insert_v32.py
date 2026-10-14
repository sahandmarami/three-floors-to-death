#!/usr/bin/env python3
"""Insert the v32 module into the game HTML before the closing </script>."""
import re, sys

HTML = '/home/z/my-project/download/three-floors-to-survival.html'
MODULE = '/home/z/my-project/scripts/v32/v32_module.js'

html = open(HTML, encoding='utf-8').read()
module = open(MODULE, encoding='utf-8').read()

# safety: no double insert
if 'css32()' in html and '__32' in html:
    print('v32 already inserted — aborting')
    raise SystemExit(1)

marker = '</script>\n</body>\n</html>'
if marker in html:
    html = html.replace(marker, module + '\n' + marker, 1)
else:
    m = re.search(r'</script>\s*</body>\s*</html>\s*$', html)
    if not m:
        print('MARKER NOT FOUND')
        raise SystemExit(1)
    html = html[:m.start()] + module + '\n</script>\n</body>\n</html>\n'

open(HTML, 'w', encoding='utf-8').write(html)
print('v32 inserted OK. size:', len(html), 'lines:', html.count(chr(10)))
