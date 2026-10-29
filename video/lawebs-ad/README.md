# LA webs — 30s vertical video ad (v4)

1080×1920, **60 fps**, exactly 30 s, music and sound effects only. It belongs to the same series as `Maavar/ad-alenu` and `PizzaManager/ad-pizza`: the same engine and viewfinder frame, hollow letters that fill one by one, a highlighter under the key words, AF-lock brackets, and a ticket end card that draws itself. The world is the studio's: ink, paper and terracotta, Plex Hebrew and the wordmark's Frank Ruhl Libre, and the studio's real work.

Output: `out/lawebs-ad.mp4`, and a desktop cut at 1920×1080, `out/lawebs-ad-desktop.mp4` (see [Desktop](#desktop-169)). The soundtrack alone is `out/soundtrack.wav`. Earlier versions are kept in `v1/`, `v2/` and `v3/`.

## The idea

The pizza ad builds a pizza live. This one builds a website live: a real site the studio made (Miryam Zelig), rebuilt from its own pixels. Each tool in the toolbar is tapped on the beat and its part of the real first screen drops onto the page and lands where the site puts it; "+%" flies to a counter that rolls to 100%.

## Storyboard (128 BPM, every cut on a bar line)

| Bars | Time | Scene | Transition out |
|---|---|---|---|
| 0–1 | 0–3.75 | Dark, over the studio's work out of focus. "יש לכם / עסק?" slams in on the beats, the "LA webs" seal lands, UI pieces orbit (swatches, Aa, buttons, a cursor, WhatsApp), sparks rise. Then "בואו נבנה לו אתר. בלייב." | zoom-through |
| 2–3 | 3.75–7.5 | "מתחילים מדף ריק." A blank phone with a blinking caret and a "+ אתר חדש" button; the designer's cursor ("LA webs") clicks it and the wireframe draws itself; the camera leans in | push into the phone |
| 4–6 | 7.5–13.1 | "מעצבים מאפס, פרט אחרי פרט." The toolbar: colours (four drops, then the page fills with Miryam's cream), photo (the hero drops and lands), type (the eyebrow, the name slice by slice, the divider, the text), button, WhatsApp (a green pulse), motion (a light sweep, the photo breathes). "+15%/+20%" flies to "האתר שלכם", which rolls 0→100%; AF lock | whip |
| 7–8 | 13.1–16.9 | "מושלם בטלפון. וגם במחשב." The phone stretches into a desktop browser showing the real desktop site (miryamzelig.co.il); the phone comes back in front; AF lock | whip up |
| 9–10 | 16.9–20.6 | Breakdown, dark: "לקוח לוחץ, ואתם כבר בשיחה." The camera leans in on the site's real "לבדיקת זמינות בוואטסאפ" link, a finger taps it, WhatsApp opens, a visitor types and sends; ✓✓ | zoom-through |
| 11–12 | 20.6–24.4 | Drop: "כל אתר, עם אופי משלו." Five real works are dealt into a fan on the beat (Libi Diamonds, Pizza HaTanur, Koral Events, Pinhas Ratzon, Miryam Zelig in the middle), their names pop; AF lock | flash |
| 13–15 | 24.4–30 | The ticket draws itself: "סטודיו לעיצוב ופיתוח אתרים", the logo, "העסק שלכם. / האתר שמתאים לו.", CTA "לשיחת ייעוץ 050-861-1888", the stamp "עיצוב אישי · בלי תבניות", lawebs.co.il; the finished phone rises below. The cursor clicks on the final hit, confetti, a chime | — |

The pieces are cut from `assets/hd/miryam.jpg` (the live site at 390×844 @3x) at the rectangles measured on the live page (`measure-miryam.mjs`): the photo with the logo, the eyebrow, the name in seven slices, the divider, two lines of text, the button and the WhatsApp link. When the counter locks, the real screenshot settles over the rebuilt page. Every line of text sits between y≈250 and y≈1300 (Reels/TikTok/Shorts cover the bottom); the toolbar and phones run lower as image.

## Pipeline

All timing lives in `index.html` (`T`, `SC`, `CUTS`, `ARR`). The page exports every event so the sound lines up with the picture.

```bash
python -m http.server 4182 --bind 127.0.0.1 --directory video/lawebs-ad
```

Open http://127.0.0.1:4182/ to watch with sound, or `?t=10.5` for a single frame. Render with no npm dependencies (raw DevTools protocol, Chrome must be installed):

```bash
URL=http://127.0.0.1:4182/ node render.mjs timeline.json --events
python soundtrack.py timeline.json out/soundtrack.wav
URL=http://127.0.0.1:4182/ PORT=9420 node render.mjs out/frames --range 0 450
```

Run four ranges in parallel (`PORT=9420…9423`, 0–450, 450–900, 900–1350, 1350–1800). Then `bash encode.sh out/lawebs-ad.mp4` (60 fps H.264, AAC 192k, two-pass loudness normalisation to −14 LUFS / −1.5 dBTP). `node render.mjs out/keys --times 1.2 10.5` renders single frames for review.

## Desktop (16:9)

`wide.html` is the same ad recomposed for a landscape screen (YouTube, the website, desktop feeds). It is not the vertical with bars: the beats, events and soundtrack are identical (its exported timeline matches `timeline.json`), and every scene is laid out again for 1920×1080:

- Hook: "יש לכם עסק?" as one wide line, the seal above the question mark, the UI pieces orbiting in an ellipse.
- Phone scenes (blank page, the build, WhatsApp): the phone on the left, the headline in a right-hand column. In the build, the six tools become a vertical dock on the left and the counter sits under the headline, so "+%" flies across the frame.
- "וגם במחשב": a one-row headline over a large browser window with the real desktop site, the phone in front of it.
- The works: an arc of five cards across the frame, each name under its card.
- End: the finished phone beside a wide ticket (perforated above the CTA), the stamp as a two-line rubber stamp on the ticket's corner.

The renderer takes the frame size from the page's `META`, so the commands are the same with `URL=http://127.0.0.1:4182/wide.html` and frames in `out/frames-wide`; then `FRAMES=out/frames-wide bash encode.sh out/lawebs-ad-desktop.mp4`.

## Sound

`soundtrack.py` is the series engine (no samples, nothing to license), with this ad's harmony (Am–Dm–G–C, so the second drop and the final hit land on C) and its own effects, each placed from the event timeline: a pitched bloop when a tool lights up, a soft tock for every piece that lands, a thump for the photograph and the button, a liquid swell for the colour, a pencil scratch as the wireframe draws, a WhatsApp-like chime, a sparkle for motion, the rolling counter, a whoosh as the phone stretches, keyboard ticks and a send, the cards dealt, the ticket, the click and confetti.
