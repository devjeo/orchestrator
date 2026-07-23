import type { ParsedClass, ClassSession } from '@/types';
import { formatMinutes } from '@/lib/parsing';

interface GridBlockProps {
  cls: ParsedClass;
  session: ClassSession;
  top: number;
  height: number;
  hasConflict: boolean;
}

export function GridBlock({
  cls,
  session,
  top,
  height,
  hasConflict,
}: GridBlockProps) {
  return (
    <div
      title={`${cls.subjectCode}${cls.subjectTitle ? ' — ' + cls.subjectTitle : ''}\n${formatMinutes(session.startMinutes)}–${formatMinutes(session.endMinutes)}${session.room ? '\n' + session.room : ''}`}
      style={{
        position: 'absolute',
        top,
        height: Math.max(height, 20),
        left: 2,
        right: 2,
        background: cls.colorHex,
        border: hasConflict ? '2px solid #dc2626' : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 6,
        padding: '2px 6px',
        overflow: 'hidden',
        fontSize: 12,
        lineHeight: 1.3,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 700 }}>{cls.subjectCode}</div>
      {height > 34 && session.room && (
        <div style={{ opacity: 0.75 }}>{session.room}</div>
      )}
    </div>
  );
}
