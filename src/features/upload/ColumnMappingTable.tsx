import type { CSSProperties } from 'react';
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
    <div>
      {fallbackMode && (
        <p
          role="alert"
          style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: 12,
          }}
        >
          None of the columns matched automatically. Map each field below
          manually to continue.
        </p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Field</th>
            <th style={thStyle}>Source column</th>
          </tr>
        </thead>
        <tbody>
          {REQUIRED_FIELDS.map((field) => (
            <tr key={field}>
              <td style={tdStyle}>
                {FIELD_LABELS[field]}
                {MANDATORY_FIELDS.includes(field) && (
                  <span style={{ color: '#dc2626' }}> *</span>
                )}
              </td>
              <td style={tdStyle}>
                <select
                  value={mapping[field] ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...mapping,
                      [field]: e.target.value || null,
                    })
                  }
                  style={{ width: '100%', padding: '0.4rem' }}
                >
                  <option value="">— none —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {unmatchedColumns.length > 0 && (
        <p style={{ color: '#64748b', marginTop: 12, fontSize: 14 }}>
          Not used: {unmatchedColumns.join(', ')}
        </p>
      )}
    </div>
  );
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid #e2e8f0',
  padding: '0.5rem',
};
const tdStyle: CSSProperties = {
  borderBottom: '1px solid #f1f5f9',
  padding: '0.5rem',
};
