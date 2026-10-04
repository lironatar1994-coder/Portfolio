"""Mechanical responsive copies of the existing public website captures."""
from pathlib import Path
from PIL import Image
folder = Path(__file__).resolve().parents[1] / 'public' / 'images'
before = after = 0
for source in folder.glob('*-card-20261004.webp'):
    with Image.open(source) as image:
        for width in (150, 300):
            target = source.with_name(source.stem + f'-{width}w.webp')
            image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=86, method=6)
        before += source.stat().st_size
        after += source.with_name(source.stem + '-300w.webp').stat().st_size
print(f'Responsive card copies: {before:,} -> {after:,} bytes at 300px; originals preserved.')
