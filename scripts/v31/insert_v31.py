#!/usr/bin/env python3
"""Insert the v31 module into the game HTML before the closing </script>."""
import re

HTML = '/home/z/my-project/download/three-floors-to-survival.html'
MODULE = '/home/z/my-project/scripts/v31/v31_module.js'
SNIPER = '/tmp/sniper_orig.txt'

html = open(HTML, encoding='utf-8').read()
module = open(MODULE, encoding='utf-8').read()
sniper = open(SNIPER).read().strip()

# safety: no double insert
if '__31' in html and 'css31()' in html:
    print('v31 already inserted — aborting')
    raise SystemExit(1)

module = module.replace('__SNIPER_URI__', sniper)

# insert before the LAST </script> (the main game script that ends the file)
marker = '</script>\n</body>\n</html>'
if marker not in html:
    # try without trailing newline variations
    m = re.search(r'</script>\s*</body>\s*</html>\s*$', html)
    if not m:
        print('MARKER NOT FOUND')
        raise SystemExit(1)
    html = html[:m.start()] + module + '\n</script>\n</body>\n</html>\n'
else:
    html = html.replace(marker, module + '\n' + marker, 1)

open(HTML, 'w', encoding='utf-8').write(html)
print('inserted OK. new size:', len(html), 'lines:', html.count(chr(10)))
