import type { CSSProperties } from 'react';
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
  const blockHeight = Math.max(height, 20);

  // Progressive disclosure: code + room live in the header row and
  // always show — room was getting silently dropped when it was
  // gated behind a height threshold. Title/instructor are secondary
  // and still scale with available space.
  const showTitle = blockHeight >= 30 && !!cls.subjectTitle;
  const showInstructor = blockHeight >= 52 && !!cls.instructorName;

  const tooltip = [
    `${cls.subjectCode}${cls.subjectTitle ? ' — ' + cls.subjectTitle : ''}`,
    `${formatMinutes(session.startMinutes)}–${formatMinutes(session.endMinutes)}`,
    session.room,
    cls.instructorName,
  ]
    .filter(Boolean)
    .join('\n');

  // Only truly per-instance geometry/color lives inline; everything
  // else is defined once in index.css.
  const style = {
    top,
    height: blockHeight,
    '--accent': cls.colorHex,
  } as CSSProperties;

  return (
    <div
      title={tooltip}
      className={`gridblock${hasConflict ? ' gridblock--conflict' : ''}`}
      style={style}
    >
      <div className="gridblock__header">
        <span className="gridblock__code">{cls.subjectCode}</span>
        {session.room && (
          <span className="gridblock__room">{session.room}</span>
        )}
      </div>

      {showTitle && <div className="gridblock__title">{cls.subjectTitle}</div>}

      {showInstructor && (
        <div className="gridblock__instructor">{cls.instructorName}</div>
      )}

      {hasConflict && <div className="gridblock__conflict-dot" aria-hidden />}
    </div>
  );
}