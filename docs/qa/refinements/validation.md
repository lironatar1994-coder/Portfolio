# Design refinement verification — 10 September 2026

- Kept the approved typography, paper/ink/vermilion identity, header, studio and footer.
- Replaced repeated long showcase tracks with one short Koral track and four individually composed presentations.
- Shortened mobile descriptions, widened mobile imagery, softened frames, settled the hero statement, and refined contact typography and placement.
- Replaced full-page case-story images with two source-coordinate detail crops and captions per project. Original assets remain untouched.
- Work section measured 5,381px at 1440×1000 and 5,107px at 390×844 (previous review: 14,061px and 12,728px).
- Build and static checks passed for all seven generated HTML pages.
- Existing browser suite: 30 passed, 4 intentional skips (viewport-specific cases and optional screenshot runs).
- Final browser sweep: 1440×1000, 390×844, 320×667, 844×390; no horizontal overflow or JavaScript errors. Checked the homepage comparison and hiding the floating contact control over project visuals.
- Inspected desktop/mobile hero, project presentations, contact, and all ten case-detail crops; refined crop boundaries after inspection.
- `mobile-case-story-start.png` and `mobile-case-details.png` show the case content after scrolling. Tall element screenshots named `*-case-story.png` can contain unrevealed offscreen text and fixed-header capture artifacts; use the viewport captures for visual review.
- Local preview only; no production deployment.
