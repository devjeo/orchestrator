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
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header>
        <h1 style={{ marginBottom: 4 }}>Smart Academic Timetable Orchestrator</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Upload your schedule, fix the mapping if needed, and see it laid
          out as a grid — all in your browser, nothing leaves your device.
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
