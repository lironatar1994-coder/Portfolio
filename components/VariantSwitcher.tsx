'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { variants } from '@/lib/content';
import s from './VariantSwitcher.module.css';

/**
 * PREVIEW CONTROL — not part of any of the three designs.
 * Lets the three visual worlds be compared side by side. Remove before launch.
 */
export default function VariantSwitcher() {
  const path = usePathname();

  return (
    <nav className={s.wrap} aria-label="בחירת גרסת עיצוב">
      <span className={s.tag}>גרסאות עיצוב</span>
      {variants.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          className={`${s.link} ${path === v.href ? s.on : ''}`}
          aria-current={path === v.href ? 'page' : undefined}
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}
