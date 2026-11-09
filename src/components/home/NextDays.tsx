import TrackedLink from '@/components/analytics/TrackedLink';
import s from './Home.module.css';

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "See the full calendar →" plus the next days with events, styled like the
 *  calendar's day strip; each day opens /calendar on that date. Today, when it
 *  has events, is shown as the active day (italic semibold). */
export default function NextDays({ days, today }: { days: string[]; today: string }) {
  return (
    <div className={`${s.wrap} ${s.nextRow}`}>
      <TrackedLink
        href="/calendar"
        event="full_calendar_click"
        params={{ from: 'home' }}
        className={`${s.more} text-ink`}
      >
        See the full calendar →
      </TrackedLink>
      {days.length > 0 && (
        <nav aria-label="Next days with events" className={s.nextDays}>
          {days.map((iso, i) => {
            const [y, m, d] = iso.split('-').map(Number);
            const isToday = iso === today;
            return (
              <TrackedLink
                key={iso}
                href={`/calendar?date=${iso}`}
                event="next_day_click"
                params={{ date: iso, position: i + 1 }}
                className={isToday ? s.nextDayActive : s.nextDay}
              >
                <span>{d}</span> <span>{DAY_FULL[new Date(y, m - 1, d).getDay()]}</span>
              </TrackedLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
