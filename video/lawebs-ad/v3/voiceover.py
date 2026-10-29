# Hebrew voiceover for the LA webs ad (v2): one line per scene, trimmed, fitted to its scene with as little
# speed-up as possible, given a light vocal treatment, placed on the timeline and mixed over the music with the
# music ducked under it. Engine: a neural voice through edge-tts when Microsoft's service accepts it, otherwise
# Google Translate's voice through gTTS (both free, no key). For a natural voice, record the six lines and
# pass them with --lines-dir.
# Usage: python voiceover.py <music.wav> <out.wav> [--voice he-IL-HilaNeural|he-IL-AvriNeural] [--lines-dir DIR]
#   --lines-dir uses recorded lines l0.mp3 ... l5.mp3 instead (a real voice; the reel ships without a synthetic one).
import os, subprocess, sys, json, tempfile
# (start second, latest end second, text). Niqqud only where the voice could misread.
LINES = [
    (0.10, 2.60, 'אתרים לעסקים שאכפת להם מהפרטים.'),
    (3.30, 6.40, 'כל אתר נבנה מאפס, סביב העסק.'),
    (13.3, 16.6, 'כל פרט מתוכנן: גופנים, צבעים, מרווחים.'),
    (19.2, 22.6, 'נבנה קודם לטלפון, ומוביל ישר לשיחה.'),
    (23.1, 25.3, 'שיחה. עיצוב. השקה.'),
    (25.8, 29.6, 'אֶל אֵיי וֶבְּס. לשיחת ייעוץ, חַיְּגוּ אלינו.'),
]

def dur(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', path], capture_output=True, text=True).stdout
    return float(json.loads(out)['format']['duration'])

def run(*a): subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *a], check=True)

def trim(src, dst):
    run('-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', dst)

def main():
    music, out = sys.argv[1], sys.argv[2]
    voice = sys.argv[sys.argv.index('--voice') + 1] if '--voice' in sys.argv else 'he-IL-HilaNeural'
    lines_dir = sys.argv[sys.argv.index('--lines-dir') + 1] if '--lines-dir' in sys.argv else None
    tmp = tempfile.mkdtemp()
    parts = []
    for i, (start, end, text) in enumerate(LINES):
        room = end - start - .08
        raw = os.path.join(lines_dir, f'l{i}.mp3') if lines_dir else os.path.join(tmp, f'raw{i}.mp3')
        engine = 'recorded'
        if not lines_dir:
            engine = 'edge'
            ok = subprocess.run([sys.executable, '-m', 'edge_tts', '--voice', voice, '--rate=+6%', '--text', text, '--write-media', raw], capture_output=True).returncode == 0 and os.path.getsize(raw) > 0
            if not ok:
                from gtts import gTTS
                engine = 'gtts'; gTTS(text, lang='iw').save(raw)
        cut = os.path.join(tmp, f'cut{i}.wav'); trim(raw, cut)
        d = dur(cut); tempo = min(1.45, max(1.0, d / room))     # as little speed-up as the scene allows
        fit = os.path.join(tmp, f'l{i}.wav'); run('-i', cut, '-af', f'atempo={tempo:.3f}', fit)
        d2 = dur(fit)
        print(f'line {i} [{engine}]: {d:.2f}s -> {d2:.2f}s (x{tempo:.2f}) in {room:.2f}s window' + ('  TOO LONG' if d2 > room + .05 else ''))
        parts.append((start, fit))
    inputs, filters, labels = ['-i', music], [], []
    for i, (start, p) in enumerate(parts):
        inputs += ['-i', p]
        ms = int(start * 1000)
        filters.append(f'[{i+1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms},highpass=f=90,lowpass=f=11500,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aecho=0.85:0.55:28:0.10,volume=1.55[v{i}]')
        labels.append(f'[v{i}]')
    filters.append(f'{"".join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur=30[vo]')
    filters.append('[vo]asplit=2[vo1][vo2]')
    filters.append('[0:a][vo1]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=300:makeup=1[duck]')
    filters.append('[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9,atrim=0:30[mix]')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *inputs,
                    '-filter_complex', ';'.join(filters), '-map', '[mix]', '-ar', '48000', out], check=True)
    print('wrote', out)

main()
