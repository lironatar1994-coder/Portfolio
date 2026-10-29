# Rethinking LA Webs: Israeli benchmark and redesign

*Prepared 18 Oct 2026. Sources: sub-agent inspections of 24 Israeli studio, freelancer, builder and platform sites; our audit of lawebs.co.il; three redesign directions; and three independent reviews of those directions.*
- *Competitor scores are the inspectors' 1–10 judgments. I did not re-check them.*
- *LA Webs' own score (6 wow, 5 conversion) is my estimate on the same scale. It was not scored blind by the inspection prompt, so treat any comparison with it as a rough guide.*
- *Every repo fact cited with file:line was checked against the working tree on 18 Oct.*

## Verdict in one paragraph

Not yet. The homepage is well built and honest, and it already does something few Israeli SMB-facing studios do: it shows real, named, live client work on the first screen. The first glance is still quiet, for four reasons:
- **The headline is generic and too small.** The H1 "העסק שלך. האתר שמתאים לו." is a slogan any studio could use. It is set in Plex 600 at `clamp(46px, 4.6vw, 68px)` (styles.css:527): about 63px at 1366 and 66px at 1440. That is smaller than the section titles at `clamp(44px, 6vw, 104px)` (styles.css:618), which come out at about 82–86px.
- **The canvas is pale.** It reads as a SaaS template.
- **There is no person and no visible price.**
- **On a 1366×768 laptop the hero buttons start at about y=840.** The only action on the first screen is the "נדבר בוואטסאפ" pill in the header.

The craft is in the motion, and a 3-second glance or a WhatsApp screenshot doesn't show motion.

Only three of the 24 sites score 6 or more on both wow and conversion: M.MEDIA (7/7), Jonny Studio (6/8) and AP Design (7/6). M.MEDIA and AP share four traits:
- huge, heavy Hebrew type;
- one cinematic hero element;
- the founder up front;
- WhatsApp-first contact.

Jonny shares the first two only.

**My recommendation:**
1. **Keep** the palette, both fonts, the deck of real phone cards and the work-first order.
2. **Turn the hero into one bold, restrained poster:** full-bleed cobalt, poster-scale white type, the deck and one CTA.
3. **Give each project exactly one deep slot.**
4. **Add a hands-on Pizza ordering demo,** clearly labelled as a demo.
5. **Add the missing trust layer** (founder, price, business facts) as designed chapters, released only once Liron confirms the facts.

Done in that order, LA Webs would look premium and still show its price openly. None of the 24 sites does both.

**How this direction was chosen.** I drafted three directions:
1. **Showpiece:** the live deck plus poster-scale type.
2. **Trust and conversion:** founder, price and receipts first.
3. **Mobile stories:** an Instagram-style story player.

Two of the three reviewers picked Showpiece as the base, and this plan uses it, with additions from the other two:
- **From Mobile stories:** the thumb dock and the honesty labelling.
- **From Trust and conversion:** the phased rollout, the price and fit content, and the voice rules.

**Rejected:**
- **A story player as the hero.** It is gesture-heavy, it is unclear which way taps should go in RTL, and it throws away a deck that already works.
- **PageSpeed tables on the homepage.**
- **A 15-band homepage.**

## What we benchmarked

| Site | Category | Wow /10 | Conv /10 | The one thing to learn |
|---|---|---|---|---|
| MAKETHECUT | Award studio | 8 | 2 | Type is the hero, and projects sit in a numbered 01–06 index. Case pages link to the live site ("VIEW PROJECT ↗"). Avoid its 4–5 s entry gate and work that only appears on hover. |
| studio&more (nmore) | Award studio | 8 | 2 | One cobalt used as a full-bleed surface, with grotesk vs. italic-serif headline contrast. Its palette is almost ours. It also has a playable "PLAY NOW" mini-game. Avoid its 12,870px of scroll runway. |
| Guts | Award studio | 7 | 3 | Contrasting type voices, and a hand-drawn scribble that points at Contact. |
| Richkid | Award studio | 7 | 4 | A sticky giant "SELECTED WORK" title with project cards stacking over it. Our stack is one step away from this. |
| Hybrid | Award studio (enterprise, Hebrew) | 7 | 3 | Restraint: no accent colour, so all colour comes from the work. Hebrew display type at about 100px, and hairline service rows. |
| Mozi | Award studio | 7 | 3 | Opens on a full-screen kinetic-wordmark showreel, not type. Full-bleed brand panels, one recurring object (a chrome "M"), and a live "you are here" label in the header. |
| Streetlight | Award studio | 6 | 4 | One motif (a streetlamp) returns at the final CTA. A client-product video card sits at the fold, and quote tiles sit next to their project. |
| Muze | Award studio | 6 | 4 | Real team portraits with handwritten name labels. Its comparison becomes stacked cards on mobile. |
| M.MEDIA | Freelancer | 7 | 7 | Founder headshot beside the hero CTA. The "3D" glass cube is just an mp4. |
| AP Design | Freelancer | 7 | 6 | One metaphor carried through every heading, a "מה צריך?" chip intake, and WhatsApp prefills that change with context. Avoid its scroll lock. |
| Jonny Studio | SMB builder | 6 | 8 | A "בקצרה" box (what / how much / how long) right after the hero, and real full-page captures auto-scrolling in frames. Its main CTA is a quiz; WhatsApp is a floating secondary. |
| YMDigital | SMB builder | 5 | 8 | A public 3-tier price ladder, and the form as block 3. Same operator as Yossi Mizrachi (same phone number, same price table). |
| Maimon Badush | Freelancer | 5 | 8 | "From" price next to the founder's portrait, work peeking above the desktop fold, Ploni 900 at 100px, on a light pastel palette. |
| Yossi Mizrachi | Freelancer | 4 | 7 | Price table, hours and a response window in plain sight. |
| Clicky | SMB builder | 4 | 7 | The only homepage before/after, written qualitatively, plus budget-bracket qualifying. |
| Fullpower | SMB builder | 4 | 7 | A round call button in the mobile header and a 2-field form right after the first project. Anti-lesson: several floating buttons overlap. |
| LIN | Platform (Wix agency) | 3 | 7 | Price in the H1 zone and a labelled 2-button sticky bar. A visible number converts even without craft. |
| EKD | SMB builder | 3 | 6 | Work filters that show real counts, and sublines that name a concrete feature. |
| Webey | SMB builder | 4 | 6 | A "למי זה מתאים / לא מתאים" block before a mid-page form, and Reels-style client videos showing their domains. |
| Shiri Laron | Freelancer | 4 | 6 | The mobile CTA sits in the first screen, above the visual, with a first-person founder intro. |
| Webma | Platform | 5 | 5 | Brand-colour cards and mockups that break out of the device frame. Its 3-step process is almost word for word ours. |
| Wix Studio Inspiration | Platform | 6 | 2 | A looping recording of a real site as the proof. Detail pages link "Open Live Site ↗". Avoid the visible like counts. |
| Wix&Me | Platform | 3 | 5 | Anti-lesson: a sticky cluster of 4 unlabelled icons (phone, Facebook, WhatsApp, LinkedIn), where a mismatched number quietly breaks the main path. |
| LANA | SMB builder | 3 | 4 | A site-type selector in the contact form. Anti-lesson: overlays cover about 40% of the mobile screen. |
| **LA Webs (today)** | Studio | **6\*** | **5\*** | \*Author's estimate. Real, captioned work on screen one. Missing a face, a visible price, and a hero CTA above the fold at 1366×768. |

**Group averages, per site** (each of the 24 sites counted once):

| Group | Wow | Conversion |
|---|---|---|
| Award studios (8) | 7.0 | 3.1 |
| SMB builders (7) | 4.1 | 6.6 |
| Freelancers (5) | 5.4 | 6.8 |
| Platforms (4) | 4.3 | 4.8 |

**How tallies are counted below.** "Hebrew SMB-facing" means 15 sites: the 7 SMB builders, the 5 freelancers, and LIN, Wix&Me and Webma. Those 15 sites belong to 14 businesses, because YMDigital and yossimizrachi.co.il are one operator. Tallies count businesses.

## What says "wow" in Israel

1. **Poster-scale type is the hero.**
   - **Award studios:** 7 of 8 open on giant type:
     - MAKETHECUT (Humane ultra-condensed at about 60% of viewport height);
     - nmore;
     - Guts (three typefaces);
     - Richkid ("HI. WE ARE RICHKID");
     - Hybrid (about 100px Hebrew in Leon);
     - Streetlight (PP Formula);
     - Muze (80px statements).
   - **The exception:** Mozi opens on a kinetic-wordmark showreel with no H1.
   - **Hebrew SMB-facing sites:**
     - Maimon: Ploni 900 at 100px.
     - Jonny: 88px with a gradient second line.
     - M.MEDIA: wide heavy Leon, revealed line by line.
     - AP: Secular One with a lime highlighter bar.
     - Yossi: Birzia 900 at 60px.
   - **LA Webs:** an H1 of about 63–66px sits under H2s of about 82–86px, so the hierarchy is upside down.
2. **Two contrasting type voices.**
   - nmore sets facts in a grotesk and emotional words in an italic serif. Guts stacks three voices.
   - Richkid and Mozi escape into English display type.
   - None of the 24 pairs a Hebrew sans with a Hebrew serif. LA Webs already self-hosts IBM Plex Sans Hebrew (400–700) and Frank Ruhl Libre (variable 300–900, styles.css:2–3), so trying this costs no new bytes.
