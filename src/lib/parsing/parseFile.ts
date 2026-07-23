import * as XLSX from 'xlsx';
import type {
  ColumnMapping,
  ParseIssue,
  ParseReport,
  ParsedClass,
  RawRow,
} from '@/types';
import { guessColumnMapping } from './headerAliasing';
import { parseScheduleString } from './scheduleStringParser';
import { colorForSubject } from './colors';

export interface FileReadResult {
  headers: string[];
  rawRows: RawRow[];
  mapping: ColumnMapping;
  unmatchedColumns: string[];
}

/** Reads a .xlsx/.xls file and returns the first row's headers + raw data rows. */
export async function readWorkbook(file: File): Promise<FileReadResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  });

  if (rows.length === 0) {
    return { headers: [], rawRows: [], mapping: {} as ColumnMapping, unmatchedColumns: [] };
  }

  const headers = (rows[0] as unknown[]).map((h) => String(h ?? '').trim());
  const rawRows: RawRow[] = rows.slice(1).map((row) => {
    const obj: RawRow = {};
    headers.forEach((h, i) => {
      const cell = (row as unknown[])[i];
      obj[h] = cell === undefined || cell === null ? undefined : cell;
    });
    return obj;
  });

  const { mapping, unmatchedColumns } = guessColumnMapping(headers);

  return { headers, rawRows, mapping, unmatchedColumns };
}

export interface BuildClassesResult {
  classes: ParsedClass[];
  report: ParseReport;
}

/**
 * Parses raw rows into ParsedClass entries using a (possibly manually
 * corrected) column mapping. Rows that fail to parse are recorded in the
 * ParseReport rather than dropped silently or half-guessed.
 */
export function buildClasses(
  rawRows: RawRow[],
  mapping: ColumnMapping,
): BuildClassesResult {
  const classes: ParsedClass[] = [];
  const issues: ParseIssue[] = [];

  rawRows.forEach((row, index) => {
    const subjectCodeCol = mapping.subjectCode;
    const scheduleCol = mapping.scheduleString;

    const subjectCode = subjectCodeCol
      ? String(row[subjectCodeCol] ?? '').trim()
      : '';
    const rawScheduleString = scheduleCol
      ? String(row[scheduleCol] ?? '').trim()
      : '';

    if (!subjectCode) {
      issues.push({
        rowIndex: index,
        rawValue: JSON.stringify(row),
        reason: 'Missing subject code',
      });
      return;
    }
    if (!rawScheduleString) {
      issues.push({
        rowIndex: index,
        rawValue: subjectCode,
        reason: 'Missing schedule string',
      });
      return;
    }

    const { sessions, errors, suggestion } =
      parseScheduleString(rawScheduleString);

    if (sessions.length === 0) {
      issues.push({
        rowIndex: index,
        rawValue: `${subjectCode}: "${rawScheduleString}"`,
        reason: errors.join('; ') || 'Could not parse schedule string',
        suggestion,
      });
      return;
    }

    const unitsCol = mapping.units;
    const unitsRaw = unitsCol ? row[unitsCol] : undefined;
    const units =
      unitsRaw !== undefined && unitsRaw !== ''
        ? Number(unitsRaw)
        : undefined;

    classes.push({
      id: crypto.randomUUID(),
      subjectCode,
      subjectTitle: mapping.subjectTitle
        ? String(row[mapping.subjectTitle] ?? '').trim() || undefined
        : undefined,
      instructorName: mapping.instructorName
        ? String(row[mapping.instructorName] ?? '').trim() || undefined
        : undefined,
      units: Number.isFinite(units) ? units : undefined,
      colorHex: colorForSubject(subjectCode),
      rawScheduleString,
      sessions,
      sourceRowIndex: index,
    });
  });

  const totalRows = rawRows.length;
  const successfulRows = totalRows - issues.length;
  const report: ParseReport = {
    totalRows,
    successfulRows,
    issues,
    successRate: totalRows === 0 ? 0 : (successfulRows / totalRows) * 100,
  };

  return { classes, report };
}
