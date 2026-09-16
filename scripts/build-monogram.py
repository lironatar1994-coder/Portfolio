"""Regenerate outlined brand SVGs from the shipped OFL font.

Requires fonttools[woff]. Run from the repository root.
All glyphs use the website's unmodified Frank Ruhl Libre weight 800.
Only the A's position changes: 120 units right and 100 units down.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
font = instantiateVariableFont(TTFont(ROOT / 'public/fonts/frank-ruhl-libre-latin.woff2'), {'wght': 800})
glyphs = font.getGlyphSet()
paths = []
for letter, x, y in [('L', 0, 660), ('A', 120, 760)]:
    pen = SVGPathPen(glyphs, ntos=lambda n: f'{n:.2f}'.rstrip('0').rstrip('.') if n else '0')
    glyphs[font.getBestCmap()[ord(letter)]].draw(TransformPen(pen, (1, 0, 0, -1, x, y)))
    paths.append(f'<path d="{pen.getCommands()}"/>')
mark = ''.join(paths)
# Subtract a 15-unit transparent clearance from L where A crosses it. The
# foreground A keeps its exact font outline; no background-colored outline is
# painted, so the separation works on any surface. Small icons stay plain.
a_definition = paths[1].replace('<path ', '<path id="a" ', 1)
cut = (f'<defs>{a_definition}'
       '<mask id="cut" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1400">'
       '<rect x="-200" y="-200" width="1400" height="1400" fill="#fff"/>'
       '<use href="#a" fill="#000" stroke="#000" stroke-width="30" '
       'stroke-linejoin="miter" stroke-miterlimit="8"/></mask></defs>')
separated = paths[0].replace('<path ', '<path mask="url(#cut)" ', 1) + '<use href="#a"/>'
for name, color in [('la-monogram', '#d1341c'), ('la-monogram-white', '#fbfaf7')]:
    (ROOT / f'public/{name}-plain.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" fill="{color}"><g transform="translate(47.8 100)">{mark}</g></svg>\n', encoding='utf-8')
    (ROOT / f'public/{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" fill="{color}">{cut}<g transform="translate(47.8 100)">{separated}</g></svg>\n', encoding='utf-8')
(ROOT / 'public/favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960"><rect width="960" height="960" rx="160" fill="#fbfaf7"/><g fill="#d1341c" transform="translate(99.66 145.6) scale(.88)">{mark}</g></svg>\n', encoding='utf-8')
(ROOT / 'public/images/la-webs-share.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fbfaf7"/><g fill="#d1341c" transform="translate(362.29 106) scale(.55)">{mark}</g></svg>\n', encoding='utf-8')

