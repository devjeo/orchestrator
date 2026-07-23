import type { RawRow } from '@/types';

interface RawPreviewTableProps {
  headers: string[];
  rows: RawRow[];
  maxRows?: number;
}

export function RawPreviewTable({
  headers,
  rows,
  maxRows = 8,
}: RawPreviewTableProps) {
  if (headers.length === 0 || rows.length === 0) {
    return (
      <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>
        No rows to show yet — upload a schedule file to see a preview here.
      </p>
    );
  }

  const preview = rows.slice(0, maxRows);

  return (
    <div className="stack">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'right' }}>#</th>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                <td
                  className="mono"
                  style={{ textAlign: 'right', color: 'var(--ink-300)' }}
                >
                  {i + 2}
                </td>
                {headers.map((h) => (
                  <td key={h}>{String(row[h] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRows && (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>
          Showing the first {maxRows} of {rows.length} rows. The rest still
          get parsed — this is just a preview.
        </p>
      )}
    </div>
  );
}