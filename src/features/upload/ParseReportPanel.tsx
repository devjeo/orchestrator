import type { ParseReport } from '@/types';

interface ParseReportPanelProps {
  report: ParseReport;
}

export function ParseReportPanel({ report }: ParseReportPanelProps) {
  const rate = report.successRate.toFixed(0);
  const rateColor =
    report.successRate >= 90
      ? '#16a34a'
      : report.successRate >= 60
        ? '#d97706'
        : '#dc2626';

  return (
    <div>
      <p style={{ fontWeight: 600 }}>
        Parsed {report.successfulRows} of {report.totalRows} rows —{' '}
        <span style={{ color: rateColor }}>{rate}% success</span>
      </p>

      {report.issues.length > 0 && (
        <div
          style={{
            border: '1px solid #fecaca',
            background: '#fef2f2',
            borderRadius: 8,
            padding: '0.75rem 1rem',
          }}
        >
          <p style={{ fontWeight: 600, marginTop: 0 }}>
            Rows that didn't parse
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {report.issues.map((issue, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <strong>Row {issue.rowIndex + 2}:</strong> {issue.rawValue} —{' '}
                {issue.reason}
                {issue.suggestion && (
                  <div style={{ color: '#64748b', fontSize: 13 }}>
                    Did you mean: {issue.suggestion}
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
