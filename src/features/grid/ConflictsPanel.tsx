import type { ConflictWarning } from '@/types';

interface ConflictsPanelProps {
  conflicts: ConflictWarning[];
}

export function ConflictsPanel({ conflicts }: ConflictsPanelProps) {
  if (conflicts.length === 0) return null;

  return (
    <div
      style={{
        border: '1px solid #fde68a',
        background: '#fffbeb',
        borderRadius: 8,
        padding: '0.75rem 1rem',
      }}
    >
      <p style={{ fontWeight: 600, marginTop: 0 }}>
        {conflicts.length} warning{conflicts.length === 1 ? '' : 's'}
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
        {conflicts.map((c, i) => (
          <li key={i} style={{ fontSize: 13 }}>
            {c.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
