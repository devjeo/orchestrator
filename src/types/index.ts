/**
 * Base types (Phase 0).
 *
 * This file holds cross-cutting types only. Feature-specific types (e.g.
 * ParsedClass, ClassSession, CustomEvent) get added here starting in
 * Phase 1, following the schema shape from the dev plan §3.
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
