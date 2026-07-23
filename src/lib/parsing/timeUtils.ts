/** Parses "1", "2:30", "10", "12" (+ optional meridiem) into minutes since midnight. */
export function toMinutes(
  hour: number,
  minute: number,
  meridiem: 'am' | 'pm' | null,
): number {
  let h = hour % 12;
  if (meridiem === 'pm') h += 12;
  // meridiem === null is treated as already-24h (e.g. "13:00")
  if (meridiem === null) h = hour;
  return h * 60 + minute;
}

export function formatMinutes(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${meridiem}`;
}
