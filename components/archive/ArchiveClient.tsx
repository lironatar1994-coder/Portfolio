'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import s from '@/app/archive/archive.module.css';
import type { Project, Faq as FaqItem } from '@/lib/content';

/* ── one-line silhouette art, drawn in the world's own grammar ──────────── */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const SILHOUETTES: Record<string, React.ReactNode> = {
  lehem: (
    <>
      <path {...stroke} d="M6 26c0-7 5-12 12-12h12c7 0 12 5 12 12 0 6-4 10-10 10H16c-6 0-10-4-10-10Z" />
      <path {...stroke} d="M16 15c1-4 3-6 6-6M25 14c1-4 3-6 6-6" />
      <path {...stroke} d="M14 22h4M22 22h4M30 22h4" />
    </>
  ),
  'mispar-12': (
    <>
      <circle {...stroke} cx="24" cy="26" r="12" />
      <circle {...stroke} cx="24" cy="26" r="5" />
      <path {...stroke} d="M9 12v9M40 12v6c0 2-2 3-3 3M40 21v14" />
    </>
  ),
  'clinic-dental': (
    <>
      <path
        {...stroke}
        d="M24 12c-4-3-11-3-13 3-2 6 1 12 2 18 1 4 4 6 5 1l3-9c1-3 5-3 6 0l3 9c1 5 4 3 5-1 1-6 4-12 2-18-2-6-9-6-13-3Z"
      />
    </>
  ),
  'studio-move': (
    <>
      <circle {...stroke} cx="27" cy="11" r="4" />
      <path {...stroke} d="M27 16v9l-8 6M27 25l8 5M8 38h32" />
      <path {...stroke} d="M19 31l-6 7M35 30l4 8" />
    </>
  ),
  'salon-nine': (
    <>
      <circle {...stroke} cx="12" cy="34" r="5" />
      <circle {...stroke} cx="12" cy="14" r="5" />
      <path {...stroke} d="M16 31 40 9M16 17 40 39" />
      <path {...stroke} d="m24 24 4 4" />
    </>
  ),
  'boutique-atid': (
    <>
      <path {...stroke} d="M24 14a4 4 0 1 1 4 4c-3 0-4 2-4 4" />
      <path {...stroke} d="M24 22 8 33c-2 1-1 5 2 5h28c3 0 4-4 2-5L24 22Z" />
    </>
  ),
};

function Silhouette({ id }: { id: string }) {
  return (
    <svg className={s.silhouette} viewBox="0 0 48 48" aria-hidden="true">
      {SILHOUETTES[id] ?? <rect {...stroke} x="8" y="10" width="32" height="28" rx="2" />}
    </svg>
  );
}

/* ── reveal ─────────────────────────────────────────────────────────────── */

export function Fade({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${s.reveal} ${on ? s.revealIn : ''} ${className}`.trim()}
      style={{ transitionDelay: on ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}

/* ── the wall of boxes ──────────────────────────────────────────────────── */

export function Wall({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className={s.stack}>
      {projects.map((p, i) => {
        const isOpen = open === p.id;
        const ref = `LR-${String(i + 1).padStart(2, '0')}`;
        return (
          <div key={p.id} className={`${s.box} ${isOpen ? s.boxOpen : ''}`}>
            <button
              type="button"
              className={s.lid}
              aria-expanded={isOpen}
              aria-controls={`box-${p.id}`}
              onClick={() => setOpen(isOpen ? null : p.id)}
            >
              <span className={s.lidTop}>
                <Silhouette id={p.id} />
                <span className={s.lidRef}>
                  {ref}
                  <br />
                  {p.year}
                </span>
              </span>

              <span>
                <span className={s.lidName}>{p.name}</span>
                <span className={s.lidKind}>
                  {p.kind} · {p.city}
                </span>
              </span>

              <span className={s.sizeRun}>
                <span className={s.size}>נייד ראשון</span>
                <span className={s.size}>עברית RTL</span>
                <span className={s.size}>נגיש</span>
                <span className={s.size}>{p.stamp}</span>
              </span>

              <span className={s.chipStrip}>
                <span className={s.chip} style={{ background: p.colorway }} />
                <span className={s.chipName}>{p.colorwayName}</span>
                <span className={s.openHint}>{isOpen ? 'סגירה −' : 'פתיחה +'}</span>
              </span>
            </button>

            <div className={s.contents} id={`box-${p.id}`} role="region" aria-label={p.name}>
              <div className={s.contentsInner}>
                <div className={s.tissue}>
                  <div className={s.photo}>
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 860px) 92vw, 44vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className={s.photoTag}>תצלום ממאגר חופשי · להחלפה</span>
                  </div>

                  <div>
                    <p className={s.label}>מה היה קודם</p>
                    <p className={s.body}>{p.before}</p>

                    <p className={s.label} style={{ paddingBlockStart: '1.2rem' }}>
                      מה נבנה
                    </p>
                    <ul className={s.builtList}>
                      {p.built.map((b, bi) => (
                        <li key={b} className={s.builtItem}>
                          <span>{String(bi + 1).padStart(2, '0')}</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <p className={s.outcome}>
                      <b>מה השתנה · נתוני הדגמה</b>
                      {p.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── faq ────────────────────────────────────────────────────────────────── */

export function ArchiveFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={s.faq}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`${s.faqItem} ${isOpen ? s.faqOpen : ''}`}>
            <h3>
              <button
                type="button"
                className={s.faqBtn}
                aria-expanded={isOpen}
                aria-controls={`afaq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className={s.faqSign} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div className={s.faqPanel} id={`afaq-${i}`} role="region">
              <div className={s.faqPanelInner}>
                <p className={s.faqAnswer}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
