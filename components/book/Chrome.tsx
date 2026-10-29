'use client';

import { useEffect, useState } from 'react';
import s from '@/app/book.module.css';

type Section = { id: string; label: string };

/**
 * The book's physical chrome: a satin ribbon marker hanging from the spine
 * that grows with reading depth, and fore-edge index tabs that track the
 * section currently under the reader. RTL book anatomy — spine right, tabs left.
 */
export default function Chrome({ sections }: { sections: Section[] }) {
  const [depth, setDepth] = useState(0);
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setDepth(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <div className={s.spine} aria-hidden="true" />
      <div
        className={s.ribbon}
        aria-hidden="true"
        style={{ ['--ribbon-h' as string]: `${8 + depth * 84}%` }}
      />
      <nav className={s.tabs} aria-label="ניווט בפנקס">
        {sections.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className={`${s.tab} ${active === sec.id ? s.tabOn : ''}`}
            aria-current={active === sec.id ? 'true' : undefined}
          >
            {sec.label}
          </a>
        ))}
      </nav>
    </>
  );
}
