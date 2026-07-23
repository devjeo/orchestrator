import type { ColumnMapping, RequiredField } from '@/types';
import { MANDATORY_FIELDS, REQUIRED_FIELDS } from '@/types';
import { isMappingEmpty } from '@/lib/parsing';

const FIELD_LABELS: Record<RequiredField, string> = {
  subjectCode: 'Subject Code',
  subjectTitle: 'Subject Title',
  instructorName: 'Instructor',
  units: 'Units',
  scheduleString: 'Schedule',
};

interface ColumnMappingTableProps {
  headers: string[];
  mapping: ColumnMapping;
  unmatchedColumns: string[];
  onChange: (mapping: ColumnMapping) => void;
}

export function ColumnMappingTable({
  headers,
  mapping,
  unmatchedColumns,
  onChange,
}: ColumnMappingTableProps) {
  const fallbackMode = isMappingEmpty(mapping);

  return (
    <div className="stack">
      {fallbackMode && (
        <p
          role="alert"
          style={{
            background: 'var(--amber-tint)',
            border: '1px solid var(--amber)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            lineHeight: 1.45,
          }}
        >
          We couldn't match any columns automatically. Pick the right source
          column for each field below to continue.
        </p>
      )}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Source column</th>
            </tr>
          </thead>
          <tbody>
            {REQUIRED_FIELDS.map((field) => {
              const isMandatory = MANDATORY_FIELDS.includes(field);
              const isUnmapped = !mapping[field];
              const needsAttention = isMandatory && isUnmapped;

              return (
                <tr
                  key={field}
                  style={
                    needsAttention
                      ? { background: 'var(--rose-tint)' }
                      : undefined
                  }
                >
                  <td>
                    {FIELD_LABELS[field]}
                    {isMandatory && (
                      <span
                        title="Required"
                        style={{ color: 'var(--rose)' }}
                      >
                        {' '}
                        *
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      value={mapping[field] ?? ''}
                      aria-label={`Source column for ${FIELD_LABELS[field]}`}
                      onChange={(e) =>
                        onChange({
                          ...mapping,
                          [field]: e.target.value || null,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${
                          needsAttention ? 'var(--rose)' : 'var(--line-strong)'
                        }`,
                        background: 'var(--paper-raised)',
                        color: 'var(--ink-900)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="">— not mapped —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {unmatchedColumns.length > 0 && (
        <div>
          <p
            style={{ color: 'var(--ink-500)', fontSize: 13, marginBottom: 6 }}
          >
            Not used from your file:
          </p>
          <div className="row" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
            {unmatchedColumns.map((col) => (
              <span key={col} className="badge badge-teal">
                {col}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}