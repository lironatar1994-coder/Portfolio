# Image prompts

Five images replace the placeholder SVGs in `public/images/`. They should read as one set, so every prompt shares the same style spine: bright, matte, editorial, warm neutrals, one vermilion accent, no text.

Site palette for reference: paper `#fbfaf7`, ink `#14130f`, vermilion `#d1341c`.

## Shared style (append to every prompt)

```
matte editorial photograph, soft natural window light from the side, warm neutral
palette of off-white, cream, oat and pale grey, shallow depth of field, calm and
uncluttered composition, shot on a 50mm lens, film-like grain, no text, no letters,
no logos, no brand names
```

## Shared negative prompt

```
text, letters, words, numbers, watermark, logo, brand name, cluttered, messy desk,
dark moody lighting, blue or teal color grade, neon, HDR, oversaturated, heavy
vignette, plastic skin, stock-photo smile, extra fingers, distorted hands
```

---

## 1. `studio.svg` → 1200×1500, 4:5 vertical

Sits beside the "בלי תבניות" statement on a near-white background.

```
A designer's desk photographed from slightly above at an angle. An open sketchbook
with a hand-drawn website wireframe — stacked rectangles and lines in pencil, no
legible writing. A laptop at the edge of the frame showing a blurred clean website
layout. A single vermilion red pen lying across the sketchbook as the only
saturated color in the frame. No people.
```

## 2. `process-listen.svg` → 800×600, 4:3 horizontal

Card one, "מקשיבים". Inside a white card.

```
An open notebook on a pale linen table, showing a hand-drawn diagram of a website
structure: simple stacked rectangles connected by thin lines, pencil only, no
legible writing. A vermilion red marker resting beside the notebook as the only
saturated color. A cup of coffee half out of frame. Morning light. No people.
```

## 3. `process-build.svg` → 800×600, 4:3 horizontal

Card two, "מעצבים ובונים".

```
A laptop on a bright desk showing an abstract website layout made of clean
geometric blocks in off-white and dark charcoal. Beside it a tablet showing
out-of-focus colored code lines, unreadable. A vermilion red sticky note on the
desk edge as the only saturated color. No people.
```

## 4. `process-launch.svg` → 800×600, 4:3 horizontal

Card three, "מלטשים ומעלים".

```
A hand holding a smartphone above a bright off-white desk. The phone screen shows
a clean minimal website of abstract blocks and one photograph, nothing readable. A
small vermilion red element on the screen as the only saturated color. Only the
hand and forearm visible, no face.
```

## 5. `contact.svg` → 1000×1200, 5:6 vertical

Sits **on the vermilion block**, so this one must contain no red or orange at all, or it will fight the background. Drop the vermilion accent from the shared style for this image.

Option A, with a person:

```
A relaxed portrait of a person at a bright desk, turning toward the camera
mid-conversation, open and approachable expression. Plain cream or oat shirt.
Off-white wall and pale wood background. Absolutely no red, orange or pink
anywhere in the frame.
```

Option B, no face:

```
Two hands resting on a laptop keyboard on a bright off-white desk, a phone and a
notebook beside them. Warm natural light, cream and pale grey only. Absolutely no
red, orange or pink anywhere in the frame.
```

---

## Installing them

1. Generate at the listed size, or generate square and crop to the listed proportion. The proportion matters more than the exact pixels, since every slot uses `object-fit: cover`.
2. Save into `public/images/` with the same base name, for example `studio.webp` or `studio.jpg`.
3. Update the `src` and the `width`/`height` attributes:
   - `studio`, `process-listen`, `process-build`, `process-launch` → `src/index.html`
   - `contact` → the `contact` template in `scripts/build.mjs`
4. Run `npm run build` then `npm run check`.

Keep each file under about 300KB. WebP at quality 80 is a good target; [squoosh.app](https://squoosh.app) converts without installing anything.

The `alt` attributes are deliberately empty, because every image here is decorative and the sentence beside it already carries the meaning. If an image ends up saying something the text does not, give it a real Hebrew `alt`.
