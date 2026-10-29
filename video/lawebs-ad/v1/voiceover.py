# Hebrew voiceover for the LA webs ad (built on the Alenu ad pipeline): one text-to-speech line per scene, trimmed, sped up only as much
# as its scene needs, placed on the timeline and mixed over the music with the music ducked under it.
# Engine: Google Translate TTS through gTTS (free, no key). For a premium voice, record the same lines
# or generate them elsewhere and drop the files in as l0.mp3 ... l6.mp3 (see --lines-dir).
# Usage: python voiceover.py <music.wav> <out.wav> [--lines-dir DIR]
import os, subprocess, sys, json, tempfile
from gtts import gTTS
# (start second, latest end second, text). Niqqud only where the voice could misread.
LINES = [
    (0.30, 2.95, 'יש לך עסק? מגיע לו אתר שמביא לקוחות.'),
    (3.30, 7.95, 'עיצוב אישי, שנבנה סביב העסק שלך. בלי תבניות.'),
    (8.40, 12.9, 'מושלם בטלפון, כי שם הלקוחות שלך.'),
    (13.4, 17.9, 'ולקוחות פונים אליך ישר בוואטסאפ, בלחיצה אחת.'),
    (18.4, 21.95, 'מהיר, מאובטח ומוכן לגוגל. הכל כלול.'),
    (22.4, 24.95, 'מרעיון לאתר באוויר, ונשארים איתך גם אחרי.'),
    (25.6, 29.6, 'אֶל אֵיי וֶבְּס. לשיחת ייעוץ, חַיְּגוּ אלינו.'),
]

def dur(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', path], capture_output=True, text=True).stdout
    return float(json.loads(out)['format']['duration'])

def run(*a): subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *a], check=True)

def trim(src, dst):
    # cut leading and trailing silence
    run('-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', dst)

def main():
    music, out = sys.argv[1], sys.argv[2]
    lines_dir = sys.argv[sys.argv.index('--lines-dir') + 1] if '--lines-dir' in sys.argv else None
    tmp = tempfile.mkdtemp()
    parts = []
    for i, (start, end, text) in enumerate(LINES):
        room = end - start - .1
        raw = os.path.join(lines_dir, f'l{i}.mp3') if lines_dir else os.path.join(tmp, f'raw{i}.mp3')
        if not lines_dir: gTTS(text, lang='iw').save(raw)
        cut = os.path.join(tmp, f'cut{i}.wav'); trim(raw, cut)
        d = dur(cut); tempo = min(1.75, max(1.12, d / room))     # brisk ad pace, never slower than 1.12x
        fit = os.path.join(tmp, f'l{i}.wav'); run('-i', cut, '-af', f'atempo={tempo:.3f}', fit)
        d2 = dur(fit)
        print(f'line {i}: {d:.2f}s -> {d2:.2f}s (x{tempo:.2f}) in {room:.2f}s window' + ('  TOO LONG' if d2 > room + .05 else ''))
        parts.append((start, fit))
    inputs, filters, labels = ['-i', music], [], []
    for i, (start, p) in enumerate(parts):
        inputs += ['-i', p]
        ms = int(start * 1000)
        filters.append(f'[{i+1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms},highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,volume=3.0[v{i}]')
        labels.append(f'[v{i}]')
    filters.append(f'{"".join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur=30[vo]')
    filters.append('[vo]asplit=2[vo1][vo2]')
    filters.append('[0:a]volume=0.7[mus];[mus][vo1]sidechaincompress=threshold=0.1:ratio=2.5:attack=20:release=250:makeup=1[duck]')
    filters.append('[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9,atrim=0:30[mix]')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *inputs,
                    '-filter_complex', ';'.join(filters), '-map', '[mix]', '-ar', '48000', out], check=True)
    print('wrote', out)

main()
