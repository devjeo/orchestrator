import { useMemo, useState } from 'react';
import type { ConflictWarning, DayOfWeek, ParsedClass } from '@/types';
import { formatMinutes } from '@/lib/parsing';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { GridBlock } from './GridBlock';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PX_PER_MINUTE = 1;
const HOUR_BUFFER = 60; // minutes of padding shown before/after the earliest/latest class

interface WeeklyGridProps {
  classes: ParsedClass[];
  conflicts: ConflictWarning[];
}

export function WeeklyGrid({ classes, conflicts }: WeeklyGridProps) {
  const [hoveredDay, setHoveredDay] = useState<DayOfWeek | null>(null);
  const { dayIndex, minutes: nowMinutes } = useCurrentTime();

  const conflictedClassIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) {
      if (c.type === 'time-overlap') c.classIds.forEach((id) => ids.add(id));
    }
    return ids;
  }, [conflicts]);

  const { visibleDays, rangeStart, rangeEnd } = useMemo(() => {
    const daysWithSessions = new Set<DayOfWeek>();
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const cls of classes) {
      for (const s of cls.sessions) {
        daysWithSessions.add(s.day);
        minStart = Math.min(minStart, s.startMinutes);
        maxEnd = Math.max(maxEnd, s.endMinutes);
      }
    }
    const days = ALL_DAYS.filter((d) =>
      daysWithSessions.size > 0 ? daysWithSessions.has(d) : DEFAULT_DAYS.includes(d),
    );
    const start = Number.isFinite(minStart)
      ? Math.max(0, Math.floor((minStart - HOUR_BUFFER) / 60) * 60)
      : 7 * 60;
    const end = Number.isFinite(maxEnd)
      ? Math.min(24 * 60, Math.ceil((maxEnd + HOUR_BUFFER) / 60) * 60)
      : 21 * 60;
    return {
      visibleDays: days.length > 0 ? days : DEFAULT_DAYS,
      rangeStart: start,
      rangeEnd: end,
    };
  }, [classes]);

  const totalMinutes = rangeEnd - rangeStart;
  const gridHeight = totalMinutes * PX_PER_MINUTE;

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = Math.ceil(rangeStart / 60) * 60; m <= rangeEnd; m += 60) {
      marks.push(m);
    }
    return marks;
  }, [rangeStart, rangeEnd]);

  const daySummaries = useMemo(() => {
    const summaries = new Map<
      DayOfWeek,
      { totalHours: number; classCount: number; subjects: string[] }
    >();
    for (const day of visibleDays) summaries.set(day, { totalHours: 0, classCount: 0, subjects: [] });
    for (const cls of classes) {
      for (const s of cls.sessions) {
        const entry = summaries.get(s.day);
        if (!entry) continue;
        entry.totalHours += (s.endMinutes - s.startMinutes) / 60;
        entry.classCount += 1;
        if (!entry.subjects.includes(cls.subjectCode)) entry.subjects.push(cls.subjectCode);
      }
    }
    return summaries;
  }, [classes, visibleDays]);

  const todayLabel = ALL_DAYS[dayIndex];
  const showNowLine =
    visibleDays.includes(todayLabel) && nowMinutes >= rangeStart && nowMinutes <= rangeEnd;

  if (classes.length === 0) {
    return (
      <p style={{ color: '#64748b' }}>
        No schedule to show yet — upload a file above to generate your grid.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', overflowX: 'auto' }}>
      {/* time axis */}
      <div style={{ width: 56, flexShrink: 0 }}>
        <div style={{ height: 32 }} />
        <div style={{ position: 'relative', height: gridHeight }}>
          {hourMarks.map((m) => (
            <div
              key={m}
              style={{
                position: 'absolute',
                top: (m - rangeStart) * PX_PER_MINUTE - 7,
                right: 6,
                fontSize: 11,
                color: '#94a3b8',
              }}
            >
              {formatMinutes(m)}
            </div>
          ))}
        </div>
      </div>

      {/* day columns */}
      {visibleDays.map((day) => {
        const summary = daySummaries.get(day)!;
        return (
          <div key={day} style={{ flex: 1, minWidth: 120 }}>
            <div
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                position: 'relative',
                cursor: 'default',
                borderBottom: '2px solid #e2e8f0',
              }}
            >
              {day}
              {hoveredDay === day && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1e293b',
                    color: 'white',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  {summary.totalHours.toFixed(1)}h · {summary.classCount} class
                  {summary.classCount === 1 ? '' : 'es'} ·{' '}
                  {summary.subjects.join(', ') || 'none'}
                </div>
              )}
            </div>

            <div
              style={{
                position: 'relative',
                height: gridHeight,
                borderLeft: '1px solid #f1f5f9',
                background:
                  'repeating-linear-gradient(to bottom, transparent, transparent 59px, #f8fafc 59px, #f8fafc 60px)',
              }}
            >
              {classes.flatMap((cls) =>
                cls.sessions
                  .filter((s) => s.day === day)
                  .map((session) => (
                    <GridBlock
                      key={session.id}
                      cls={cls}
                      session={session}
                      top={(session.startMinutes - rangeStart) * PX_PER_MINUTE}
                      height={
                        (session.endMinutes - session.startMinutes) *
                        PX_PER_MINUTE
                      }
                      hasConflict={conflictedClassIds.has(cls.id)}
                    />
                  )),
              )}

              {showNowLine && day === todayLabel && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: (nowMinutes - rangeStart) * PX_PER_MINUTE,
                    height: 2,
                    background: 'rgba(220, 38, 38, 0.6)',
                    zIndex: 5,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
