#!/usr/bin/env python3
"""تست تولید صدای فارسی با edge-tts (صدای نورال مایکروسافت)"""
import asyncio, sys
import edge_tts

VOICE_MAP = {
    'n': 'fa-IR-FaridNeural',   # راوی — مرد گرم
    'a': 'fa-IR-FaridNeural',   # ارشان
    'p': 'fa-IR-FaridNeural',   # بازیکن
    'r': 'fa-IR-DilaraNeural',  # رادیو — زن
    'b': 'fa-IR-FaridNeural',   # نگهبان
    'd': 'fa-IR-DilaraNeural',  # دستفروش؟
}

async def main():
    text = "سلام! من ارشانم. برج رو نگه دار، تا شب زنده بمون!"
    for v in ['fa-IR-FaridNeural', 'fa-IR-DilaraNeural']:
        try:
            tts = edge_tts.Communicate(text, v, rate='+8%')
            out = f'/home/z/my-project/scripts/voice_tmp/_etest_{v}.mp3'
            await tts.save(out)
            import os
            sz = os.path.getsize(out)
            print(f"OK {v} -> {sz} bytes")
        except Exception as e:
            print(f"FAIL {v}: {type(e).__name__}: {e}")

asyncio.run(main())
