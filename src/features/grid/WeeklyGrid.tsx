import { forwardRef, useMemo } from 'react';
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

// forwardRef so PNG/PDF export (Phase 5) can capture this exact DOM
// node without a separate hidden-clone render pass.
export const WeeklyGrid = forwardRef<HTMLDivElement, WeeklyGridProps>(
  function WeeklyGrid({ classes, conflicts }, ref) {
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
      for (const day of visibleDays)
        summaries.set(day, { totalHours: 0, classCount: 0, subjects: [] });
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
        <p className="weekly-grid__empty">
          No schedule to show yet — upload a file above to generate your grid.
        </p>
      );
    }

    return (
      <div className="weekly-grid" ref={ref}>
        {/* time axis */}
        <div className="time-axis">
          <div className="time-axis__header-spacer" />
          <div className="time-axis__track" style={{ height: gridHeight }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="time-axis__label"
                style={{ top: (m - rangeStart) * PX_PER_MINUTE - 7 }}
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
            <div key={day} className="day-column">
              <div className="day-header">
                {day}
                <div className="day-header__tooltip">
                  {summary.totalHours.toFixed(1)}h · {summary.classCount} class
                  {summary.classCount === 1 ? '' : 'es'} ·{' '}
                  {summary.subjects.join(', ') || 'none'}
                </div>
              </div>

              <div className="day-column__track" style={{ height: gridHeight }}>
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
                          (session.endMinutes - session.startMinutes) * PX_PER_MINUTE
                        }
                        hasConflict={conflictedClassIds.has(cls.id)}
                      />
                    )),
                )}

                {showNowLine && day === todayLabel && (
                  <div
                    className="now-line"
                    style={{ top: (nowMinutes - rangeStart) * PX_PER_MINUTE }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);