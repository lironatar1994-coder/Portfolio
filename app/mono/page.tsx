import type { Metadata } from 'next';
import Image from 'next/image';
import s from './mono.module.css';
import { Fade, MonoFaq } from '@/components/mono/MonoClient';
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
  title: 'מונוכרום · גרסת עיצוב',
};

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.3.5-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
    </svg>
  );
}

/** The interface detail that immediately proves the claim beside it. */
function ProofDetail({ id }: { id: string }) {
  if (id === 'mobile') {
    return (
      <div className={s.detail}>
        <div className={s.detailRow}>
          <b>רוחב מסך בפועל</b>
          <span className={s.detailMuted}>נתוני עיצוב</span>
        </div>
        <div className={s.detailRow}>
          <span>נייד · 360–430px</span>
          <b>78%</b>
        </div>
        <div className={s.meter}>
          <div className={s.meterFill} style={{ width: '78%' }} />
        </div>
        <div className={s.detailRow}>
          <span className={s.detailMuted}>מחשב · 1280px ומעלה</span>
          <span className={s.detailMuted}>22%</span>
        </div>
      </div>
    );
  }

  if (id === 'speed') {
    return (
      <div className={s.detail}>
        <div className={s.detailRow}>
          <b>זמן טעינה</b>
          <span className={s.detailMuted}>רשת סלולרית</span>
        </div>
        <div className={s.detailRow}>
          <span>אתר תבנית טיפוסי</span>
          <span className={s.detailMuted}>6.4 שנ׳</span>
        </div>
        <div className={s.meter}>
          <div className={`${s.meterFill} ${s.meterFillSlow}`} style={{ width: '92%' }} />
        </div>
        <div className={s.detailRow}>
          <span>מה שאני בונה</span>
          <b>&lt; 1 שנ׳</b>
        </div>
        <div className={s.meter}>
          <div className={s.meterFill} style={{ width: '14%' }} />
        </div>
      </div>
    );
  }

  if (id === 'whatsapp') {
    return (
      <div className={s.detail}>
        <div className={s.detailRow}>
          <b>ההודעה שנפתחת אצל הלקוח</b>
        </div>
        <div className={s.detailRow}>
          <span className={s.detailMuted}>״היי, ראיתי את עמוד הטיפולים ורציתי לשאול…״</span>
        </div>
        <div className={s.waMini}>
          <WaIcon />
          שליחה בוואטסאפ
        </div>
      </div>
    );
  }

  if (id === 'edit') {
    return (
      <div className={s.detail}>
        <div className={s.detailRow}>
          <b>מה אתה משנה לבד</b>
        </div>
        <div className={s.tagRow}>
          <span className={s.tag}>תפריט</span>
          <span className={s.tag}>שעות</span>
          <span className={s.tag}>תמונות</span>
          <span className={s.tag}>מבצעים</span>
          <span className={s.tag}>אנשי צוות</span>
          <span className={`${s.tag} ${s.tagOn}`}>מהטלפון</span>
        </div>
      </div>
    );
  }

  if (id === 'a11y') {
    return (
      <div className={s.detail}>
        <div className={s.detailRow}>
          <b>ניווט במקלדת</b>
          <span className={s.kbd}>Tab</span>
        </div>
        <div className={s.detailRow}>
          <span>ניגודיות טקסט</span>
          <b>AA ומעלה</b>
        </div>
        <div className={s.detailRow}>
          <span className={s.detailMuted}>ווידג׳ט נגישות צף</span>
          <span className={s.detailMuted}>לא נדרש</span>
        </div>
      </div>
    );
  }

  return (
    <div className={s.detail}>
      <div className={s.detailRow}>
        <b>מה גוגל קורא</b>
      </div>
      <div className={s.tagRow}>
        <span className={s.tag}>LocalBusiness</span>
        <span className={s.tag}>openingHours</span>
        <span className={s.tag}>Menu</span>
        <span className={s.tag}>Review</span>
        <span className={`${s.tag} ${s.tagOn}`}>עמוד לכל שירות</span>
      </div>
    </div>
  );
}

