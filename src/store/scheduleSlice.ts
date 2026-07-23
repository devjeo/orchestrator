import type { StateCreator } from 'zustand';
import type {
  ColumnMapping,
  ConflictWarning,
  ParseReport,
  ParsedClass,
  RawRow,
} from '@/types';
import { buildClasses, detectConflicts } from '@/lib/parsing';

export interface ScheduleSlice {
  // upload stage
  headers: string[];
  rawRows: RawRow[];
  mapping: ColumnMapping | null;
  unmatchedColumns: string[];

  // parsed stage (what the grid renders)
  classes: ParsedClass[];
  parseReport: ParseReport | null;
  conflicts: ConflictWarning[];

  setUpload: (data: {
    headers: string[];
    rawRows: RawRow[];
    mapping: ColumnMapping;
    unmatchedColumns: string[];
  }) => void;
  setMapping: (mapping: ColumnMapping) => void;
  confirmMapping: () => void;
  resetUpload: () => void;
}

const EMPTY_STATE: Pick<
  ScheduleSlice,
  | 'headers'
  | 'rawRows'
  | 'mapping'
  | 'unmatchedColumns'
  | 'classes'
  | 'parseReport'
  | 'conflicts'
> = {
  headers: [],
  rawRows: [],
  mapping: null,
  unmatchedColumns: [],
  classes: [],
  parseReport: null,
  conflicts: [],
};

export const createScheduleSlice: StateCreator<
  ScheduleSlice,
  [],
  [],
  ScheduleSlice
> = (set, get) => ({
  ...EMPTY_STATE,

  setUpload: ({ headers, rawRows, mapping, unmatchedColumns }) =>
    set({
      headers,
      rawRows,
      mapping,
      unmatchedColumns,
      classes: [],
      parseReport: null,
      conflicts: [],
    }),

  setMapping: (mapping) => set({ mapping }),

  confirmMapping: () => {
    const { rawRows, mapping } = get();
    if (!mapping) return;
    const { classes, report } = buildClasses(rawRows, mapping);
    const conflicts = detectConflicts(classes);
    set({ classes, parseReport: report, conflicts });
  },

  resetUpload: () => set(EMPTY_STATE),
});
