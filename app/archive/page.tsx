import type { Metadata } from 'next';
import s from './archive.module.css';
import { Wall, ArchiveFaq, Fade } from '@/components/archive/ArchiveClient';
import VariantSwitcher from '@/components/VariantSwitcher';
import {
  owner,
  whatsappHref,
  hero,
  thesis,
  audiences,
  projects,
  proofs,
  process,
  testimonials,
  faqs,
  contact,
  demoNotice,
} from '@/lib/content';

export const metadata: Metadata = {
  title: 'קיר הקופסאות · גרסת עיצוב',
};

function Stencil({ label, note }: { label: string; note?: string }) {
  return (
    <a className={s.stencil} href={whatsappHref} target="_blank" rel="noopener noreferrer">
      {label}
      {note ? <small>{note}</small> : null}
    </a>
  );
}

export default function ArchiveWallPage() {
  return (
    <div className={s.wall}>
      <VariantSwitcher />

      <div className={s.shell}>
        <header className={s.top}>
          <div>
            <div className={s.mark}>{owner.name}</div>
            <div className={s.markSub}>{owner.role}</div>
          </div>
          <div className={s.topMeta}>
            <div className="ltr">{owner.city}</div>
            <div>ARCHIVE / 06 BOXES</div>
          </div>
        </header>

        <main id="main">
          {/* ─────────────────────────── HERO ────────────────────────────── */}
          <section className={s.hero} aria-labelledby="a-hero">
            <h1 className={s.heroTitle} id="a-hero">
              אתר שממלא
              <span>לך את היומן.</span>
            </h1>
            <div className={s.heroSide}>
              <p className={s.heroLede}>{hero.lede}</p>
              <div className={s.heroActions}>
                <Stencil label={hero.ctaPrimary} note="WHATSAPP / SAME DAY" />
                <a className={s.linkFlat} href="#boxes">
                  {hero.ctaSecondary} ↓
                </a>
              </div>
            </div>
          </section>

          {/* ─────────────────────────── THESIS ──────────────────────────── */}
          <Fade as="section" className={s.section}>
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>{thesis.kicker}</div>
                <h2 className={s.h2}>{thesis.title}</h2>
              </div>
            </div>
            <p className={s.heroLede}>{thesis.body}</p>
          </Fade>

          {/* ─────────────────────────── THE WALL ────────────────────────── */}
          <section className={s.section} id="boxes" aria-labelledby="a-boxes">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>01 / THE WALL</div>
                <h2 className={s.h2} id="a-boxes">
                  שש קופסאות על הקיר
                </h2>
              </div>
              <span className={s.demoTag}>{demoNotice.short}</span>
            </div>
            <Fade>
              <Wall projects={projects} />
            </Fade>
          </section>

          {/* ────────────────────────── SIZE RUN ─────────────────────────── */}
          <section className={s.section} aria-labelledby="a-run">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>02 / SIZE RUN</div>
                <h2 className={s.h2} id="a-run">
                  תמצא את המידה שלך
                </h2>
              </div>
              <span className={s.note}>מה הלקוח שלך שואל · מה אני בונה בשביל זה</span>
            </div>
            <Fade>
              <div className={s.runStrip}>
                {audiences.map((a) => (
                  <div className={s.runRow} key={a.id}>
                    <div className={s.runLabel}>{a.label}</div>
                    <div className={s.runQ}>״{a.question}״</div>
                    <div className={s.runA}>{a.answer}</div>
                  </div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ───────────────────────── SPEC BLOCK ────────────────────────── */}
          <section className={s.section} aria-labelledby="a-spec">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>03 / SPEC</div>
                <h2 className={s.h2} id="a-spec">
                  מה נכנס לכל קופסה
                </h2>
              </div>
              <span className={s.note}>בלי קשר לתקציב או לגודל העסק</span>
            </div>
            <Fade>
              <div className={s.specs}>
                {proofs.map((p) => (
                  <div className={s.spec} key={p.id}>
                    <div className={s.specN}>{p.n}</div>
                    <h3 className={s.specTitle}>{p.title}</h3>
                    <p className={s.specBody}>{p.body}</p>
                  </div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ───────────────────────── CARE LABEL ────────────────────────── */}
          <section className={s.section} aria-labelledby="a-care">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>04 / HANDLING</div>
                <h2 className={s.h2} id="a-care">
                  ארבעה שלבים, בלי הפתעות
                </h2>
              </div>
            </div>
            <div className={s.care}>
              {process.map((step, i) => (
                <Fade key={step.n} delay={i * 70} className={s.careItem}>
                  <div className={s.careN} aria-hidden="true">
                    {step.n}
                  </div>
                  <h3 className={s.careTitle}>{step.title}</h3>
                  <p className={s.careBody}>{step.body}</p>
                  <span className={s.careNote}>{step.note}</span>
                </Fade>
              ))}
            </div>
          </section>

          {/* ──────────────────────── TISSUE NOTES ───────────────────────── */}
          <section className={s.section} aria-labelledby="a-quotes">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>05 / NOTES</div>
                <h2 className={s.h2} id="a-quotes">
                  פתקים שנמצאו בקופסאות
                </h2>
              </div>
              <span className={s.demoTag}>ציטוטים לדוגמה</span>
            </div>
            <div className={s.quotes}>
              {testimonials.map((t, i) => (
                <Fade key={t.business} delay={i * 80} className={s.quote}>
                  <p className={s.quoteText}>״{t.quote}״</p>
                  <p className={s.quoteMeta}>
                    {t.name} · {t.business}
                  </p>
                </Fade>
              ))}
            </div>
          </section>

          {/* ───────────────────────────── FAQ ───────────────────────────── */}
          <section className={s.section} id="a-faq" aria-labelledby="a-faq-t">
            <div className={s.sectionTop}>
              <div>
                <div className={s.kicker}>06 / Q&amp;A</div>
                <h2 className={s.h2} id="a-faq-t">
                  שאלות שחוזרות בכל שיחה ראשונה
                </h2>
              </div>
            </div>
            <Fade>
              <ArchiveFaq items={faqs} />
            </Fade>
          </section>

          {/* ───────────────────────── LAST BOX ──────────────────────────── */}
          <section className={s.section} id="a-contact" aria-labelledby="a-contact-t">
            <Fade>
              <div className={s.last}>
                <div>
                  <div className={s.kicker}>07 / {contact.kicker}</div>
                  <h2 className={s.lastTitle} id="a-contact-t">
                    {contact.title}
                  </h2>
                  <p className={s.lastBody}>{contact.body}</p>
                </div>
                <div className={s.lastPanel}>
                  <div className={s.lastSlot}>
                    <span>OPEN SLOT</span>
                    <span>01 / 02</span>
                  </div>
                  <div className={s.lastLine}>שם העסק</div>
                  <div className={s.lastLine}>מה מפריע לך באתר הנוכחי</div>
                  <div className={s.lastActions}>
                    <Stencil label={contact.ctaPrimary} />
                    <a className={s.mailFlat} href={`mailto:${owner.email}`}>
                      {contact.ctaSecondary} ↗
                    </a>
                  </div>
                </div>
              </div>
            </Fade>
          </section>
        </main>

        <footer className={s.foot}>
          <p className={s.footNotice}>{demoNotice.long}</p>
          <p>© {new Date().getFullYear()} LIRON</p>
        </footer>
      </div>

      <div className={s.bar}>
        <Stencil label="לתפוס את המשבצת" />
        <p className={s.barNote}>שני פרויקטים במקביל. אחד פנוי.</p>
      </div>
    </div>
  );
}
