import type { ConflictWarning, ParsedClass } from '@/types';

interface FlatSession {
  classId: string;
  subjectCode: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  building?: string;
}

function flatten(classes: ParsedClass[]): FlatSession[] {
  const flat: FlatSession[] = [];
  for (const cls of classes) {
    for (const session of cls.sessions) {
      flat.push({
        classId: cls.id,
        subjectCode: cls.subjectCode,
        day: session.day,
        startMinutes: session.startMinutes,
        endMinutes: session.endMinutes,
        building: session.building,
      });
    }
  }
  return flat;
}

function overlaps(a: FlatSession, b: FlatSession): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

/**
 * Runs all Phase 1 conflict/duplicate checks against a parsed schedule.
 * Pure function, no side effects — the caller decides how to surface these
 * (red highlighting on the grid, a warnings panel, etc.).
 */
export function detectConflicts(classes: ParsedClass[]): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];
  const sessions = flatten(classes);

  // --- time overlap, per day ---
  const byDay = new Map<string, FlatSession[]>();
  for (const s of sessions) {
    if (!byDay.has(s.day)) byDay.set(s.day, []);
    byDay.get(s.day)!.push(s);
  }
  for (const daySessions of byDay.values()) {
    for (let i = 0; i < daySessions.length; i++) {
      for (let j = i + 1; j < daySessions.length; j++) {
        const a = daySessions[i];
        const b = daySessions[j];
        if (a.classId === b.classId) continue;
        if (overlaps(a, b)) {
          warnings.push({
            type: 'time-overlap',
            classIds: [a.classId, b.classId],
            message: `${a.subjectCode} overlaps ${b.subjectCode} on ${a.day}`,
          });
        }
      }
    }
  }

  // --- back-to-back room distance warning (different building, no gap) ---
  for (const daySessions of byDay.values()) {
    const sorted = [...daySessions].sort(
      (a, b) => a.startMinutes - b.startMinutes,
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.classId === next.classId) continue;
      const backToBack = next.startMinutes === current.endMinutes;
      const differentBuilding =
        current.building &&
        next.building &&
        current.building !== next.building;
      if (backToBack && differentBuilding) {
        warnings.push({
          type: 'room-distance',
          classIds: [current.classId, next.classId],
          message: `${current.subjectCode} ends in ${current.building} right when ${next.subjectCode} starts in ${next.building} on ${current.day} — no travel time`,
        });
      }
    }
  }

  // --- duplicate subject code across the whole semester ---
  const bySubject = new Map<string, ParsedClass[]>();
  for (const cls of classes) {
    const key = cls.subjectCode.trim().toUpperCase();
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key)!.push(cls);
  }
  for (const [subjectCode, group] of bySubject) {
    if (group.length > 1) {
      warnings.push({
        type: 'duplicate-subject',
        classIds: group.map((c) => c.id),
        message: `${subjectCode} appears ${group.length} times this semester`,
      });
    }
  }

  return warnings;
}
