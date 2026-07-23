import type { ClassSession, DayOfWeek } from '@/types';
import { toMinutes } from './timeUtils';

/**
 * Parses strings like:
 *   "1-2:30 pm TTh, 2-4 pm F CCMS-RM-04"
 *   "10:00-11:30am MWF Rm 201"
 *   "13:00-14:30 T"
 *
 * into structured ClassSession entries — one per day the class actually
 * meets, with times standardized to minutes-since-midnight (24h).
 *
 * This is a heuristic parser tuned to the formats registrar sheets tend to
 * use, not a full grammar. Anything it can't confidently parse is reported
 * back as a ParseIssue by the caller (see parseFile.ts) rather than
 * silently dropped or guessed.
 */

export interface SegmentParseResult {
  sessions: ClassSession[];
  error?: string;
  suggestion?: string;
}

/**
 * Longest-match-first day-code tokenizer: "Th"/"Su" before bare "T"/"S".
 * Case-insensitive — "TTh", "tth", and "Tth" all parse the same.
 */
function parseDayTokens(token: string): DayOfWeek[] {
  const days: DayOfWeek[] = [];
  const lower = token.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const two = lower.substring(i, i + 2);
    if (two === 'th') {
      days.push('Thu');
      i += 2;
      continue;
    }
    if (two === 'su') {
      days.push('Sun');
      i += 2;
      continue;
    }
    switch (lower[i]) {
      case 'm':
        days.push('Mon');
        break;
      case 't':
        days.push('Tue');
        break;
      case 'w':
        days.push('Wed');
        break;
      case 'f':
        days.push('Fri');
        break;
      case 's':
        days.push('Sat');
        break;
      // silently skip anything unrecognized (e.g. stray punctuation)
    }
    i += 1;
  }
  return days;
}

/** Splits a trailing room string into building/room if it looks like "BLDG-ROOM". */
function splitBuildingRoom(text: string): {
  building?: string;
  room?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return {};
  const dashIndex = trimmed.indexOf('-');
  if (dashIndex > 0) {
    const first = trimmed.slice(0, dashIndex);
    // treat the first hyphen-segment as a building code only if it's
    // letters-only (e.g. "CCMS-RM-04" -> building "CCMS")
    if (/^[A-Za-z]+$/.test(first)) {
      return { building: first, room: trimmed.slice(dashIndex + 1) };
    }
  }
  return { room: trimmed };
}

const TIME = String.raw`(\d{1,2})(?::(\d{2}))?\s*(am|pm)?`;
const SEGMENT_RE = new RegExp(
  `^\\s*${TIME}\\s*-\\s*${TIME}\\s+([MTWFSUmtwfsu]+)\\s*(.*)$`,
  'i',
);

/** Parses one comma-separated segment, e.g. "2-4 pm F CCMS-RM-04". */
function parseSegment(segment: string): SegmentParseResult {
  const match = segment.trim().match(SEGMENT_RE);
  if (!match) {
    return {
      sessions: [],
      error: 'Could not find a "<start>-<end> <days>" pattern',
      suggestion:
        'Expected something like "1-2:30 pm TTh Room 201" — check the time range and day letters.',
    };
  }

  const [
    ,
    startHourStr,
    startMinStr,
    startMeridiemRaw,
    endHourStr,
    endMinStr,
    endMeridiemRaw,
    dayToken,
    rest,
  ] = match;

  const startHour = parseInt(startHourStr, 10);
  const startMin = startMinStr ? parseInt(startMinStr, 10) : 0;
  const endHour = parseInt(endHourStr, 10);
  const endMin = endMinStr ? parseInt(endMinStr, 10) : 0;

  let startMeridiem = (startMeridiemRaw?.toLowerCase() ?? null) as
    | 'am'
    | 'pm'
    | null;
  let endMeridiem = (endMeridiemRaw?.toLowerCase() ?? null) as
    | 'am'
    | 'pm'
    | null;

  // Common registrar shorthand: only the end has "pm" and it's meant to
  // apply to both ("1-2:30 pm" = 1:00pm-2:30pm, not 1:00am-2:30pm).
  if (!startMeridiem && endMeridiem) startMeridiem = endMeridiem;
  if (!endMeridiem && startMeridiem) endMeridiem = startMeridiem;

  let startMinutes = toMinutes(startHour, startMin, startMeridiem);
  const endMinutes = toMinutes(endHour, endMin, endMeridiem);

  // If inheriting the meridiem produces a non-positive duration (e.g.
  // "11-1 pm" naively read as 23:00-13:00), flip the start to AM.
  if (endMinutes <= startMinutes && startMeridiem === 'pm') {
    startMinutes = toMinutes(startHour, startMin, 'am');
  }

  if (endMinutes <= startMinutes) {
    return {
      sessions: [],
      error: `Parsed end time is not after start time (${startHourStr}${
        startMinStr ? ':' + startMinStr : ''
      } -> ${endHourStr}${endMinStr ? ':' + endMinStr : ''})`,
      suggestion: 'Double check AM/PM on the start and end time.',
    };
  }

  const days = parseDayTokens(dayToken);
  if (days.length === 0) {
    return {
      sessions: [],
      error: `Could not read day letters "${dayToken}"`,
      suggestion: 'Use M/T/W/Th/F/S/Su, e.g. "MWF" or "TTh".',
    };
  }

  const { building, room } = splitBuildingRoom(rest);

  const sessions: ClassSession[] = days.map((day) => ({
    id: crypto.randomUUID(),
    day,
    startMinutes,
    endMinutes,
    room,
    building,
  }));

  return { sessions };
}

export interface ScheduleParseResult {
  sessions: ClassSession[];
  errors: string[];
  suggestion?: string;
}

/** Auto-splits multi-session classes: comma/semicolon-separated day/time blocks. */
export function parseScheduleString(raw: string): ScheduleParseResult {
  const segments = raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return { sessions: [], errors: ['Schedule string is empty'] };
  }

  const sessions: ClassSession[] = [];
  const errors: string[] = [];
  let suggestion: string | undefined;

  for (const segment of segments) {
    const result = parseSegment(segment);
    if (result.error) {
      errors.push(`"${segment}": ${result.error}`);
      suggestion = suggestion ?? result.suggestion;
    } else {
      sessions.push(...result.sessions);
    }
  }

  return { sessions, errors, suggestion };
}
