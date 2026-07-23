import { useStore } from '@/store';
import { UploadFlow } from '@/features/upload/UploadFlow';
import { ParseReportPanel } from '@/features/upload/ParseReportPanel';
import { WeeklyGrid } from '@/features/grid/WeeklyGrid';
import { ConflictsPanel } from '@/features/grid/ConflictsPanel';

export function HomePage() {
  const classes = useStore((s) => s.classes);
  const parseReport = useStore((s) => s.parseReport);
  const conflicts = useStore((s) => s.conflicts);

  const hasSchedule = classes.length > 0;

  return (
    <main className="shell">
      <header className="app-header">
        <span className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          Local-only · nothing leaves your device
        </span>
        <h1 className="app-title">Smart Academic Timetable Orchestrator</h1>
        <p className="app-subtitle">
          Upload your schedule, fix the column mapping if something's
          guessed wrong, and see it laid out as a weekly grid — parsed and
          rendered entirely in your browser.
        </p>
      </header>

      <UploadFlow />

      {parseReport && <ParseReportPanel report={parseReport} />}

      {hasSchedule && (
        <>
          <ConflictsPanel conflicts={conflicts} />
          <WeeklyGrid classes={classes} conflicts={conflicts} />
        </>
      )}
    </main>
  );
}