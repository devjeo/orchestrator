import { create } from 'zustand';

/**
 * Store skeleton (Phase 0).
 *
 * This app uses the Zustand "slice pattern": each feature phase adds its
 * own slice file (e.g. `scheduleSlice.ts`, `historySlice.ts`, `syncSlice.ts`)
 * that exports a `StateCreator<StoreState, [], [], SliceShape>`, and this
 * file combines them with `...createXSlice(...)`.
 *
 * Planned slices (not yet created):
 *   - scheduleSlice   (Phase 1) — parsed classes/sessions, the core data model
 *   - historySlice     (Phase 2) — undo/redo stack
 *   - editSlice         (Phase 2) — manual field edits, custom events
 *   - syncSlice         (Phase 6) — debounced Supabase sync, optimistic concurrency
 *
 * StoreState is intentionally empty until Phase 1 defines the first slice.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StoreState {}

export const useStore = create<StoreState>()(() => ({}));
