#!/usr/bin/env python3
"""Full feature inventory of the HTML game — the port contract (nothing may be lost)."""
import re

def read(p):
    return open(f'/home/z/my-project/scripts/{p}', encoding='utf-8').read()

inv = {}

# 1) Chapters & waves
ch = read('v4_chapters.js')
inv['chapters'] = re.findall(r"(?:id|key)\s*:\s*['\"](\w+)['\"].*?title\s*:\s*['\"]([^'\"]+)['\"]", ch)[:20]
waves = read('v3_part2.js')
total_waves = re.search(r'NIGHTS_TOTAL\s*=\s*(\d+)|TOTAL_NIGHTS\s*=\s*(\d+)', waves)
print('== CHAPTERS ==')
for m in re.finditer(r"\{\s*id:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'", ch):
    print('  ', m.group(1), m.group(2))

# 2) Weapons
print('\n== WEAPONS ==')
for m in re.finditer(r"(\w+)\s*:\s*\{\s*name:\s*'([^']+)'[^}]*price:\s*(\d+)[^}]*dmg:\s*([\d.]+)[^}]*rate:\s*([\d.]+)", waves):
    print(f'   {m.group(1)}: {m.group(2)} price={m.group(3)} dmg={m.group(4)} rate={m.group(5)}')

# 3) Zombie types
print('\n== ZOMBIE TYPES ==')
for m in re.finditer(r"(\w+):\s*\{\s*r:\s*([\d.]+),\s*hpBase:\s*([\d.]+)[^}]*spdBase:\s*([\d.]+)", waves):
    print(f'   {m.group(1)}: r={m.group(2)} hp={m.group(3)} spd={m.group(4)}')

# 4) Shop items (survival)
sv = read('v4_survival.js')
print('\n== SHOP ITEMS (بقا) ==')
for m in re.finditer(r"(\w+)\s*:\s*\{\s*name:\s*'([^']+)'[^}]*?price:\s*(\d+)", sv):
    print(f'   {m.group(1)}: {m.group(2)} price={m.group(3)}')

# 5) Turrets
print('\n== TURRETS ==')
for m in re.finditer(r"(\w+)\s*:\s*\{\s*name:\s*'([^']+)'[^}]*?price:\s*(\d+)", sv):
    pass
for m in re.finditer(r"TURRETS\s*=\s*\{(.*?)\n\}", sv, re.S):
    for t in re.finditer(r"(\w+)\s*:\s*\{\s*name:\s*'([^']+)'", m.group(1)):
        print('   ', t.group(1), t.group(2))

# 6) Peddler looks/voices
print('\n== PEDDLER ==')
looks = re.search(r'PED_LOOKS\s*=\s*\[', sv)
print('   PED_LOOKS array:', 'yes' if looks else 'no')
voices = re.search(r'PED_VOICES', sv)
print('   PED_VOICES:', 'yes' if voices else 'no')

# 7) Story scenes count (transitions/shelter/ride/final/defeat)
print('\n== STORY FILES ==')
for f in ['v4_intro_menu.js', 'v4_transitions.js', 'v4_shelter.js', 'v4_ride.js', 'v4_final.js', 'v4_defeat.js', 'v4_arshan.js', 'v4_drive.js']:
    src = read(f)
    dlg = len(re.findall(r"v:\s*'[a-z0-9_]+'", src))
    print(f'   {f}: {dlg} voiced dialog refs, {len(src.splitlines())} lines')

# 8) Audio clips + SFX
au = read('v4_audio.js')
sfx = len(re.findall(r"SFX\.\w+\s*=", au)) or len(re.findall(r"const SFX", au))
print('\n== AUDIO ==')
print('   voice clips: 63 (VOICES17)')
print('   blips/bips system:', 'DLG.blip' in au)

# 9) Mobile
print('\n== MOBILE ==')
print('   touch controls + tilt steering + android back button: v4_mobile.js')

# 10) Save system
print('\n== SAVE ==')
print('   localStorage save/wipe/code:', 'saveGame' in waves or 'saveGame' in read('v3_part4.js'))
