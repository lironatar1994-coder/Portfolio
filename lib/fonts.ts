import {
  Frank_Ruhl_Libre,
  Suez_One,
  Alef,
  Miriam_Libre,
  Karantina,
  Secular_One,
  Cutive_Mono,
  Assistant,
} from 'next/font/google';

/**
 * Faces are chosen as objects from the subject's world, not as UI defaults.
 * Deliberately avoided: Heebo / Rubik / Open Sans Hebrew — the Israeli web's
 * house style, and the exact thing this site must not look like.
 */

/** Israeli print serif (Haaretz lineage). Headings, ledger entries. */
export const frank = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--f-display',
  display: 'swap',
});

/** Heavy slab-ish Hebrew display. Rubber stamps, tabs, big numerals. */
export const suez = Suez_One({
  subsets: ['hebrew', 'latin'],
  weight: '400',
  variable: '--f-stamp',
  display: 'swap',
});

/** Quiet Hebrew workhorse for running text. */
export const alef = Alef({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700'],
  variable: '--f-body',
  display: 'swap',
});

/** Squarish Hebrew with terminals that read as printed labels. */
export const miriam = Miriam_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700'],
  variable: '--f-label',
  display: 'swap',
});

/** Condensed Hebrew display — box end-labels in the Archive variant. */
export const karantina = Karantina({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '700'],
  variable: '--f-condensed',
  display: 'swap',
});

/** Heavy geometric Hebrew — Archive variant headlines. */
export const secular = Secular_One({
  subsets: ['hebrew', 'latin'],
  weight: '400',
  variable: '--f-heavy',
  display: 'swap',
});

/** Typewriter Latin for size runs, dates and reference codes. */
export const cutive = Cutive_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--f-mono',
  display: 'swap',
});

/** The Monochrome variant is the category standard played straight, so it
 *  gets the category's own workhorse — used here on purpose, not by default. */
export const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--f-ui',
  display: 'swap',
});
