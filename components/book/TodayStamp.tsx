'use client';

import { useEffect, useState } from 'react';
import s from '@/app/book.module.css';

/**
 * The book is always open at today. Rendered on the client so the date is the
 * reader's own, not the date the site was built.
 */
export default function TodayStamp() {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date()),
    );
  }, []);

  return (
    <div className={s.dateStamp} role="img" aria-label={today ? `היומן פתוח בתאריך ${today}` : 'היומן פתוח בעמוד של היום'}>
      פנוי
      <span>{today ?? '· · / · · / · · · ·'}</span>
    </div>
  );
}
