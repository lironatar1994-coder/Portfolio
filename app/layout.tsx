import type { Metadata, Viewport } from 'next';
import './globals.css';
import { frank, suez, alef, miriam, karantina, secular, cutive, assistant } from '@/lib/fonts';
import { owner } from '@/lib/content';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.co.il'),
  title: {
    default: `${owner.name} · ${owner.role}`,
    template: `%s · ${owner.name}`,
  },
  description:
    'בניית אתרים לעסקים מקומיים בישראל — מסעדות, קליניקות, סטודיואים, מספרות וחנויות. אתר שנבנה סביב הדרך שבה הלקוחות שלך באמת מחפשים ומזמינים.',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    title: `${owner.name} · ${owner.role}`,
    description: 'אתר שממלא לך את היומן. בניית אתרים לעסקים מקומיים בישראל.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#4E1319',
  width: 'device-width',
  initialScale: 1,
};

const CONTRACT = `<!--
IMPECCABLE DIRECTION CONTRACT — seed 9271e2e0 · mode persuade

THESIS: A local business lives or dies on one question — is the book full? So this
site IS the appointment book, and every delivered project is an entry written into
it. It refuses the dark-hero-plus-project-grid arrangement this category always ships.

OWN-WORLD: Oxblood bookcloth ground with gold-foil blocking; inset ledger plates in
cool paper with printed cyan rules and a red margin rule; vermilion rubber-stamp ink;
graphite pencil for anything not yet committed. Frank Ruhl Libre, Suez One, Alef.

STORY: A business owner sees their own trade already written into the book, reads what
was actually built for a business like theirs, and takes the one free slot by WhatsApp.

FIRST VIEWPORT: Full-bleed cloth cover, gold-foil spine block top-right, an open ledger
plate with today's date stamped in vermilion, four filled entries and one empty ruled
line marked "your business" — the stamp CTA sits on that line.

FORM: The Appointment Book; candidate 3 of 7 on the grounded list; seed key 9271e2e0.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    frank.variable,
    suez.variable,
    alef.variable,
    miriam.variable,
    karantina.variable,
    secular.variable,
    cutive.variable,
    assistant.variable,
  ].join(' ');

  return (
    <html lang="he" dir="rtl" className={fontVars}>
      <body>
        <div dangerouslySetInnerHTML={{ __html: CONTRACT }} suppressHydrationWarning />
        <a className="skipLink" href="#main">
          דילוג לתוכן הראשי
        </a>
        {children}
      </body>
    </html>
  );
}
