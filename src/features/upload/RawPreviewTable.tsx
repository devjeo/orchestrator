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
  const preview = rows.slice(0, maxRows);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  borderBottom: '2px solid #e2e8f0',
                  padding: '0.4rem 0.6rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td
                  key={h}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    padding: '0.4rem 0.6rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {String(row[h] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
          Showing {maxRows} of {rows.length} rows.
        </p>
      )}
    </div>
  );
}
