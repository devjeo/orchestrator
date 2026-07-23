import type { ColumnMapping, RequiredField } from '@/types';
import { REQUIRED_FIELDS } from '@/types';
import { levenshtein } from './levenshtein';

/**
 * Known synonyms per field, already normalized (see `normalizeHeader`).
 * Add to these lists as real-world sheets surface new variants — this is
 * meant to grow, not be exhaustive on day one.
 */
const SYNONYMS: Record<RequiredField, string[]> = {
  subjectCode: [
    'subjectcode',
    'subjcode',
    'subj',
    'code',
    'coursecode',
    'courseno',
    'courseid',
  ],
  subjectTitle: [
    'subjecttitle',
    'subject',
    'title',
    'coursetitle',
    'description',
    'coursedescription',
  ],
  instructorName: [
    'instructor',
    'instructorname',
    'professor',
    'faculty',
    'facultyname',
    'teacher',
  ],
  units: ['units', 'unit', 'credits', 'credit', 'credithours'],
  scheduleString: [
    'schedule',
    'scheduel', // deliberate common typo, also caught by fuzzy match below
    'sched',
    'time',
    'daytime',
    'schedule string',
    'classschedule',
    'timeslot',
  ],
};

/** Strips case, periods, underscores, and extra spaces for flexible matching. */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[._]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

const FUZZY_MAX_DISTANCE = 2;

/**
 * Given the raw header row from an uploaded sheet, guesses a mapping from
 * each RequiredField to a source column. Falls back to fuzzy (typo-
 * tolerant) matching against the synonym table when no exact hit is found.
 * Returns both the guessed mapping and the list of source columns that
 * matched nothing, so the caller can show the "unmatched column" warning.
 */
export function guessColumnMapping(headers: string[]): {
  mapping: ColumnMapping;
  unmatchedColumns: string[];
} {
  const normalizedToOriginal = new Map<string, string>();
  for (const h of headers) normalizedToOriginal.set(normalizeHeader(h), h);

  const mapping = {} as ColumnMapping;
  const claimedColumns = new Set<string>();

  for (const field of REQUIRED_FIELDS) {
    let matchedOriginal: string | null = null;

    // 1. exact normalized match against the synonym list
    for (const syn of SYNONYMS[field]) {
      const original = normalizedToOriginal.get(syn);
      if (original && !claimedColumns.has(original)) {
        matchedOriginal = original;
        break;
      }
    }

    // 2. fuzzy match (typo tolerance) if nothing exact was found
    if (!matchedOriginal) {
      let bestDistance = Infinity;
      let bestOriginal: string | null = null;
      for (const [normalized, original] of normalizedToOriginal) {
        if (claimedColumns.has(original)) continue;
        for (const syn of SYNONYMS[field]) {
          const d = levenshtein(normalized, syn);
          if (d < bestDistance) {
            bestDistance = d;
            bestOriginal = original;
          }
        }
      }
      if (bestOriginal && bestDistance <= FUZZY_MAX_DISTANCE) {
        matchedOriginal = bestOriginal;
      }
    }

    mapping[field] = matchedOriginal;
    if (matchedOriginal) claimedColumns.add(matchedOriginal);
  }

  const unmatchedColumns = headers.filter((h) => !claimedColumns.has(h));

  return { mapping, unmatchedColumns };
}

/** True if none of the required fields could be guessed — triggers fallback manual mapping mode. */
export function isMappingEmpty(mapping: ColumnMapping): boolean {
  return REQUIRED_FIELDS.every((f) => !mapping[f]);
}

export interface HeaderRowGuess {
  rowIndex: number;
  mapping: ColumnMapping;
  unmatchedColumns: string[];
  score: number;
}

const HEADER_SEARCH_WINDOW = 25;
const MIN_POPULATED_CELLS_FOR_HEADER_CANDIDATE = 2;

/**
 * Scans the first HEADER_SEARCH_WINDOW rows and returns whichever one is
 * most likely to be the real header row, using the exact same
 * synonym/fuzzy matching as guessColumnMapping — no format-specific
 * assumptions. Handles letterhead/title rows above the real table
 * (common in registrar/SIS exports) generically: a title row like
 * "Camarines Norte State College" matches none of our field synonyms
 * and scores 0, so it loses to the real header row regardless of how
 * many rows separate them.
 */
export function findHeaderRow(rows: unknown[][]): HeaderRowGuess {
  let best: HeaderRowGuess = {
    rowIndex: 0,
    mapping: {} as ColumnMapping,
    unmatchedColumns: [],
    score: -1,
  };

  const searchLimit = Math.min(rows.length, HEADER_SEARCH_WINDOW);

  for (let i = 0; i < searchLimit; i++) {
    const candidate = ((rows[i] as unknown[]) ?? []).map((h) => String(h ?? '').trim());

    // A lone populated cell (typical of a title row) can't be a real
    // multi-column header — skip it before even scoring.
    const populatedCount = candidate.filter((c) => c !== '').length;
    if (populatedCount < MIN_POPULATED_CELLS_FOR_HEADER_CANDIDATE) continue;

    const { mapping, unmatchedColumns } = guessColumnMapping(candidate);
    const score = REQUIRED_FIELDS.reduce(
      (acc, field) => acc + (mapping[field] ? 1 : 0),
      0,
    );

    if (score > best.score) {
      best = { rowIndex: i, mapping, unmatchedColumns, score };
    }
  }

  // Nothing in the window resolved even one field — fall back to row 0,
  // same as legacy behavior. isMappingEmpty() will trigger the manual
  // mapping UI from here, same as it always did for an unrecognizable file.
  if (best.score <= 0) {
    const fallback = ((rows[0] as unknown[]) ?? []).map((h) => String(h ?? '').trim());
    const { mapping, unmatchedColumns } = guessColumnMapping(fallback);
    return { rowIndex: 0, mapping, unmatchedColumns, score: 0 };
  }

  return best;
}