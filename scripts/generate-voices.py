"""Optional authoring: pip install edge-tts. Bundled clips need no runtime TTS."""
import asyncio
import json
import pathlib
import sys
if len(sys.argv) > 1:
    sys.path.insert(0, sys.argv[1])
import edge_tts
VOICE = "bn-BD-PradeepNeural"
folder = pathlib.Path(__file__).resolve().parents[1] / "dist/assets/audio/bn"
lines = json.loads((folder / "lines.json").read_text(encoding="utf-8"))

async def main():
    for name, line in lines.items():
        target = folder / f"{name}.mp3"
        temporary = target.with_suffix(".tmp.mp3")
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(line, VOICE).save(str(temporary)), 30)
                if temporary.stat().st_size < 1000:
                    raise ValueError("Incomplete speech clip")
                temporary.replace(target)
                print(f"Generated {name}: {target.stat().st_size} bytes", flush=True)
                break
            except Exception:
                temporary.unlink(missing_ok=True)
                if attempt == 2:
                    raise
                await asyncio.sleep(1)

asyncio.run(main())
