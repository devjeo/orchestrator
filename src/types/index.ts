/**
 * Base types (Phase 0).
 */

export type DayOfWeek =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun';

export type AppMode = 'local-only' | 'cloud-synced';

/**
 * Phase 1 types — upload, parsing, and the grid data model.
 * Mirrors the `classes` / `class_sessions` shape from PROJECT.md §3 so the
 * local-only data model needs no reshaping when Phase 6 adds cloud sync.
 */

/** A single row read straight out of the uploaded sheet, header→cell. */
export interface RawRow {
  [column: string]: string | number | undefined;
}

/** The fields the app needs out of an uploaded sheet. */
export type RequiredField =
  | 'subjectCode'
  | 'subjectTitle'
  | 'instructorName'
  | 'units'
  | 'scheduleString';

export const REQUIRED_FIELDS: RequiredField[] = [
  'subjectCode',
  'subjectTitle',
  'instructorName',
  'units',
  'scheduleString',
];

/** Only `subjectCode` and `scheduleString` are truly required to parse a row. */
export const MANDATORY_FIELDS: RequiredField[] = [
  'subjectCode',
  'scheduleString',
];

/** field -> source column name in the uploaded file, or null if unmapped. */
export type ColumnMapping = Record<RequiredField, string | null>;

export interface ClassSession {
  id: string;
  day: DayOfWeek;
  /** Minutes since midnight, 24h-standardized. */
  startMinutes: number;
  endMinutes: number;
  room?: string;
  building?: string;
}

export interface ParsedClass {
  id: string;
  subjectCode: string;
  subjectTitle?: string;
  instructorName?: string;
  units?: number;
  colorHex: string;
  /** Preserved verbatim — revert-to-original never requires re-uploading (PROJECT.md §9 rule 4). */
  rawScheduleString: string;
  sessions: ClassSession[];
  sourceRowIndex: number;
}

export interface ParseIssue {
  rowIndex: number;
  rawValue: string;
  reason: string;
  suggestion?: string;
}

export interface ParseReport {
  totalRows: number;
  successfulRows: number;
  issues: ParseIssue[];
  successRate: number; // 0-100
}

export type ConflictType =
  | 'time-overlap'
  | 'room-distance'
  | 'duplicate-subject';

export interface ConflictWarning {
  type: ConflictType;
  classIds: string[];
  message: string;
}

