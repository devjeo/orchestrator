import type { ParseReport } from '@/types';

interface ParseReportPanelProps {
  report: ParseReport;
}

function badgeClassFor(rate: number): string {
  if (rate >= 90) return 'badge badge-sage';
  if (rate >= 60) return 'badge badge-amber';
  return 'badge badge-rose';
}

export function ParseReportPanel({ report }: ParseReportPanelProps) {
  const rate = Math.round(report.successRate);
  const allGood = report.issues.length === 0;

  return (
    <div className="stack">
      <div className="row-between">
        <p style={{ fontWeight: 600 }}>
          Parsed {report.successfulRows} of {report.totalRows} rows
        </p>
        <span className={badgeClassFor(report.successRate)}>{rate}% parsed</span>
      </div>

      {allGood ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>
          Every row came through cleanly — nothing to fix.
        </p>
      ) : (
        <div className="alert alert-error" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <p style={{ fontWeight: 600 }}>
            {report.issues.length === 1
              ? "1 row couldn't be read"
              : `${report.issues.length} rows couldn't be read`}
          </p>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
            {report.issues.map((issue, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <span className="mono" style={{ fontWeight: 600 }}>
                  Row {issue.rowIndex + 2}
                </span>
                {': "'}
                {issue.rawValue}
                {'" — '}
                {issue.reason}
                {issue.suggestion && (
                  <div style={{ color: '#7a2b26', fontSize: 13, marginTop: 2 }}>
                    Did you mean{' '}
                    <span className="mono">"{issue.suggestion}"</span>?
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}