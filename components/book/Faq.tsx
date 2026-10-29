'use client';

import { useState } from 'react';
import s from '@/app/book.module.css';
import type { Faq as FaqItem } from '@/lib/content';

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={`${s.faqItem} ${isOpen ? s.faqOpen : ''}`}>
            <h3>
              <button
                type="button"
                className={s.faqBtn}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className={s.faqSign} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div className={s.faqPanel} id={`faq-${i}`} role="region">
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
