import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ScheduleSlice, createScheduleSlice } from './scheduleSlice';

/**
 * Combined store using the Zustand "slice pattern": each feature phase
 * adds its own slice file and this file merges them.
 *
 * Planned slices (not yet created):
 *   - historySlice (Phase 2) — undo/redo stack
 *   - editSlice     (Phase 2) — manual field edits, custom events
 *   - syncSlice     (Phase 6) — debounced Supabase sync, optimistic concurrency
 *
 * `persist` gives Phase 1's "LocalStorage autosave + crash recovery":
 * every state change is written to LocalStorage automatically, and
 * `useStore.persist.hasHydrated()` (used in App.tsx) tells the UI when
 * the last saved state has been restored on load.
 */

export type StoreState = ScheduleSlice;

export const useStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createScheduleSlice(...args),
    }),
    {
      name: 'timetable-orchestrator-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
