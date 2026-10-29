'use client';

import { useState } from 'react';
import Image from 'next/image';
import s from '@/app/book.module.css';
import type { Project } from '@/lib/content';

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none">
      <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tick() {
  return (
    <svg className={s.builtTick} viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M2.5 8.6 6 12 13.5 3.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Each delivered project is a line written into the book. Opening a line turns
 * the entry over: what was broken, what was actually built, what changed.
 */
export default function Entries({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(projects[0]?.id ?? null);

  return (
    <div>
      {projects.map((p, i) => {
        const isOpen = open === p.id;
        return (
          <div key={p.id} className={`${s.entry} ${isOpen ? s.entryOpen : ''}`}>
            <button
              type="button"
              className={s.entryBtn}
              aria-expanded={isOpen}
              aria-controls={`entry-${p.id}`}
              onClick={() => setOpen(isOpen ? null : p.id)}
            >
              <span className={s.entryNo}>{String(i + 1).padStart(2, '0')}</span>
              <span className={s.entryMain}>
                <span className={s.entryName}>{p.name}</span>
                <span className={s.entryMeta}>
                  {p.kind} · {p.city} · {p.year}
                </span>
              </span>
              <span className={s.entryRight}>
                <span className={s.entryStamp}>{p.stamp}</span>
                <span className={s.entryChevron}>
                  <Chevron />
                </span>
              </span>
            </button>

            <div className={s.entryPanel} id={`entry-${p.id}`} role="region" aria-label={p.name}>
              <div className={s.entryPanelInner}>
                <div className={s.entryDetail}>
                  <div className={s.shot}>
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 820px) 92vw, 42vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <span className={s.shotCaption}>תצלום ממאגר חופשי · להחלפה בצילום אמיתי</span>
                  </div>

                  <div>
                    <p className={s.detailLabel}>מה היה קודם</p>
                    <p className={s.detailText}>{p.before}</p>

                    <p className={s.detailLabel} style={{ paddingBlockStart: '1.25rem' }}>
                      מה נבנה
                    </p>
                    <ul className={s.builtList}>
                      {p.built.map((b) => (
                        <li key={b} className={s.builtItem}>
                          <Tick />
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
