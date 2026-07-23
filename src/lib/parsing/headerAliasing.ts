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
