import { useEffect, useState } from 'react';

/** Returns [dayOfWeekIndex(0=Mon..6=Sun), minutesSinceMidnight], refreshed every minute. */
export function useCurrentTime(): { dayIndex: number; minutes: number } {
  const compute = () => {
    const now = new Date();
    // JS getDay(): 0=Sun..6=Sat -> convert to 0=Mon..6=Sun
    const dayIndex = (now.getDay() + 6) % 7;
    const minutes = now.getHours() * 60 + now.getMinutes();
    return { dayIndex, minutes };
  };

  const [time, setTime] = useState(compute);

  useEffect(() => {
    const interval = setInterval(() => setTime(compute()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