export default function MonochromePage() {
  return (
    <div className={s.page}>
      <VariantSwitcher />

      <nav className={s.nav} aria-label="ניווט ראשי">
        <div className={s.navInner}>
          <div className={s.brand}>
            {owner.name}
            <span>{owner.role}</span>
          </div>
          <div className={s.navLinks}>
            <a href="#m-work">עבודות</a>
            <a href="#m-how">איך אני עובד</a>
            <a href="#m-who">למי זה מתאים</a>
            <a href="#m-faq">שאלות</a>
          </div>
          <a className={`${s.btn} ${s.btnPrimary}`} href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <WaIcon />
            דברו איתי
          </a>
        </div>
      </nav>

      <div className={s.shell}>
        <main id="main">
          {/* ─────────────────────────── HERO ────────────────────────────── */}
          <section className={s.hero}>
            <span className={s.pill}>
              <b>פנוי</b>
              משבצת אחת מתוך שתיים לרבעון הקרוב
            </span>
            <h1 className={s.h1}>
              אתר שממלא לך את היומן.
              <br />
              <span>לא רק אתר שנראה טוב.</span>
            </h1>
            <p className={s.sub}>{hero.lede}</p>
            <div className={s.heroActions}>
              <a
                className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WaIcon />
                {hero.ctaPrimary}
              </a>
              <a className={`${s.btn} ${s.btnLg}`} href="#m-work">
                {hero.ctaSecondary}
              </a>
            </div>
            <p className={s.microNote}>תשובה באותו יום · בלי טפסים · בלי שיחת מכירה</p>

            {/* Claim proved immediately: the thing itself, in the hand. */}
            <div className={s.shotWrap}>
              <div className={s.phone}>
                <div className={s.phoneScreen}>
                  <div className={s.mockBar}>
                    <span>9:41</span>
                    <span className="ltr">▪ ▪ ▪</span>
                  </div>
                  <div className={s.mockHero}>
                    <Image
                      src={projects[0].image}
                      alt="הדגמת עמוד בית של מאפייה בטלפון"
                      width={620}
                      height={390}
                      sizes="320px"
                    />
                    <div className={s.mockHeroText}>
                      <div className={s.mockTitle}>לחם של שישי</div>
                      <div className={s.mockSub}>מאפיית מחמצת · רמת גן</div>
                    </div>
                  </div>
                  <div className={s.mockBody}>
                    <div className={s.mockStatus}>
                      <span className={s.mockDot} />
                      פתוח עכשיו · עד 19:00
                    </div>
                    <div className={s.mockRow}>
                      <b>מחמצת כפרית</b>
                      <span>אזל להיום</span>
                    </div>
                    <div className={s.mockRow}>
                      <b>חלה קלועה</b>
                      <span>לשישי</span>
                    </div>
                    <div className={s.mockRow}>
                      <b>בורקס גבינה</b>
                      <span>טרי</span>
                    </div>
                    <div className={s.mockCta}>
                      <WaIcon />
                      הזמנה לשישי בוואטסאפ
                    </div>
                  </div>
                </div>
              </div>
              <p className={s.shotCaption}>הדגמת ממשק · העסק והתוכן הם תוכן לדוגמה</p>
            </div>
          </section>

          {/* ─────────────────────── CLAIM & PROOF ───────────────────────── */}
          <section className={s.section} id="m-how">
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>{thesis.kicker}</div>
              <h2 className={s.h2}>{thesis.title}</h2>
              <p className={s.secSub}>{thesis.body}</p>
            </Fade>
            <Fade>
              <div className={s.pairs}>
                {proofs.map((p) => (
                  <div className={s.pair} key={p.id}>
                    <div className={s.pairN}>{p.n}</div>
                    <h3 className={s.pairTitle}>{p.title}</h3>
                    <p className={s.pairBody}>{p.body}</p>
                    <ProofDetail id={p.id} />
                  </div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ──────────────────────────── WORK ───────────────────────────── */}
          <section className={s.section} id="m-work">
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>עבודות</div>
              <h2 className={s.h2}>שישה עסקים, שישה מסלולים שונים ללקוח</h2>
              <p className={s.secSub}>
                לכל עסק יש שאלה אחת שהלקוח שלו שואל לפני שהוא מגיע. זה מה שקבע את המבנה בכל אחד
                מהאתרים האלה.
              </p>
              <p style={{ paddingBlockStart: '1rem' }}>
                <span className={s.demoTag}>{demoNotice.short}</span>
              </p>
            </Fade>

            <div className={s.work}>
              {projects.map((p, i) => (
                <Fade key={p.id} delay={(i % 2) * 60} className={s.card}>
                  <div className={s.cardShot}>
                    <Image
                      src={p.image}
                      alt={p.alt}
                      width={900}
                      height={562}
                      sizes="(max-width: 760px) 92vw, 44vw"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span className={s.cardTag}>תצלום ממאגר חופשי</span>
                  </div>
                  <div className={s.cardBody}>
                    <h3 className={s.cardTitle}>{p.name}</h3>
                    <p className={s.cardMeta}>
                      {p.kind} · {p.city} · {p.year}
                    </p>
                    <p className={s.cardText}>{p.before}</p>
                    <ul className={s.cardList}>
                      {p.built.slice(0, 3).map((b) => (
                        <li key={b} className={s.cardListItem}>
                          <Check />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <p className={s.cardOutcome}>
                      <b>מה השתנה · נתוני הדגמה</b>
                      {p.outcome}
                    </p>
                  </div>
                </Fade>
              ))}
            </div>
          </section>

          {/* ─────────────────────────── AUDIENCES ───────────────────────── */}
          <section className={s.section} id="m-who">
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>למי זה מתאים</div>
              <h2 className={s.h2}>תמצא את העסק שלך בטבלה</h2>
            </Fade>
            <Fade>
              <div className={s.audTable}>
                {audiences.map((a) => (
                  <div className={s.audRow} key={a.id}>
                    <div className={s.audLabel}>{a.label}</div>
                    <div className={s.audQ}>״{a.question}״</div>
                    <div className={s.audA}>{a.answer}</div>
                  </div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ──────────────────────────── PROCESS ────────────────────────── */}
          <section className={s.section}>
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>התהליך</div>
              <h2 className={s.h2}>ארבעה שלבים. אתה יודע בכל רגע איפה אנחנו.</h2>
            </Fade>
            <div className={s.steps}>
              {process.map((step, i) => (
                <Fade key={step.n} delay={i * 60} className={s.step}>
                  <div className={s.stepN}>שלב {step.n}</div>
                  <h3 className={s.stepTitle}>{step.title}</h3>
                  <p className={s.stepBody}>{step.body}</p>
                  <span className={s.stepNote}>{step.note}</span>
                </Fade>
              ))}
            </div>
          </section>

          {/* ───────────────────────── TESTIMONIALS ──────────────────────── */}
          <section className={s.section}>
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>המלצות</div>
              <h2 className={s.h2}>מה אמרו אחרי שהאתר עלה</h2>
              <p style={{ paddingBlockStart: '1rem' }}>
                <span className={s.demoTag}>ציטוטים לדוגמה — להחלפה</span>
              </p>
            </Fade>
            <div className={s.quotes}>
              {testimonials.map((t, i) => (
                <Fade key={t.business} delay={i * 60} className={s.quote}>
                  <p className={s.quoteText}>״{t.quote}״</p>
                  <p className={s.quoteMeta}>
                    <span className={s.avatar} aria-hidden="true">
                      ••
                    </span>
                    <span>
                      {t.name} · {t.business}
                    </span>
                  </p>
                </Fade>
              ))}
            </div>
          </section>

          {/* ──────────────────────────── FAQ ────────────────────────────── */}
          <section className={s.section} id="m-faq">
            <Fade className={s.secHead}>
              <div className={s.eyebrow}>שאלות נפוצות</div>
              <h2 className={s.h2}>שאלות שחוזרות בכל שיחה ראשונה</h2>
            </Fade>
            <Fade>
              <MonoFaq items={faqs} />
            </Fade>
          </section>

          {/* ──────────────────────────── CTA ────────────────────────────── */}
          <Fade as="section" className={s.cta}>
            <h2 className={s.ctaTitle}>{contact.title}</h2>
            <p className={s.ctaBody}>{contact.body}</p>
            <div className={s.ctaActions}>
              <a
                className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WaIcon />
                {contact.ctaPrimary}
              </a>
              <a className={`${s.btn} ${s.btnLg} ${s.btnOnDark}`} href={`mailto:${owner.email}`}>
                {contact.ctaSecondary}
              </a>
            </div>
            <p className={s.ctaNote}>{contact.reassure}</p>
          </Fade>
        </main>

        <footer className={s.foot}>
          <p className={s.footNotice}>{demoNotice.long}</p>
          <p>
            © {new Date().getFullYear()} {owner.name}
          </p>
        </footer>
      </div>

      <div className={s.bar}>
        <a className={`${s.btn} ${s.btnPrimary}`} href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <WaIcon />
          דברו איתי בוואטסאפ
        </a>
        <p className={s.barNote}>תשובה באותו יום</p>
      </div>
    </div>
  );
}