3. **One signature object that comes back:**
   - MAKETHECUT's WebGL moon;
   - Mozi's chrome "M" with rotating Hebrew text;
   - Hybrid's 3D rope;
   - nmore's line stickers and ampersand mascot;
   - Richkid's word-swapping sticker;
   - Streetlight's lamp, which returns at the final CTA.
4. **Something moving in or right after the hero.**
   - Award studios, 7 of 8:
     - Hybrid's chip grows into a full reel;
     - nmore's 3D word tunnel;
     - Mozi's wordmark is the video;
     - Guts and Muze use reel cards;
     - Streetlight uses a product video card;
     - MAKETHECUT has "PLAY SHOW REEL".
   - SMB-facing: M.MEDIA's looping glass cube (an mp4) and Jonny's smoke video.
5. **Work shown as an index or with scroll choreography:**
   - MAKETHECUT: a numbered 01–06 list.
   - nmore: a pinned "01/05" index with a live preview.
   - Richkid: a sticky title with cards stacking over it.
   - Mozi: full-bleed brand panels.
6. **Restrained chrome, so colour comes from the work.**
   - Hybrid has no accent at all. Streetlight, MAKETHECUT and Wix Studio keep the chrome monochrome.
   - nmore carries its brand with a single cobalt (#0B43EE) used as a surface, close to our #244BE8.
7. **Real local presence without stock photos:** MAKETHECUT shows a "[ GMT+3 ]" clock, a street address and a VAT number; nmore shows "TLV" and real studio video.
8. **Small crafted details:**
   - bracketed eyebrows (MAKETHECUT);
   - a live section label in the header (Mozi);
   - a scroll-progress line (nmore, Jonny);
   - a bottom pill nav in the thumb zone (MAKETHECUT, Streetlight);
   - a scribbled ellipse around Contact (Guts).
9. **For a small-business owner, wow means "a real person who clearly can do it."**
   - M.MEDIA and AP combine poster type, one cinematic element, the founder up front and WhatsApp-first contact.
   - Jonny combines the first two, but keeps its founder mid-page and leads with a quiz.
   - Craft without a face or a price reads as distant. A face and a price without craft reads as a template.

**The key observation:** wow and price split cleanly in this set.
- Every site scoring 7 or more on wow hides its price: MAKETHECUT, nmore, Guts, Richkid, Hybrid, Mozi, M.MEDIA and AP.
- Every homepage that shows a price scores 5 or less on wow: YMDigital 5, Maimon 5, Yossi 4, LIN 3.

Premium-and-priced is unoccupied. That may be partly because premium studios avoid a low price anchor. This is why the plan puts the price one tap from the hero, not inside it (section 7).

**Avoid:**
- **Dark violet or indigo as the main accent.** Jonny, M.MEDIA, Webey, YMDigital and Mozi all use it, and so do Guts' scribbles. Jonny's inspector called its look a generic 2025–26 "AI agency" template.
- **Gates and scroll tricks:** MAKETHECUT's 4–5 s entry gate, AP's scroll-locking three.js warp, nmore's 12,870px runway.
- **Work that only appears on hover,** which is invisible on touch screens (MAKETHECUT /work, Guts, Richkid EN).
- **Common award-studio failures:**
  - English-only copy (5 of 8);
  - no WhatsApp (7 of 8; Streetlight has only an unlabelled icon);
  - no price (8 of 8);
  - no CTA in the hero (most).

## What converts Israeli SMB owners

Counts are the inspectors' approximations across the 14 businesses.

1. **Contact within one thumb.**
   - WhatsApp is prominent on about 11 of 14. The exceptions are Webey (footer icon only), LANA and LIN.
   - A phone number shows in the header or a sticky pill on about 10 of 14, including YMDigital/Yossi, EKD, Webey, Fullpower, M.MEDIA, Maimon, Shiri and Wix&Me.
   - Fullpower puts a round call button in its mobile header.
   - **Sticky bars:** only LIN has a clean, labelled 2-button bar. Fullpower stacks several floating buttons, and Wix&Me shows 4 unlabelled icons. Our /lp/short/ already has a labelled 2-button bar (`.lp-bar`, build.mjs:456).
2. **WhatsApp prefills that change with context.** AP prefills "ראיתי את הסרטון…", and Jonny uses separate messages per CTA. Webey and Webma use one generic message.
3. **A real founder face.**
   - 7 of 14 show a face the inspectors actually saw: Clicky (founder card with a quote), Webey (two founders), M.MEDIA, AP, Yossi/YMDigital, Maimon and Shiri. YMDigital's portrait was judged likely staged.
   - M.MEDIA, AP, Yossi and Maimon put the face in the hero.
   - Jonny's founder video rendered empty in every capture, so it isn't counted.
   - Fullpower shows its real office instead. Outside the SMB market, Muze uses real portraits.
4. **A visible price, or at least price bands:**

   | Site | What it shows |
   |---|---|
   | LIN | 1,900 ₪ + 890/year, in the H1 zone |
   | YMDigital / Yossi | 3 tiers + a table: landing page 1,390 ₪, brochure site 4,200 ₪ |
   | Maimon | brochure site from 5,990 ₪ |
   | Clicky | about 6,500 ₪, inside its FAQ |
   | Jonny | quiz bands: under 5k / 5–15k / 15k+ |
   | Webma | budget chips from 5k to 50k+ |

   LA Webs' 2,500 ₪ is the lowest custom-build price in the set. That is a strong value message, and also a low anchor.
5. **Early lead capture that qualifies the visitor.**
   - Most businesses have an inline homepage form; the inspectors counted about 12 of 15 sites.
   - YMDigital's form is block 3, and Fullpower's 2-field form follows the first project.
   - The typical form is name + phone + type. Maimon and Fullpower skip email.
   - Qualifying chips or steps:
     - AP: "מה צריך?" chips.
     - Jonny: type → stage → budget → phone.
     - Clicky: budget and timeline.
     - LANA: "סוג אתר".
     - Webma: budget chips.
6. **Specific risk reducers.**
   - "Free consultation / no commitment" is now generic: Clicky, Jonny, M.MEDIA and Webma all use it.
   - Response-time promises are rarer: Jonny ("תוך שעה" / "יום עסקים") and Yossi ("מענה תוך כ-24 שעות").
   - AP: "בלי מוקד ובלי בוטים".
7. **Concrete timelines:** LIN (within a week), YMDigital (7 business days), Webey (14), Clicky (about 18 work days), Jonny (2–3 or 4–6 weeks).
8. **Blocks that help a visitor decide if they fit.**
   - Webey: fit / not fit.
   - Jonny: a "בקצרה" box, plus a comparison table that gets clipped on mobile.
   - Muze: a comparison done as stacked cards on mobile.
9. **A Google rating near the hero:** YMDigital/Yossi, Clicky, Jonny and Maimon (4 businesses). Only once real reviews exist.
10. **Real-client logo strips:** YMDigital, Fullpower (inside the first viewport), Jonny, M.MEDIA, LANA, Shiri and Webma. Only with each client's permission.

**Anti-lessons:**
- **Overlays covering 15–40% of the phone screen:** LANA (about 40%), Muze and Richkid (about 20%), EKD (15–25%), Maimon (about 15%), Yossi (about a quarter), and three stacked overlays on M.MEDIA.
- **Contradictory self-declared metrics:**
  - YMDigital: "+120 / 7 days" against "+30 / 14 days";
  - Jonny: the same "+200%" badge on every card;
  - AP: stats on signs held by aliens;
  - LANA: freepik credits on mockups.

## Where LA Webs stands

### Keep
- **Real, named, captioned client work on the first screen, with a pause control.**
  - Among Hebrew SMB-facing sites, EKD, Webma and Shiri also put work in the hero, but theirs is uncaptioned, unreadable on mobile or caught mid-crossfade. Maimon's work peeks above the desktop fold.
  - Streetlight (a product video card) and Wix Studio (Site of the Week) each lead with a single piece.
  - A captioned, pausable deck of several named client sites is the most complete version of this among the 24.
- **Phone-first proof:** a browser and a phone for every project, with the real domain in the address bar. YMDigital and Yossi show no phone mockups even on mobile, M.MEDIA uses identical MacBooks, and Wix shows desktop crops on phones.
- **A case page and a live link for every project.**
  - Jonny, MAKETHECUT ("VIEW PROJECT ↗") and Wix Studio's detail pages ("Open Live Site ↗") also do both.
  - M.MEDIA, Maimon, Yossi and LIN link only off-site; LANA and Webey only internally.
  - Our case pages already have "רוצים אתר כזה?" prefills that name the project.
- **The sticky stacking brand-colour panels.** The panel underneath scales to 0.94 and darkens. This is close to Richkid's best move.
- **Motion that respects visitors:** reduced-motion handling, a pause control (WCAG 2.2.2) and no overlay widget.
  - Compare MAKETHECUT and M.MEDIA, whose videos ignore reduced motion; AP's 4–5 s scroll lock; nmore's blank transition panels.
- **Clean mobile screens** with no overlays.
- **Copy written in the client's own words.**
- **The huge tappable phone number and the giant Frank Ruhl "LA webs." footer.**
- **The studio palette and both fonts.**
- **/lp/ and /lp/short/:**
  - the price bullet;
  - the chat-styled form (`leadForm`, build.mjs:388);
  - the sticky bar;
  - `?t=` headline matching;
  - a fast LCP.
- **Zero fabricated proof.**

### Fix
- **Brand split.**
  - `makePage` in seo.mjs:62 emits `<html lang="he" dir="rtl">` with no `data-theme`. As a result /services/, the 4 service pages and /about/ fall back to the `:root` "paper" theme (ivory and terracotta).
  - `htmlOpen` (build.mjs:58) carries `data-theme="studio"` but is not exported. `theme` and `themes` are exported (build.mjs:56–57).
  - The leftover theme switch (paper, cobalt, night, night-cobalt) is why a page without the attribute falls into the old look.
- **Inverted hierarchy.**
  - Desktop: the H1 is `clamp(46px,4.6vw,68px)` in Plex 600 (styles.css:527); the H2 is `clamp(44px,6vw,104px)` (styles.css:618).
  - Phones: the H1 is about 37px at 390 (`clamp(34px,9.4vw,50px)`, styles.css:652); the H2 is about 43px (`clamp(40px,11vw,58px)`, styles.css:671).
- **Hero CTA below the fold at 1366×768.** The hero buttons start at about y=840, so only the header pill is visible on the first screen (probe-home-1366.png). The desktop header shows no phone number.
- **Price hidden** inside the closed "כמה זה עולה?" FAQ answer, while /lp/short/ shows it in its hero.
- **No human.** The founder appears only as one grey line under the SEO block.
- **Pizza HaTanur is presented like a restaurant client.**
  - On the homepage it is the front hero card, the first featured panel and both process scenes (the chat at build.mjs:146, "פיצרייה ברמת גן", and the wireframe and go-live scenes). Its case page says it is a demo with no real order or payment (seo.mjs:93).
  - The Google Ads sitelink "העבודות שלנו" reads "פיצה, אירועים, עורך דין ועוד / אתרים אמיתיים שבאוויר עכשיו" (ads-campaign.mjs:66).
  - The hazmanot ad group says "ראו את פיצת התנור" (ads-campaign.mjs:69).
- **Repetition.** Pizza and Miryam each appear 3–4 times, so 9 projects feel like 2.
- **Three of four featured panels are near-black and sit back to back:** Pizza #141614, Koral #1b0f24, Pinhas #14110c. The Pizza panel also has about 170px of empty space at the top.
- **Hidden projects and cluttered labels on mobile.** "עוד עבודות" hides 5 projects behind a swipe, and the back-card name labels in the hero hand pile up.
- **The Miryam slider is labelled "לפני / אחרי"** (build.mjs:28–36). It compares makeup photos (alt "לפני האיפור"), and projects.mjs:47–48 lists before/after images as part of Miryam's site. It must never be presented as a website redesign.
- **Plural studio voice implies a team.** About 30 occurrences:

  | File | Count | Notable lines |
  |---|---|---|
  | build.mjs | 17 | "אנחנו" at 167, 174, 214, 215 and in the legal pages (349–356); "שלנו / מאיתנו / אצלנו" at 103, 202, 231, 296, 487 |
  | seo.mjs | 7 | homeDescription "דברו איתנו"; case pages "מה פיתחנו" at :93 |
  | seo-content.mjs | 1 | |
  | ads-campaign.mjs | 4 | |
  | docs/ads/prompts.md | 1 | |

  PRODUCT.md:15 rules out fabricated team sizes.
- **The /lp/short/ wordmark pill is cramped:** 97px wide, against 133px on the homepage.
- **The services hub H1 reads "מה צריך לבנות?."** (seo.mjs:81).
- **Stale comment.** build.mjs:364 says the landing page is "Not indexed". Since commit 50b6c02, seo.mjs:103–106 sets both /lp/ and /lp/short/ to `index,follow`, with /lp/short/ canonical to /lp/.
- **No FAQPage markup exists**, in the scripts or on the built homepage. Adding it would not protect SEO: since August 2023 Google shows FAQ rich results only for well-known government and health sites.

### Drop
- The slogan and the SEO lede as the hero. The slogan becomes the closing line, which matches the ad's end card.
- The cobalt period after every H2.
- The "הבא בתור" panel with its monogram card.
- The "עוד עבודות" swipe strip.
- The full-screen decorative Miryam phone in "ובכל אתר שיוצא מאיתנו".
- The grey SEO prose block. Its links move into designed service rows.
- The process title "מרעיון לאתר באוויר", which is close to Webma's "מרעיון למוצר דיגיטלי", together with its Pizza scenes.
- `.wa-float` (build.mjs:298), replaced by the sticky bar.
- The mobile "לעבודות" link.
- "בלי עלות ובלי התחייבות" as the headline reassurance. It moves to small print.
- The unused colour themes.

## The new homepage, section by section

**Shape.** Eight content bands plus a header and footer, against eleven today.

**Rules for the whole page:**
- **Each project appears at most twice:** once as a teaser card in the hero deck that links down, and once in its own slot. Pizza appears once, as the demo.
- **No project count and no kicker lines.** Both are standing decisions in DESIGN.md:62 and DESIGN.md:27. Reversing them is listed under "What I need from you".
- **Voice.** Default to an impersonal "LA webs". Use first person ("אני") only in the founder chapter, after sign-off. Address visitors in the plural.
- **Anchors that stay:** `#work`, `#process`, `#faq`, `#contact`, `#services`, `#more` and `#project-<slug>`. They are used by the nav, the footer, /about/, the 404 page, the case-page breadcrumb schema ("/#work"), the hero links and the Ads sitelink.
- **New anchors:** `#demo`, `#founder`, `#price`.
- **Phase tags** on each item: **[P0]** quick wins, **[P1]** core rebuild, **[P2]** needs owner input.

### 1. Header and persistent contact layer
- **Hebrew:**
  - [P1] nav: העבודות · נסו בעצמכם · התהליך · שאלות
  - [P2] nav: העבודות · נסו בעצמכם · מחירים · מי בונה
  - Then 050-861-1888 and **נדבר בוואטסאפ**.
- **Purpose:** keep WhatsApp and a phone call one tap away on every screen, and show the number on desktop.
- **Content:**
  - Wordmark on the right, four nav links, a `tel:` link inside `<bdi>`, and a navy WhatsApp pill.
  - Mobile header: wordmark, a 44px round call button and a 44px menu button. The menu sheet repeats the links and adds a large WhatsApp button and a large call button.
  - Mobile sticky bar with two equal, labelled buttons: **וואטסאפ** (filled) and **חיוג** (outline).
  - [P2] Liron's 24px avatar on the bar's WhatsApp button, so a face is one thumb away without crowding the hero (Maimon's inspector suggested this).
- **Desktop design:**
  - 72px sticky header that compacts to 56px after 80px of scroll.
  - Solid daylight at 96% (the existing studio rule, styles.css:1362). No `backdrop-filter` blur, which is costly on mid-range Android.
  - A 2px cobalt scroll-progress line using `animation-timeline: scroll()`. It is decorative, so it can simply be absent where unsupported.
  - Below about 1200px the nav collapses into the menu.
- **Mobile design:**
  - The bar is 60px plus `env(safe-area-inset-bottom)`, about 8% of the screen.
  - It slides in once the hero CTA leaves the viewport.
  - It hides over `#contact`, while an input has focus, and while the demo dialog is open.
  - The body gets matching bottom padding.
  - It is one shared component with `.lp-bar`.
- **Replaces:** a header with no phone number, and `.wa-float`.
- **Evidence:**
  - A phone number in the header or a sticky pill on about 10 of 14 businesses.
  - Fullpower's round call button in its mobile header.
  - LIN's labelled 2-button bar.
  - Progress lines on nmore and Jonny.
  - The anti-lessons: overlays covering 15–40% of the screen on LANA, Muze, Richkid, EKD, Maimon and Yossi; Wix&Me's unlabelled icons.

### 2. Hero: a cobalt poster with the live deck
- **Hebrew:**
  - **H1:** line 1 **קודם תראו,** line 2 **אחר כך נדבר.**
  - **Sub-line:** "בניית אתרים ומערכות לעסקים, בעיצוב אישי. כל קלף כאן הוא אתר שבאוויר עכשיו." Add "ובקוד שנכתב מאפס" only after Liron confirms it for all projects. The site already says "בלי תבניות" (build.mjs:166, 170, 430).
  - **CTA:** **נדבר בוואטסאפ**, plus the text link "או 050-861-1888".
- **Purpose:** one dominant idea in three seconds, recognisable as LA webs in a screenshot, with an action on the first screen at every size.
- **Content:**
  - Only the H1, one sub-line, the CTA with the phone link, and the deck. No facts row, no founder chip, no router. This is the restraint MAKETHECUT, Guts and Hybrid use.
  - **Deck on desktop:** five cards. Pinhas, Koral, **Miryam (front)**, Reuven, Libi.
  - **Hand on mobile:** eight cards, every project except Pizza, with Miryam in front.
  - **Each card has:**
    - a "● באוויר · domain" pill, driven by a liveness check (static dot, no endless pulse);
    - a caption with name and kind, e.g. "מרים זליג · אתר תדמית";
    - a link to its slot (`#project-<slug>`);
    - a ↗ link to the live site.
- **Desktop design:**
  - **Layout:** full-bleed cobalt #244BE8. Copy takes the right 6 columns. The deck takes the left 6, bleeding about 40px off the edge and slightly below the fold.
  - **Type:**
    - The H1 is white.
    - Line 1: Plex 700 at `clamp(44px,4.6vw,72px)`.
    - Line 2: the display voice at `clamp(64px,7.6vw,116px)`, line-height 0.95. That is about 104px at 1366 and 109px at 1440, the largest type on the page; every H2 is capped at 72px. Frank Ruhl Libre 900 is recommended for this line, pending the test below.
    - The period on line 2 is in the light tint #9CAEFF.
    - Sub-line: 19px in #E8EDFF, about 5.5:1 on cobalt.
  - **CTA:** a white 56px pill with navy text.
  - **The deck keeps:** the deal-in and spring-open, the 4 s rotation with progress line and pause, and the living tour of each capture.
  - **The deck adds:** visible 44px previous and next buttons (white outline), and a lift on hover or focus.
  - **LCP:** the front card is the only eager image, with `fetchpriority=high`.
- **Mobile design:**
  - Cobalt surface, with the 60px header pills in daylight.
  - **H1:** line 1 at 34px; line 2 at `clamp(40px,12.5vw,56px)`, about 45px at 360 and 49px at 390. That keeps "אחר כך נדבר." on one line in a 328px column.
  - Sub-line at 16px over two lines.
  - A full-width 52px white CTA.
  - Then the hand, about 300px tall:
    - only the front card shows its name label;
    - swipe advances;
    - 44px previous, pause and next buttons sit under the caption.
  - No "לעבודות" link.
- **Acceptance test (Playwright):**
  - At 1366×768: the CTA bottom is at 560px or less, and the top of the front card is visible.
  - At 1440×900: the top of the work section peeks in.
  - At 390×844, and at 390×690 (the Instagram and Facebook in-app browsers): the CTA and the top of the front card are visible.
  - At 360×740: line 2 does not wrap.
  - At 320px: no horizontal overflow.
- **Check before Phase 1 ships:**
  - Build three versions, switchable with `?hero=`, reusing the session-switch pattern from build.mjs:59:
    - **A (recommended):** cobalt, Plex 700 on line 1 and Frank Ruhl 900 on line 2.
    - **B:** cobalt, Plex weight contrast only (Plex 400 on line 1, Plex 700 on line 2).
    - **Control:** today's hero.
  - Show static 3-second phone screenshots to five business owners and ask three things: what does this company do, does it look cheap or expensive, would you message them?
  - Ship A, unless B reads clearly more premium or A reads as "old" or "newspaper".
- **Replaces:**
  - the centred slogan H1;
  - the SEO lede (seo.mjs rewrites it, so change both in the same commit);
  - the centred fan with its CTAs at y≈840–898.
- **Evidence:**
  - 7 of 8 award studios open on type. Maimon runs 100px, Jonny 88px.
  - nmore uses cobalt as a full surface.
  - MAKETHECUT, Guts and Hybrid show restraint: one dominant element.
  - M.MEDIA uses one cinematic element.
  - Shiri keeps its mobile CTA in the first screen.

### 3. The work: featured panels plus the rest, filtered by need
- **Hebrew:**
  - **H2:** העבודות.
  - **Chips:** הכול · אתר או דף נחיתה · קטלוג מוצרים · הזמנות, הרשמה ומערכות · משהו אחר? כתבו בוואטסאפ.
  - **Second list:** H3 עוד עבודות.
- **Purpose:** show four brand worlds in depth and the rest compactly, and let an owner see "work like what I need" in one tap.
- **Content:**
  - **Need chips** (`aria-pressed` buttons) filter this section in place. The groups follow the four service pages (`projectService`, seo-content.mjs:73), so each has 2–4 real examples:

    | Chip | Shows |
    |---|---|
    | אתר או דף נחיתה | Miryam, Pinhas, SOS |
    | קטלוג מוצרים | Reuven, Libi |
    | הזמנות, הרשמה ומערכות | Koral, Seder, PDF Studio, plus a link "נסו את הדגמת ההזמנות ↓" to `#demo` |
    | משהו אחר? | opens WhatsApp with "היי LA webs, יש לי עסק בתחום…" |

    - No counts.
    - A "הצגת הכול" reset.
    - Without JavaScript, each chip is a link to its service page.
  - **Featured panels**, alternating dark and light, set by changing `featuredOrder` at build.mjs:90:

    | Order | Project | Background | Accent |
    |---|---|---|---|
    | 1 | Koral | #1b0f24 | #e8607f |
    | 2 | Miryam | #f3e2da | #b57a61 |
    | 3 | Pinhas | #14110c | #c19b45 |
    | 4 | Reuven | #dfe9f7 | #0f55bd |

    Each panel has:
    - the name in the display face;
    - the headline from projects.mjs and a 2-line description;
    - 3 scope pills;
    - the "● באוויר · domain" pill;
    - a primary **לאתר החי ↗** button and a secondary **איך זה נבנה** button;
    - the text link **רוצים משהו כזה?**, whose prefill names the project;
    - [P2] a status tag.

    Miryam's scope pill reads "השוואת איפור לפני/אחרי" and links to Miryam's case page.
  - **"עוד עבודות":** Libi, SOS, Seder and PDF Studio as rows. Each row has a thumbnail, name, kind, domain with its live dot, a case link and a ↗ link.
- **Desktop design:**
  - **Stack:**
    - An `aria-hidden` ghost word "העבודות" (display face, about 18vw, navy at 6%) is pinned behind the stack, as on Richkid.
    - The existing stacking stays.
    - Names at 80px.
    - Mockups are top-aligned, so the empty band disappears.
    - Tours run at 24px/s and pause on hover, focus and under reduced motion.
    - Client accents colour the tag dots and focus rings.
  - **"עוד עבודות":** 2 columns of 96px hairline rows. Row structure:
    - the title link is stretched over the whole row with `::after`;
    - the ↗ link is a sibling with `position:relative; z-index:1` and `aria-label="לאתר של X, נפתח בחלון חדש"`;
    - so no interactive element is nested inside another.
  - **Filtering:**
    - Non-matching panels and rows are hidden.
    - Focus moves to the H2.
    - A polite `aria-live` region announces "מוצגות עבודות מסוג: קטלוג מוצרים".
- **Mobile design:**
  - Chips wrap onto 2–3 rows.
  - Each panel takes about one screen, visual first: the touring phone, the name at 40px, the pills, two 48px buttons, then the WhatsApp link. No scale-and-darken effect.
  - "עוד עבודות" becomes 4 stacked cards of about 112px.
  - Nothing sits behind a swipe.
- **Replaces:**
  - the "העבודות." stack (Pizza first, three dark panels);
  - the "הבא בתור" panel;
  - the "עוד עבודות." swipe strip.
- **Evidence:**
  - Richkid's sticky title with stacking cards; Mozi's full-bleed panels; Webma's brand-colour cards; Hybrid's one-line benefit per project.
  - MAKETHECUT's and nmore's indexes.
  - Hover-only failures on MAKETHECUT /work, Guts and Richkid EN.
  - Work filters on Mozi, Muze, Fullpower, EKD, LANA, Clicky and Webma.
  - Industry pages on Clicky (about 20) and Webma (10) are thin SEO doorways. One-industry-per-project chips would also expose how thin each vertical is, which is why the router filters by need.

### 4. Try it yourself: the Pizza demo
- **Hebrew:**
  - **H2:** נסו בעצמכם: הזמינו פיצה.
  - **Status pill:** "פרויקט הדגמה · שום הזמנה לא נשלחת".
- **Purpose:** the most honest wow available. Visitors use a system the studio built, which also shows that LA webs builds systems, not only brochure sites.
- **Content:**
  - **Lede:** "מערכת ההזמנות הזו נבנתה ב-LA webs כהדגמה. בחרו גודל, הוסיפו תוספות לחצי פיצה ותראו את המחיר מתעדכן. שום הזמנה לא נשלחת ושום תשלום לא נגבה." The no-order statement is already published at seo.mjs:93.
  - **Three callouts:** "הפיצה נבנית מול העיניים", "תוספות לחצאים", "סל וקופה בטלפון".
  - **CTA:** **רוצים מערכת כזו לעסק?**, prefilled "היי LA webs, ניסיתי את הדגמת ההזמנות באתר ואשמח למערכת כזו לעסק שלי".
  - A link **פתחו במסך מלא ↗**.
- **Desktop design:**
  - Pizza's own charcoal #141614 with a fire-red #d2321f glow.
  - **[P1]** A phone poster and a button that opens /PizzaManager/ in a new tab.
  - **[P2]** A click-to-load iframe of `/PizzaManager/?embed=1` inside the phone. It has a `title`, a pinned demo banner, and a **סגירה** button that returns focus to the trigger. The iframe never loads with the page.
- **Mobile design:**
  - The poster and a 56px button.
  - [P2] A full-screen `<dialog>` (100dvh):
    - a top bar "הדגמה · פיצת התנור" with "✕ חזרה";
    - the iframe loads only when the dialog opens;
    - focus stays inside the dialog;
    - Esc and Android Back (via `history.pushState`) close it;
    - the sticky bar is hidden while it is open.
  - Never an inline iframe on mobile, because it traps page scrolling.
  - A "דלגו על ההדגמה" skip link.
- **Replaces:** Pizza as the front hero card, as the first featured panel, and in both process scenes.
- **Evidence:**
  - No SMB-facing site lets a visitor try a working system of the kind they would buy, such as ordering or registration. The closest are:
    - Jonny's auto-scrolling captures;
    - Wix Studio's and Streetlight's recordings;
    - nmore's "PLAY NOW" mini-game and the free generator tools on YMDigital and Yossi, which are interactive but are not client systems.
  - Only EKD (a "POS integration" subline) and Jonny (a nav label) even mention systems.

### 5. Process: three steps, real artefacts only
- **Hebrew:**
  - **H2:** מתחיל בהודעה, נגמר בלינק.
  - **Steps:** "1 · הודעה אחת", "2 · רואים את האתר מתקדם", "3 · באוויר, ומוכן לשליחה".
- **Purpose:** show how working together goes, without inventing a conversation and without reusing client assets.
- **Content:**
  1. **One message.** The actual text the WhatsApp button sends, shown as an outgoing bubble labelled "ההודעה שתישלח". Line: "כותבים מה העסק עושה ומה צריך. אפשר גם להתקשר."
  2. **Watching the site progress.** A scene clearly labelled "המחשה", built in studio colours only (a wireframe phone with palette and font chips, no client palette). Line, reusing copy that is already published (build.mjs:166): "רואים את האתר מתקדם לאורך כל הדרך."
     - [P2] Swap in a real early design frame from a project, with that client's OK.
  3. **Live and shareable.** A real screenshot of lawebs.co.il's own WhatsApp link preview, so no client permission is needed. Line: "ככה נראה לינק של אתר כששולחים אותו בוואטסאפ. נסו עם הלינק של האתר הזה."
  - "בדרך כלל: X ימים" chips appear only once Liron supplies real durations [P2].
  - The "ובכל אתר" checklist moves to the price chapter.
- **Desktop design:**
  - The navy chapter stays, with three columns and serif numerals.
  - The step-1 bubble is drawn from the visitor's phone: their outgoing message sits on the inline-end side (left in RTL, as Hebrew WhatsApp shows it), in cobalt-tint #E8EDFF rather than WhatsApp green.
  - Scenes fade and rise 8px once as they enter; under reduced motion they are static.
- **Mobile design:** stacked steps, about 1.5 screens.
- **Replaces:**
  - "מרעיון לאתר באוויר." and its scenes (the chat at build.mjs:146 and the go-live scene are both Pizza);
  - "ובכל אתר שיוצא מאיתנו:" and its decorative phone.
- **Evidence:**
  - Webma's "מרעיון למוצר דיגיטלי" and its three steps; M.MEDIA's three steps.
  - Timelines on LIN, YMDigital, Webey, Clicky and Jonny.
  - None of the 24 shows its WhatsApp link preview.
  - AP carries one metaphor through every heading ("בואו נמריא" … "ההודעה נחתה אצלי").

### 6. Founder [P2]
- **Hebrew:** H2 **מדברים ישירות עם מי שבונה**.
- **Purpose:** the biggest missing trust lever, designed as a chapter that comes after the proof.
- **Content:**
  - A real 4:5 portrait.
  - **לירון עטאר** and "מייסד LA webs · אפיון, עיצוב ופיתוח".
  - Three short first-person lines that Liron writes personally. Direction: "מהשיחה הראשונה ועד אחרי ההשקה, מדברים איתי. מי שמעצב את האתר הוא מי שעונה בוואטסאפ."
  - **Commitments, each shown only once confirmed:**
    - "מי שמעצב הוא מי שעונה".
    - "כל אתר נכתב מאפס". Already claimed on the site; Liron confirms it for all 9.
    - "חוזרים באותו יום". The FAQ already promises this (build.mjs:211); keep it only if it is kept in practice.
    - "נגישות ומהירות בנויות פנימה". Any "בלי תוסף" wording waits for an audit.
  - **Business facts:** עוסק number · service area · hours.
  - **CTA:** **לכתוב ללירון בוואטסאפ**, prefilled "היי לירון, ".
  - A hidden slot for the Google rating.
- **Desktop design:**
  - Daylight surface. Cobalt is reserved for the hero and the close.
  - The photo takes the right 5 columns, radius 24. No cut-out and no stock.
  - Name in the display face at 64px.
  - A navy pill CTA.
- **Mobile design:** photo first, title at 36px, the lines, the facts as a list, and a full-width CTA. About one screen.
- **Ships only with a real photo.** There is no placeholder version of this chapter.
- **Replaces:** the grey line "מאחורי LA webs עומד לירון עטאר…" inserted by seo.mjs.
- **Evidence:**
  - Founder faces on 7 of 14 businesses; M.MEDIA, AP, Yossi and Maimon put theirs in the hero.
  - Muze's portraits.
  - MAKETHECUT's VAT number and address; Yossi's hours.

### 7. Prices and services
- **Hebrew:**
  - [P1] H2 **מה אפשר לבנות** over the service rows.
  - [P2] H2 **כמה זה עולה? הכול כתוב כאן**.
- **Purpose:** state the price openly, and keep the internal links to the 4 service pages without a grey wall of text.
- **Where the price goes:**
  - The number lives here, in the "מחירים" nav item and in the FAQ. **Not in the hero.**
  - 2,500 ₪ is the lowest custom-build price in the benchmark: YMDigital's brochure site is 4,200, Maimon starts at 5,990, Clicky averages about 6,500 and Jonny's bands start at 5–15k. Put in the first viewport of a page meant to look premium, it risks reading as "cheap".
  - Paid visitors arrive from ads that already state the price, so /lp/ and /lp/short/ keep it as a hero bullet.
  - Revisit with data after 6 weeks: share of visitors reaching `#price`, and ticket CTA clicks.
- **Content:**
  - **[P2] The ticket:**
    - "אתר תדמית לעסק" and **החל מ-2,500 ₪**, with the VAT status.
    - "What's included", each item verified by Liron: עיצוב אישי · מותאם לטלפון ומהיר · מוכן לגוגל · וואטסאפ וחיוג בלחיצה · דומיין, אחסון ואבטחה (year one, or a stated yearly cost) · ליווי אחרי ההשקה (with its real scope).
    - **מה משנה את המחיר:** מספר עמודים, מערכות (הזמנות, הרשמה, קטלוג), כתיבת תוכן וצילום.
    - **הצעה מסודרת לפני שמתחילים**.
    - CTA **לקבל הצעה בוואטסאפ**, prefilled "היי LA webs, אשמח להצעה לאתר תדמית (החל מ-2,500 ₪)".
  - **[P2] Fit cards:** "מתאים לכם אם…" and "פחות מתאים אם…", with lines Liron signs off on.
  - **[P1] Four service rows:** בניית אתרים לעסקים · דפי נחיתה · קטלוגים דיגיטליים · מערכות ואפליקציות ווב.
    - Each row has a title, one line from seo-content.mjs, and an arrow to `/services/<slug>/`.
    - [P2] Each row gets "החל מ-X" only if Liron supplies X; otherwise "לפי אפיון, הצעה מסודרת לפני שמתחילים".
    - No row numerals: DESIGN.md:27 retired numerals like these.
    - No project chips: the examples live on the service pages, which avoids repetition.
- **Desktop design:**
  - The ticket is a white card about 560px wide, with perforated notches and a dashed divider. It echoes the ad's ticket end card. The price is in the display face at 120px with tabular numerals.
  - The fit cards sit beside the ticket.
  - The service rows run full width. On hover or focus a row gets a 4% navy fill and its arrow moves 8px.
- **Mobile design:** a full-width ticket with the price at 72px, a single-column list, service rows of about 96px, and stacked fit cards. About 2 screens.
- **Replaces:**
  - the price inside the FAQ;
  - "ובכל אתר שיוצא מאיתנו";
  - the grey SEO block. seo.mjs:70–71 inserts that block before `section.contact`; remove the insertion and render the rows in build.mjs with `id="services"`.
- **Evidence:**
  - Prices shown on LIN, YMDigital, Yossi and Maimon, and in Clicky's FAQ.
  - Every site with wow of 7 or more hides its price.
  - Webey's fit / not fit; Jonny's "בקצרה".
  - Hybrid's hairline department rows; Richkid's service rows.

### 8. FAQ
- **Hebrew:** H2 **שאלות לפני שכותבים**.
- **Purpose:** clear the remaining doubts about lock-in and hidden costs.
- **Content:**
  - **[P1]** The current questions, rewritten in the impersonal voice (build.mjs:214–215). "כמה זה עולה?" keeps its existing answer until the price chapter ships, then becomes a link to `#price`.
  - **[P2] New questions, answered with Liron's facts:**
    - כמה זמן לוקח? (real ranges only)
    - מה צריך להכין?
    - למי שייכים האתר והדומיין?
    - מה קורה כשצריך שינוי אחרי ההשקה?
    - אפשר לחדש אתר קיים?
  - "האתר יופיע בגוגל?" keeps the honest seo-content wording, with no ranking promises.
- **Desktop design:** a sticky title in Plex 700 at 56px with no period, and a hairline accordion whose + rotates to ×.
- **Mobile design:** 56px rows, about 0.8 screen when closed.
- **Replaces:** "שאלות שחוזרות."
- **Evidence:** an FAQ appears on about 4 of 15 Hebrew SMB-facing sites. Clicky hides its price in one, which is the pattern we are leaving. Muze tucks a comparison into an FAQ answer.

### 9. Closing: your card joins the deck
- **Hebrew:**
  - **H2:** **העסק שלך. האתר שמתאים לו.** This is the ad's end-card line and the one deliberate singular "שלך". The period returns here in the light tint.
  - **Dashed card label:** **הקלף הבא: העסק שלכם**.
- **Purpose:** end the story the hero started, with one qualifying intake that still sends in one tap.
- **Content:**
  - **The deck returns:** four real cards at 40% opacity (decorative, `aria-hidden`) fanned around a dashed empty card.
  - **A composer reusing `leadForm()` (build.mjs:388):**
    - "מה צריך?" chips: אתר לעסק / דף נחיתה / קטלוג מוצרים / מערכת הזמנות או הרשמה / עוד לא בטוח/ה.
    - "יש אתר היום?" כן / לא.
    - An optional "שם העסק" field.
    - [P2] Budget-band chips, only if Liron supplies the bands.
  - **Live preview:** as the visitor chooses and types, the dashed card draws a matching wireframe and shows the business name in the display face. It is `aria-hidden` and labelled "תצוגה בלבד".
  - **Sending:**
    - The composed message is shown as plain text above the button.
    - **שליחה בוואטסאפ** works with zero selections.
    - Nothing is stored.
  - **Below the composer:** the huge `tel:` number, the hours [P2], small print "שיחת היכרות קצרה, בלי עלות", and [P2] a founder mini-row "ההודעה מגיעה ישירות ללירון".
- **Markup:** a single `<section class="contact" id="contact">` with no nested `<section>`. seo.mjs:60 copies it into every service page and /about/ using a non-greedy regex. In the same commit, move seo.mjs to explicit marker comments so markup changes can't break it silently.
- **Desktop design:**
  - Full-bleed cobalt; the H2 in white display type at 96px.
  - Card on the left, composer on the right.
  - The phone number in the display face at 72px.
  - Today's empty cobalt (about 250px) under the CTAs is removed.
- **Mobile design:** the H2 at 36px, a mini card about 160px tall, the composer, a full-width white pill and the phone number at 40px. The sticky bar is hidden here.
- **Replaces:** "הבא בתור: העסק שלך." and "בואו נבנה את האתר שלכם."
- **Evidence:**
  - Streetlight's lamp returns at its final CTA; award studios close on a giant line.
  - Chip intake on AP, Jonny, Clicky and LANA.
  - Inline forms on most SMB-facing businesses.
  - The chat-style form already works on /lp/short/.

### 10. Footer
- **Hebrew:** the giant **LA webs.** wordmark.
- **Purpose:** a confident sign-off with the local facts Israeli owners look for.
- **Content:**
  - The current wordmark.
  - [P2] A facts line: LA webs · לירון עטאר · עוסק [מס׳] · service area · hours · 050-861-1888 · Google Business link (once reviews exist).
  - Links: the 4 service pages, העבודות, מחירים, מי בונה (/about/), the privacy policy and the accessibility statement.
- **Desktop design:** as today, plus the facts line in Plex 500 at 14px above a hairline.
- **Mobile design:** facts first, then links in 2 columns.
- **Evidence:** MAKETHECUT shows its VAT number and address; Yossi shows hours.

## Visual direction

**Decision: the studio palette and both fonts stay. What changes is how they are used.** Three reasons:
1. **They are already everywhere.** They are committed in DESIGN.md and live on the homepage, /lp/, the ads and the share images. Replacing them means redoing all of that.
2. **Cobalt is a differentiator in Israel.** The SMB-facing default is violet or indigo (Jonny, M.MEDIA, Webey, YMDigital, Mozi), and nmore shows that a single cobalt can carry a whole brand.
3. **The audit found a usage problem, not a colour problem:** an upside-down hierarchy, a pale hero and a tic-like period.

**Typography.**
- **IBM Plex Sans Hebrew 700** carries facts, UI and line 1 of headings.
- **The display voice** carries the emotional line or word: H1 line 2, project names, the price, the phone number and the closing line. The recommendation is **Frank Ruhl Libre 900**: already self-hosted and already the wordmark face, so it ties headings to the brand.
- **Treat Frank Ruhl as a hypothesis.** It is the classic Hebrew book and newspaper face, and nobody in the market pairs it with a sans. That gap may be deliberate. The 5-owner screenshot test (section 2) decides between it and Plex weight contrast before DESIGN.md is updated.

| Role | Desktop | Mobile | Notes |
|---|---|---|---|
| H1 line 2 | `clamp(64px,7.6vw,116px)` | `clamp(40px,12.5vw,56px)` | the largest type on the page; must not wrap at 360px |
| H1 line 1 | `clamp(44px,4.6vw,72px)` | 34px | Plex 700 |
| H2 | `clamp(34px,4.6vw,72px)` | 32–40px | always smaller than the H1, no period |
| Body | Plex 400, 17–18px | 17px | line-height 1.6 |

- Numerals are tabular. Phone numbers and domains go in `<bdi>`.
- The cobalt period is retired from every H2. It stays only on the H1, the wordmark and the closing line, so it means something again.
- No kicker lines (DESIGN.md:27).

**Colour.**
- **Tokens:** daylight #F7F9FC, navy #17243B, cobalt #244BE8, secondary #52627A (about 5.9:1 on daylight; recheck on tinted surfaces). Add cobalt-tint #E8EDFF for chips and bubbles, and reuse the existing light tint #9CAEFF (styles.css:1367) for periods on cobalt.
- **Surface rhythm down the page:**
  1. Cobalt hero.
  2. Daylight work intro, then client colours alternating dark and light.
  3. Pizza charcoal for the demo.
  4. Navy process.
  5. Daylight founder, prices and FAQ.
  6. Cobalt close.
  7. Footer.
- **Contrast:** white on cobalt is about 6.5:1, and #E8EDFF on cobalt about 5.5:1. Never use navy text on cobalt.
- **Status tags** are outlined pills with text, never colour alone. No violet anywhere.
- **Themes:**
  - **Phase 0:** export `htmlOpen` (or build it from the exported `theme`) for seo.mjs.
  - **Phase 1:** once Liron confirms the theme comparison is over, make the studio tokens the `:root` defaults and delete the paper, cobalt, night and night-cobalt overrides and the `?theme=` switch. That fixes the brand split at its root, and new tokens then need defining only once.

**Signature element: the live deck.**
- Phone-shaped cards showing real, auto-touring captures of live sites, each with a "● באוויר · domain" pill.
- The deck opens the page on cobalt and returns at the cobalt close around the dashed "הקלף הבא" card, which fills in as the visitor composes a message. Like Streetlight's lamp, it bookends the page.
- The live dot is the honesty marker:
  - It comes from a liveness check and disappears if a site fails.
  - Pizza's pill reads "באוויר · הדגמה".

**Motion.**
- **Keep:**
  - deal-in and spring-open;
  - the 4 s rotation with progress line and pause;
  - living tours;
  - the stack's scale-and-darken.
- **Add:**
  - prev/next buttons and swipe on the deck;
  - the scroll-progress line;
  - chip filtering with a focus move;
  - one-time scene entrances;
  - the card filling in the composer;
  - a 200ms slide-in for the sticky bar.
- **Rules:**
  - Transform and opacity only.
  - Scroll-driven CSS only as an enhancement, with IntersectionObserver fallbacks.
  - No scroll-jacking, entry gates, hover-only reveals, count-ups or endless pulses.
  - Reduced motion shows finished, static states: no tours, no rotation.

**Imagery.**
- Only real material:
  - flat captures of the live sites with their real domains;
  - a real photo of Liron;
  - the studio's own WhatsApp preview;
  - the Pizza demo itself.
- The AI-composited images in `portfolio-shares-20261008` stay on social media and never appear as on-page proof.
- No stock, no AI-generated people, no mockups of fake UI.

## Trust without fabrication

| When | What | Condition |
|---|---|---|
| **Now** | Live link, real domain and case page on every project | Already true |
| **Now** | Pizza tagged "פרויקט הדגמה" everywhere, including the ads | Already stated at seo.mjs:93 |
| **Now** | Live pills from a liveness check (HTTP 200 plus the expected page title), removed automatically on failure | New script, `scripts/check-live.mjs` |
| **Now** | Miryam's slider relabelled "השוואת איפור לפני/אחרי" on her case page | projects.mjs:47–48 lists it as part of Miryam's site. Use "מתוך האתר של מרים" only after checking the live site |
| **Now** | Impersonal studio voice; no copy implying a team | About 30 occurrences across 5 files |
| **Now** | The studio's own WhatsApp link preview in the process section | Our own site; no permission needed |
| **With owner confirmation** | Status tags: לקוח / מוצר של הסטודיו | Liron confirms each. Koral is hosted at lawebs.co.il/koralevents: move it to its own domain or add "מתארח אצל LA webs". Seder is also hosted on lawebs.co.il |
| **With owner confirmation** | Founder photo, name, chapter; first-person lines; "היי לירון" prefills | Real photo, plus sign-off against PRODUCT.md:15 |
| **With owner confirmation** | Price ticket, VAT status, inclusions, other from-prices, fit lines | Liron's facts |
| **With owner confirmation** | "כל אתר נכתב מאפס", "חוזרים באותו יום", typical durations | Partly live already. Confirm, or remove from the live site too |
| **With owner confirmation** | Business facts: עוסק number, area, hours | Real values only |
| **With owner confirmation** | Dated PageSpeed and accessibility chips on **case pages** | `scripts/measure.mjs` writes committed JSON. Publish all rows or none; re-check quarterly |
| **With owner confirmation** | A project count ("9 עבודות באוויר") | Only if Liron reverses DESIGN.md:62 |
| **After an audit** | "נגיש, בלי תוסף נגישות" | An IS 5568 audit of the new pages passes |
| **After an audit** | The embedded Pizza demo | PizzaManager passes the same accessibility check |
| **Collect, then show** | Google rating | Business Profile ownership is verified (commit 185b8e8). Show only with 3 or more real reviews; template in docs/ads/prompts.md |
| **Collect, then show** | Named quotes beside their project (Streetlight's format) | Written permission |
| **Collect, then show** | Client name or wordmark strip; client WhatsApp previews (whatsapp-koral-example.png, whatsapp-pinhas-example.jpg) | Each client's permission |
| **Never** | Seeded reviews, logos without permission, counters, "X businesses", like counts, outcome metrics, unearned awards, invented timelines or guarantees, "online now" dots | — |

## Contact & conversion

- **Primary action:** WhatsApp, everywhere. **Secondary:** a phone call, always visible.
  - Desktop: the number and a pill in the header.
  - Mobile: a round call button in the header, and the labelled sticky bar after the hero.
- **The hero CTA sits on the first screen** at 1366×768, 390×844 and inside in-app browsers (390×690).
- **Prefills change with context.** Each location sends distinct text, so Liron's WhatsApp log can attribute the first message to where it came from (keep a lookup table in `docs/`). Each CTA also carries a `data-cta` attribute for the existing consent-based click tracking.
- **Greeting:** "היי LA webs," until the founder sign-off, then "היי לירון,".

| Location | Prefill (studio voice) |
|---|---|
| Header, hero, bar | "היי LA webs, ראיתי את האתר ואשמח לדבר על אתר לעסק שלי" |
| Need chip "משהו אחר?" | "היי LA webs, יש לי עסק בתחום…" |
| Featured panel, "עוד עבודות" row | "היי LA webs, ראיתי את [פרויקט] ואשמח למשהו בסגנון" |
| Demo | "היי LA webs, ניסיתי את הדגמת ההזמנות באתר ואשמח למערכת כזו לעסק שלי" |
| Price ticket, service row [P2] | "היי LA webs, אשמח להצעה ל[שירות]" |
| Founder [P2] | "היי לירון, " |
| Closing composer | need + existing site + business name (+ budget band if enabled) |

- **One intake, not three:** the closing composer, which seo.mjs also copies onto the service pages, plus contextual WhatsApp links after each chapter.
- **Price placement:** one tap from the hero via the nav, in its own chapter on the homepage, and in the hero on the paid landing pages (section 7).
- **Reassurance is specific and appears once:** "הצעה מסודרת לפני שמתחילים", the real response window [P2], and "בלי עלות" in small print.
- **Forms compose a WhatsApp message and store nothing.** Ad tracking IDs stay unset until verified.

## Other pages

- **/work/<slug>/ case pages**
  - **[P1]**
    - A prominent **לאתר החי ↗**.
    - A Web Share button "שלחו לשותף", for owners who decide with a partner.
    - The sticky bar.
    - Miryam's slider relabelled.
    - Keep the `section.catalog` strip: seo.mjs:94 throws without it. Move that anchor to a marker in the same commit. Add "הבא ←" to the next project in the same need group.
  - **[P2]**
    - A fact bar with the status tag, kind, scope chips and dated receipt chips.
    - A block **כמה עולה משהו כזה?** with the matching from-price or "לפי אפיון".
    - The Pizza page hosts the demo dialog.
  - Keep "רוצים אתר כזה?" with its project-named prefill.
- **/services/ and the 4 service pages**
  - **[P0]** The theme fix and the "?." fix (seo.mjs:62, :81).
  - **[P1]** On-system headings and the impersonal voice.
  - **[P2]** Each page gets:
    - its from-price or "לפי אפיון";
    - a typical timeline, if real;
    - included and not-included lists;
    - 2–3 real examples with status tags;
    - a service FAQ;
    - the composer with that need preselected;
    - a founder mini-row.
- **/about/**
  - **[P0]** Theme fix.
  - **[P1]** Voice rewrite.
  - **[P2]** It becomes "מי בונה":
    - a portrait and a short, true first-person story (founding year only if real);
    - the commitments and the business facts;
    - a link to the work, and the Google Business link once reviews exist;
    - a founder `Person` with an image in the Organization schema.
- **/lp/ and /lp/short/**
  - **Current state:**
    - Both are `index,follow` (seo.mjs:103–106).
    - /lp/ is self-canonical and in the sitemap.
    - /lp/short/ is canonical to /lp/.
    - Paid traffic lands on /lp/short/.
  - **[P0]** Label the Pizza card "הדגמה" in the deck names, and fix the 97px wordmark pill.
  - **[P1]** Live pills on the deck.
  - **[P2]**
    - A founder micro-row above the H1.
    - The `?t=` variant opens on the matching project:
      - hazmanot on the labelled Pizza demo;
      - events on Koral;
      - catalog on Reuven or Libi;
      - tadmit on Pinhas or Miryam.
    - For Meta traffic, open on the project the ad actually shows; use "זה האתר מהסרטון" only if that is literally true.
  - **How to test it on a static site:**
    - Build the variant at its own path (e.g. /lp/short/b/), with the same `index,follow` and canonical-to-/lp/ treatment. Add it to the seo.mjs:103 loop, keep it out of the sitemap, and seo-check's no-noindex rule still passes.
    - Split traffic with a Google Ads custom experiment (50/50 by final URL) and a Meta A/B test at the ad level.
    - When v2 wins, apply the same changes to /lp/, so the indexable page and the paid page don't drift.
    - Watch whether /lp/ and the homepage compete for "בניית אתר לעסק".

## Build plan

**Before anything else:**
- Commit or reconcile the uncommitted changes in scripts/build.mjs, scripts/seo.mjs and src/seo-content.mjs.
- Keep the untracked Next.js experiment (app/, components/, lib/, REPLACE-ME.md, which holds placeholder clients and quotes) out of the build and out of git.
- Correct the stale comment at build.mjs:364.
- Everything stays inside the dependency-free static build, and every new section degrades to plain links without JavaScript.

**Phase 0: quick wins this week, about 3.25 days, no new facts needed**

| Item | Effort | Files |
|---|---|---|
| Brand split: export `htmlOpen` (or build it from `theme`) and use it in `makePage`; fix "?." | 0.25d | scripts/build.mjs, scripts/seo.mjs |
| Pizza labelled "פרויקט הדגמה" wherever it appears; `status` field set only for pizza | 0.25d | src/projects.mjs, scripts/build.mjs, src/styles.css |
| Hero deck: Miryam in front, Pizza out; front-card-only labels on mobile | 0.25d | scripts/build.mjs, src/app.js, src/styles.css |
| `featuredOrder` → Koral, Miryam, Pinhas, Reuven; Pizza moves to "עוד עבודות" with its tag; mockups top-aligned | 0.5d | scripts/build.mjs, src/styles.css |
| Desktop header tel link and mobile round call button | 0.25d | scripts/build.mjs, src/styles.css |
| Shared sticky bar on homepage mobile (from `.lp-bar`); remove `.wa-float`; show/hide rules | 0.5d | scripts/build.mjs, src/app.js, src/styles.css |
| `data-cta` attributes and distinct per-location prefills (studio voice) | 0.25d | scripts/build.mjs, src/app.js |
| Ads copy: the :66 sitelink and the :69 hazmanot line, campaign-summary, prompts. Edited now, pushed only after Liron approves | 0.25d | scripts/ads-campaign.mjs, docs/ads/campaign-summary.md, docs/ads/prompts.md |
| /lp/short/ wordmark pill; Miryam slider label | 0.2d | src/styles.css, scripts/build.mjs |
| Update tests for the above (`#project-pizza` links, featured slugs, `.wa-float`, hand-card counts); run seo-check | 0.5d | tests/portfolio.spec.js |

**Phase 1a: the first screens, about 6 days, no new facts needed**

| Item | Effort | Files |
|---|---|---|
| Cobalt hero: two-voice H1, sub-line, CTA, deck prev/next/pause and swipe, fit at 1366/360/320; `?hero=` variants A, B and control; H2 periods retired; seo.mjs lede rewrite updated | 2.5d | scripts/build.mjs, scripts/seo.mjs, src/app.js, src/styles.css |
| Prepare and run the 5-owner 3-second screenshot test, then pick a variant | 0.25d dev + Liron's time | — |
| Need chips that filter `#work` in place; `aria-live` announcement; no-JS links to service pages | 0.75d | scripts/build.mjs, src/app.js, src/styles.css |
| Featured panels: tints, ghost title, live pills, tour pause rules | 1d | scripts/build.mjs, src/styles.css |
| `scripts/check-live.mjs` (HTTP 200 + expected title → committed JSON, run before deploy, never inside the offline build) | 0.25d | scripts/check-live.mjs, package.json |
| "עוד עבודות" rows with stretched links (replacing the swipe strip) | 0.75d | scripts/build.mjs, src/styles.css |
| Demo section v1: poster and new-tab link, labelled | 0.5d | scripts/build.mjs, src/styles.css |

**Phase 1b: the rest of the page, about 7 days, no new facts needed**

| Item | Effort | Files |
|---|---|---|
| Process: three steps with real artefacts, studio-only scenes, our own share preview | 1d | scripts/build.mjs, src/app.js, src/styles.css, public/images |
| Service rows replace the SEO block; seo.mjs insertions moved to explicit markers (contact copy, service insertion, case-page catalog anchor) | 1d | scripts/build.mjs, scripts/seo.mjs, src/seo-content.mjs |
| FAQ: current questions in the impersonal voice | 0.25d | scripts/build.mjs |
| Closing composer and filling card (reusing `leadForm()`; no nested sections) | 1.25d | scripts/build.mjs, src/app.js, src/styles.css |
| Voice rewrite across about 30 occurrences, including legal pages and ads | 1d | scripts/build.mjs, scripts/seo.mjs, src/seo-content.mjs, scripts/ads-campaign.mjs, docs/ads/prompts.md |
| Retire unused themes (after Liron's yes) | 0.5d | scripts/build.mjs, src/styles.css |
| Hebrew copywriting and proofreading for every new band | 1d | — |
| Rewrite portfolio.spec.js for the new structure (`#hero-title` text, `.stack-next`, fan counts, `.wa-float`); check seo-check rules (one H1, no noindex) still hold | 1d | tests/portfolio.spec.js, scripts/seo-check.mjs |

**Phase 2: needs owner input, about 9.5 days plus 0.5–1 day in the PizzaManager repo**

| Item | Effort | Blocked on |
|---|---|---|
| Price chapter: ticket, inclusions, fit cards, service-row prices; nav "מחירים"; FAQ link | 1.25d | VAT, inclusions, prices, sign-off on trust content |
| Founder chapter, sticky-bar avatar, composer mini-row, /about/ rewrite, Person schema; nav "מי בונה" | 1.5d | Photo, PRODUCT.md sign-off |
| Status tags for clients and products; first-person lines; "היי לירון" prefills | 0.5d | Project status, founder sign-off |
| New FAQ answers; business facts in the footer | 0.5d | Liron's answers |
| Pizza embed: desktop phone, mobile dialog, focus handling, Back closes it; PizzaManager accessibility pass | 1.5d | Demo-mode confirmation |
| `?embed=1` and `frame-ancestors 'self'` in PizzaManager | 0.5–1d (other repo) | Same |
| `scripts/measure.mjs` and case-page receipt chips | 0.5d | Approval to publish all rows |
| Case-page upgrades: fact bar, price block | 1d | Price facts |
| Service pages: prices, timelines, examples, preselected composer | 1d | Prices, durations |
| /lp/short/b/ variant, experiment setup, `?t=` start matching, founder micro-row | 1d | Founder sign-off, ad approval |
| Dormant reviews and quotes slots | 0.25d | None |

**Phase 3: polish and QA, about 2.5 days**
- Playwright captures at 1366×768, 1440×900, 390×844, 390×690, 360×740 and 320×800.
- axe, plus a keyboard path through the deck, chips, rows, demo dialog and composer.
- Reduced-motion and no-JS passes.
- Lighthouse: mobile LCP under 2.5 s, targeting about 2.0 s on a mid-range Android over 4G.
- Real-device test inside the Instagram and Facebook in-app browsers.
- **Accessibility statement.** It already claims IS 5568 / WCAG AA conformance (build.mjs:356), so every new component must meet AA at launch. Update the statement's date and scope, including the embedded demo.
- **Docs.** Update DESIGN.md (cobalt hero, display voice, H2 periods retired, themes retired) and PRODUCT.md (founder framing, if approved).

**Total: about 28 developer days**, plus Liron's time for the photo, the screenshot test, copy review and approvals.

**Phases 0 and 1 (about 16 days) need no new facts.** They need only four quick decisions from Liron:
- the hero variant (after the test);
- retiring the themes;
- approving the ad-copy push;
- approving the rewritten copy.

## What I need from you

**A. Decisions that reverse earlier recorded choices.** Each has a default if you say no.
1. **Trust content on the homepage:** the price chapter, founder chapter, business facts and receipts. On 4 Oct, testimonials and numbers were recorded as out of scope (DESIGN.md:104). If no: ship Phases 0–1 only.
2. **Founder framing.** PRODUCT.md:15 says "Studio positioning rather than a personal freelancer portfolio". Proposed: "LA webs, הסטודיו של לירון עטאר". LA webs stays the subject and Liron is the person you talk to, with first person only in the founder chapter. If no: the voice stays impersonal and there is no founder chapter.
3. **The look:** the cobalt hero, the display face in headings, and retired H2 periods. DESIGN.md describes a light canvas and the period motif. Decided by the 5-owner screenshot test; if no: the current daylight hero with the larger type only.
4. **A few more words.** The price chapter and the process steps carry short explanatory lines, against the "titles stand alone / one strong element" notes in DESIGN.md (the Work and Contact entries). The default keeps them to one line each.
5. **Project count.** The plan ships without one (DESIGN.md:62). Say yes only if you want "9 עבודות באוויר".
6. **Kickers.** The plan ships without them (DESIGN.md:27).
7. **Retire the unused colour themes:** paper, cobalt, night and night-cobalt.
8. **Headline.** "קודם תראו, / אחר כך נדבר.", with "העסק שלך. האתר שמתאים לו." moving to the closing line. If organic rankings for "בניית אתרים לעסקים" drop beyond normal movement within 4 weeks, the fallback is "בניית אתרים לעסקים, / שאפשר להיכנס אליהם."
9. **Ad copy.** Approve the changes before they go to the live Google Ads account.

**B. Facts and material.**
1. **A photo of you:** a 4:5 head-and-shoulders portrait, at least 1600px on the long side, natural light, ideally at work. Plus approval to show "לירון עטאר" prominently.
2. **Project status:**
   - which projects are paying clients;
   - that Pizza HaTanur is a demo;
   - that Seder and PDF Studio are studio products;
   - Koral and SOS specifically;
   - how Koral should appear, since it lives at lawebs.co.il/koralevents (its own domain, or "מתארח אצל LA webs").
3. **Price facts:**
   - whether 2,500 ₪ includes VAT (עוסק פטור or מורשה);
   - exactly what it includes;
   - domain and hosting (year one or yearly, and the cost);
   - the scope of post-launch support;
   - real from-prices for landing pages, catalogs and systems, or "לפי אפיון";
   - budget bands, if you want that step in the form.
4. **Claims to confirm or remove from the live site:**
   - "בלי תבניות" / "מאפס" for every project;
   - the same-day reply in the FAQ;
   - typical durations per step.
5. **Business facts:** עוסק number, city or service area (and whether you work nationwide), working hours.
6. **PizzaManager:** confirm that checkout never sends a real order, notification or payment. Approve the `?embed=1` change and an accessibility pass in that repo.
7. **Miryam:** confirm her live site shows the before/after comparison (projects.mjs:47–48 says it does), so the label can say "מתוך האתר של מרים".
8. **Measurement:** approval to measure and publish dated PageSpeed and accessibility results for every live site on the case pages, all rows, accepting that some numbers may be unflattering.
9. **An IS 5568 audit** of the new pages before any "בלי תוסף נגישות" line.
10. **Five business owners for the 3-second hero test,** ideally not current clients.
11. **Optional:** client OK to show their WhatsApp share previews.
12. **Later:**
    - real Google reviews and named quotes, collected with the template in docs/ads/prompts.md;
    - an optional reel from real screen recordings. Any rendered video must be registered with `register.mjs` and published with `deploy.ps1`, per the video-library rule.

## Risks and what we will measure

| Risk | Mitigation |
|---|---|
| Honesty slips: Pizza read as a client, the makeup slider read as a site redesign, illustrative scenes read as proof, receipts going stale | Pizza tagged everywhere, ads included. Slider relabelled. The process has no invented dialogue and no client assets, and illustrations are labelled "המחשה". Receipts are dated, all-or-none, re-checked quarterly and removed rather than left stale |
| A client site goes down or changes hands, so "באוויר" becomes false | Liveness check before every deploy removes the pill and dot automatically; Koral's hosting is presented honestly |
| Founder framing conflicts with PRODUCT.md | Explicit sign-off. LA webs stays the subject; without sign-off, no founder chapter |
| 2,500 ₪ anchors the studio as cheap, or attracts low budgets | Not in the hero; always paired with "מה משנה את המחיר", fit / not fit and a written quote; optional budget bands; reach to `#price` and ticket clicks reviewed after 6 weeks |
| Frank Ruhl reads as "newspaper", not premium | 5-owner screenshot test against Plex weight contrast before DESIGN.md is locked |
| The bigger hero breaks the fold or wraps at 360 | Hard Playwright acceptance test at 1366×768, 390×690, 360×740 and 320 |
| Demo embed: real orders, a scroll trap on mobile, a keyboard trap, accessibility conformance | Server-side demo mode; dialog only on mobile; focus kept inside, with Esc and Back closing it; click-to-load; PizzaManager accessibility pass before embedding |
| Markup changes silently break seo.mjs (contact copy, service insertion, catalog anchor) or tests | Explicit markers changed in the same commit; portfolio.spec.js rewritten; seo-check run on every build |
| SEO loss from the new H1 and the removed lede and prose | Keyword kept in the title, meta, sub-line and service rows; internal links to the 4 service pages kept; anchors preserved; rankings watched for 4 weeks, with the fallback H1 ready |
| Ads contradict the site | Ad copy fixed in Phase 0, before the on-site demo labels go live |
| Motion and media cost on mid-range Android and in in-app browsers | One eager LCP image; lazy captures; no blur; transform and opacity only; no video in v1 |
| Shipping the wrong base by accident | The Next.js experiment stays untracked and outside the build |

**What we will measure.** Record 2 weeks of baseline on the current site first. The homepage change is judged before and after, not by a split test, so read it with seasonality in mind.

- **Primary metric: real conversations started per week.**
  - WhatsApp threads and calls, logged by Liron.
  - Each one is attributed by its distinct prefill text, using the lookup table.
- **CTA clicks by `data-cta` location** (consent-based): header, hero, bar, chips, panel, row, demo, price, founder, composer.
- **Funnel signals:**
  - share of visitors reaching `#work`, `#demo` and `#price`;
  - demo opens;
  - composer sends against composer starts.
- **/lp/short/ against /lp/short/b/.**
  - **Split:** a Google Ads custom experiment (50/50 by final URL) and a Meta A/B test at the ad level.
  - **Stopping rule, set in advance:** run until each version has at least 30 logged conversations, or for 8 weeks.
  - **What it can detect:** with these numbers, only a difference of roughly 1.7 times or more stands out from noise. Treat anything smaller as a tie.
  - **On a tie:** keep the version with the lower cost per conversation and better lead quality. Liron rates each lead 1–3.
  - Do not stop early because one version is ahead.
- **Core Web Vitals on mobile:** LCP under 2.5 s (target about 2.0 s), INP under 200 ms, CLS under 0.1.
- **Organic rankings** for "בניית אתרים לעסקים" and the 4 service queries over 4 weeks, plus which URL (homepage or /lp/) ranks for "בניית אתר לעסק".