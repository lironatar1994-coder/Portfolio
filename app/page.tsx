import s from './book.module.css';
import Chrome from '@/components/book/Chrome';
import Reveal from '@/components/book/Reveal';
import Entries from '@/components/book/Entries';
import Faq from '@/components/book/Faq';
import TodayStamp from '@/components/book/TodayStamp';
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

const SECTIONS = [
  { id: 'ledger', label: 'העבודות' },
  { id: 'for-who', label: 'למי' },
  { id: 'proof', label: 'איך' },
  { id: 'method', label: 'התהליך' },
  { id: 'faq', label: 'שאלות' },
  { id: 'slot', label: 'קשר' },
];

/** Today's page, as it would actually be written. Demonstration content. */
const TODAY_ROWS = [
  { time: '08:40', name: 'לחם של שישי', what: 'עדכון תפריט לשבוע', mark: 'נמסר' },
  { time: '10:15', name: 'ד״ר נעם אלוני', what: 'עמוד טיפול חדש', mark: 'נמסר' },
  { time: '13:00', name: 'סטודיו תנועה', what: 'מערכת שעות חיה', mark: 'בעבודה' },
  { time: '15:20', name: 'סלון תשע', what: 'גלריית לפני/אחרי', mark: 'בעבודה' },
];

function StampCta({ label, note }: { label: string; note?: string }) {
  return (
    <a className={s.stampBtn} href={whatsappHref} target="_blank" rel="noopener noreferrer">
      {label}
      {note ? <small>{note}</small> : null}
    </a>
  );
}

function SectionHead({
  no,
  title,
  note,
}: {
  no: string;
  title: string;
  note?: React.ReactNode;
}) {
  return (
    <div className={s.sectionHead}>
      <div>
        <div className={s.sectionNo}>{no}</div>
        <h2 className={s.sectionTitle}>{title}</h2>
      </div>
      {note ? <div className={s.sectionNote}>{note}</div> : null}
    </div>
  );
}

