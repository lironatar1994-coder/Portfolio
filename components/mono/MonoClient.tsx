'use client';

import { useEffect, useRef, useState } from 'react';
import s from '@/app/mono/mono.module.css';
import type { Faq as FaqItem } from '@/lib/content';

export function Fade({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section';
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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
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

export function MonoFaq({ items }: { items: FaqItem[] }) {
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
                aria-controls={`mfaq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className={s.faqSign} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div className={s.faqPanel} id={`mfaq-${i}`} role="region">
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