export default function AppointmentBookPage() {
  return (
    <div className={s.book}>
      {/* Roughened edges for stamped ink — a clean vector stamp reads as a badge. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <filter id="roughInk">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <VariantSwitcher />
      <Chrome sections={SECTIONS} />

      <div className={s.leaf}>
        <div className={s.inner}>
          {/* ─────────────── masthead: gold foil blocked into the cover ─────── */}
          <header className={s.masthead}>
            <div className={s.foilBlock}>
              <span className={s.foilName}>{owner.name}</span>
              <span className={s.foilRule} />
              <span className={s.foilRole}>{owner.role}</span>
            </div>
            <div className={s.mastRight}>
              <div className={s.mastMeta}>
                <div className="ltr">{owner.city}</div>
                <div>עצמאי · ללא סוכנות</div>
              </div>
            </div>
          </header>

          <main id="main">
            {/* ──────────────────────── COVER ──────────────────────────────── */}
            <section className={s.cover} aria-labelledby="hero-title">
              <div className={s.coverPitch}>
                <p className={s.eyebrow}>{hero.eyebrow}</p>
                <h1 className={s.h1} id="hero-title">
                  אתר שממלא
                  <em>לך את היומן.</em>
                </h1>
                <p className={s.lede}>{hero.lede}</p>
                <div className={s.ctaRow}>
                  <StampCta label={hero.ctaPrimary} note="וואטסאפ · תשובה באותו יום" />
                  <a className={s.ghostBtn} href="#ledger">
                    {hero.ctaSecondary}
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>

              {/* The open page — the thesis, drawn as the object itself. */}
              <Reveal>
                <div className={`${s.plate} ${s.today}`}>
                  <div className={s.todayHead}>
                    <div>
                      <div className={s.todayLabel}>עמוד היום</div>
                      <div className={s.todayDate}>מה נכתב בפנקס השבוע</div>
                    </div>
                    <TodayStamp />
                  </div>

                  <div className={`${s.rows} ${s.marginRule}`}>
                    {TODAY_ROWS.map((r) => (
                      <div className={s.row} key={r.time}>
                        <span className={s.rowTime}>{r.time}</span>
                        <span className={s.rowName}>
                          <b>{r.name}</b> <i>— {r.what}</i>
                        </span>
                        <span className={s.rowMark}>{r.mark}</span>
                      </div>
                    ))}

                    <div className={`${s.row} ${s.rowOpen}`}>
                      <span className={s.rowTime}>16:30</span>
                      <span className={s.rowName}>
                        העסק שלך
                        <span className={s.caret} aria-hidden="true" />
                      </span>
                      <span className={s.rowMark}>פנוי</span>
                    </div>
                  </div>

                  <div className={s.todayFoot}>
                    <p className={s.pencilNote}>
                      השורה האחרונה פנויה בכוונה. אני מחזיק שני פרויקטים במקביל, לא יותר.
                    </p>
                    <StampCta label="לתפוס את השורה" />
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ──────────────────────── THESIS ─────────────────────────────── */}
            <Reveal as="section" className={s.thesis}>
              <div>
                <p className={s.thesisKicker}>{thesis.kicker}</p>
                <h2 className={s.thesisTitle}>{thesis.title}</h2>
              </div>
              <p className={s.thesisBody}>{thesis.body}</p>
            </Reveal>

            {/* ──────────────────────── THE WORK ───────────────────────────── */}
            <section className={s.section} id="ledger" aria-labelledby="ledger-title">
              <Reveal>
                <div className={s.plate}>
                  <div className={s.sectionHead}>
                    <div>
                      <div className={s.sectionNo}>א · היומן</div>
                      <h2 className={s.sectionTitle} id="ledger-title">
                        מה נכתב בפנקס
                      </h2>
                    </div>
                    <span className={s.demoTag}>{demoNotice.short}</span>
                  </div>
                  <div className={s.sectionBody}>
                    <Entries projects={projects} />
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ──────────────────────── AUDIENCES ──────────────────────────── */}
            <section className={s.section} id="for-who" aria-labelledby="forwho-title">
              <Reveal>
                <div className={s.plate}>
                  <SectionHead
                    no="ב · אינדקס"
                    title="תמצא את העסק שלך ברשימה"
                  />
                  <div className={s.sectionBody}>
                    <h3 className="srOnly" id="forwho-title">
                      סוגי עסקים והשאלה שהלקוח שלהם שואל
                    </h3>
                    <div className={s.audList}>
                      {audiences.map((a) => (
                        <Reveal as="div" key={a.id} className={s.audItem}>
                          <div className={s.audLabel}>{a.label}</div>
                          <div>
                            <p className={s.audQ}>״{a.question}״</p>
                            <p className={s.audA}>{a.answer}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ──────────────────────── PROOF ──────────────────────────────── */}
            <section className={s.section} id="proof" aria-labelledby="proof-title">
              <Reveal>
                <div className={s.plate}>
                  <SectionHead
                    no="ג · כללי הבית"
                    title="שישה דברים שאני עושה בכל אתר"
                    note="בלי קשר לתקציב או לגודל העסק"
                  />
                  <h3 className="srOnly" id="proof-title">
                    כללי העבודה
                  </h3>
                  <div className={s.proofGrid}>
                    {proofs.map((p) => (
                      <div className={s.proofCell} key={p.id}>
                        <div className={s.proofN}>{p.n}</div>
                        <h4 className={s.proofTitle}>{p.title}</h4>
                        <p className={s.proofBody}>{p.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ──────────────────────── PROCESS ────────────────────────────── */}
            <section className={s.section} id="method" aria-labelledby="method-title">
              <Reveal>
                <div className={s.thesisKicker}>ד · סדר היום</div>
                <h2 className={s.thesisTitle} id="method-title" style={{ paddingBlockEnd: '1.5rem' }}>
                  ארבעה שלבים. אתה יודע בכל רגע איפה אנחנו.
                </h2>
              </Reveal>
              <div className={s.steps}>
                {process.map((step, i) => (
                  <Reveal as="div" key={step.n} delay={i * 70} className={s.step}>
                    <div className={s.stepN} aria-hidden="true">
                      {step.n}
                    </div>
                    <h3 className={s.stepTitle}>{step.title}</h3>
                    <p className={s.stepBody}>{step.body}</p>
                    <span className={s.stepNote}>{step.note}</span>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ──────────────────────── QUOTES ─────────────────────────────── */}
            <section className={s.section} aria-labelledby="quotes-title">
              <Reveal>
                <div className={s.thesisKicker}>ה · בשוליים</div>
                <h2 className={s.thesisTitle} id="quotes-title" style={{ paddingBlockEnd: '1.5rem' }}>
                  מה אמרו אחרי שהאתר עלה
                </h2>
              </Reveal>
              <div className={s.quotes}>
                {testimonials.map((t, i) => (
                  <Reveal as="div" key={t.business} delay={i * 80} className={s.quote}>
                    <p className={s.quoteText}>״{t.quote}״</p>
                    <p className={s.quoteMeta}>
                      <span>{t.name}</span>
                      <em>· {t.business}</em>
                    </p>
                  </Reveal>
                ))}
              </div>
              <p
                className={s.stepNote}
                style={{ display: 'block', marginBlockStart: '1.25rem', borderBlockStart: 0 }}
              >
                ציטוטים לדוגמה — להחלפה בהמלצות אמיתיות לפני העלייה לאוויר.
              </p>
            </section>

            {/* ──────────────────────── FAQ ────────────────────────────────── */}
            <section className={s.section} id="faq" aria-labelledby="faq-title">
              <Reveal>
                <div className={s.plate}>
                  <SectionHead no="ו · שוליים" title="שאלות שחוזרות בכל שיחה ראשונה" />
                  <h3 className="srOnly" id="faq-title">
                    שאלות נפוצות
                  </h3>
                  <div className={s.sectionBody}>
                    <Faq items={faqs} />
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ──────────────────────── THE OPEN SLOT ──────────────────────── */}
            <section className={s.section} id="slot" aria-labelledby="slot-title">
              <Reveal>
                <div className={`${s.plate} ${s.close}`}>
                  <div className={s.closeGrid}>
                    <div>
                      <p className={s.closeKicker}>{contact.kicker}</p>
                      <h2 className={s.closeTitle} id="slot-title">
                        {contact.title}
                      </h2>
                      <p className={s.closeBody}>{contact.body}</p>
                      <p className={s.closeReassure}>{contact.reassure}</p>
                    </div>

                    <div className={s.slot}>
                      <div className={s.slotHead}>
                        <span>משבצת פנויה</span>
                        <span className="ltr">01 / 02</span>
                      </div>
                      <div className={s.slotLine}>
                        שם העסק
                        <span className={s.caret} aria-hidden="true" />
                      </div>
                      <div className={s.slotLine}>מה מפריע לך באתר הנוכחי</div>
                      <div className={s.slotActions}>
                        <StampCta label={contact.ctaPrimary} note="נפתח עם ההודעה כתובה" />
                        <a className={s.mailBtn} href={`mailto:${owner.email}`}>
                          {contact.ctaSecondary}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>
          </main>

          <footer className={s.footer}>
            <p className={s.footNotice}>{demoNotice.long}</p>
            <p>
              © {new Date().getFullYear()} {owner.name}
            </p>
          </footer>
        </div>
      </div>

      {/* Thumb-reach action bar — the primary action never leaves the screen. */}
      <div className={s.mobileBar}>
        <StampCta label="לתפוס את המשבצת" />
        <p className={s.mobileNote}>שני פרויקטים במקביל. אחד פנוי.</p>
      </div>
    </div>
  );
}
