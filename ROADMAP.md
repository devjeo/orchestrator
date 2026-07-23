# Smart Academic Timetable Orchestrator — Roadmap

Rule followed throughout: **a phase can only depend on an earlier phase, never a later one.** Several phases are also fully independent of each other even when both come after Phase 1 — they just don't touch the same code. Each phase (other than Phase 0, which is pure scaffolding) is something you could stop after and still have a usable app.

Status values used below: Not Started, In Progress, Done, Blocked.

**Current status: Phases 0–1 done. Phases 2–8 not started.** See the Build
**Current status: Phases 0–1 done. Phases 2–8 not started.** See the Build
Log at the bottom of this file for a dated, per-change record of what
was actually done, including any fixes — the tables below only show
current status, not history.

---

## Phase 0 — Project Scaffolding
**Depends on:** nothing. **Not itself a "feature" phase** — it's the empty shell everything else gets built into.

| Subsection | Status | Notes |
|---|---|---|
| Repo init, Vite + React + TypeScript setup | Done | `package.json`, `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`/`tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/index.css`. **Not yet verified** — see Build Log, no network access to run `npm install` in the build environment |
| Folder structure per §4 of the dev plan | Done | All folders created with `.gitkeep` placeholders; matches the layout table below exactly |
| Lint/format config (ESLint, Prettier) | Done | `eslint.config.js` (flat config, v9), `.prettierrc.json`, `.prettierignore`. Not yet run — same verification gap as above |
| Zustand store skeleton (empty, no slices yet) | Done | `src/store/index.ts` — empty `StoreState`, slice pattern documented in comments for Phases 1/2/6 to extend |

---

## Phase 1 — Core Local Experience: Upload → Parse → Grid
**Depends on:** Phase 0 only. **No Supabase, no accounts, no network calls at all.** This is the smallest version of the app that's genuinely useful on its own — upload a file, see your schedule.

| Subsection | Status | Notes |
|---|---|---|
| Drag-and-drop / file browser upload (.xlsx/.xls) | Done | `features/upload/FileDropzone.tsx` |
| Auto-detect headers + Smart Header Matching (fuzzy) | Done | `lib/parsing/headerAliasing.ts` — synonym table + Levenshtein fallback (`lib/parsing/levenshtein.ts`) |
| Manual column override + fallback manual mapping mode | Done | `features/upload/ColumnMappingTable.tsx` — shows the fallback-mode banner via `isMappingEmpty` when nothing auto-matched |
| Raw data preview table | Done | `features/upload/RawPreviewTable.tsx` |
| Messy schedule-string parser (time/day/room extraction) | Done | `lib/parsing/scheduleStringParser.ts` — single source of truth, nothing outside `lib/parsing` re-implements it |
| Multi-session class splitting, 24h time standardization | Done | Same file — comma/semicolon segments + multi-day tokens each become their own `ClassSession`; `lib/parsing/timeUtils.ts` handles 24h conversion |
| Time conflict detection + back-to-back room distance warning | Done | `lib/parsing/conflicts.ts`; overlaps render red on the grid (`features/grid/GridBlock.tsx`), room-distance warnings surface in `features/grid/ConflictsPanel.tsx` |
| Duplicate subject detection | Done | Also in `lib/parsing/conflicts.ts`, surfaced in `ConflictsPanel.tsx` |
| Parsing report + success-rate indicator + auto-suggest fixes | Done | `features/upload/ParseReportPanel.tsx` + per-issue `suggestion` field from the parser |
| Weekly grid rendering (Mon–Sun × hourly slots) | Done | `features/grid/WeeklyGrid.tsx` — only shows days that actually have classes, falls back to Mon–Fri |
| Smart color assignment (OKLCH/HSL, consistent per subject) | Done | `lib/parsing/colors.ts` — deterministic hash → hue, golden-angle spacing; colorblind-safe palette function included but not yet wired to a UI toggle (that's Phase 4) |
| Live "current time" indicator, day summary tooltip | Done | `hooks/useCurrentTime.ts` + `WeeklyGrid.tsx` (red line + hover tooltip on day header) |
| LocalStorage autosave + crash recovery (local) | Done | `store/index.ts` — Zustand `persist` middleware, autosaves on every state change, rehydrates on reload |
| Drag-and-drop / file browser upload (.xlsx/.xls) | Done | `features/upload/FileDropzone.tsx` |
| Auto-detect headers + Smart Header Matching (fuzzy) | Done | `lib/parsing/headerAliasing.ts` — synonym table + Levenshtein fallback (`lib/parsing/levenshtein.ts`) |
| Manual column override + fallback manual mapping mode | Done | `features/upload/ColumnMappingTable.tsx` — shows the fallback-mode banner via `isMappingEmpty` when nothing auto-matched |
| Raw data preview table | Done | `features/upload/RawPreviewTable.tsx` |
| Messy schedule-string parser (time/day/room extraction) | Done | `lib/parsing/scheduleStringParser.ts` — single source of truth, nothing outside `lib/parsing` re-implements it |
| Multi-session class splitting, 24h time standardization | Done | Same file — comma/semicolon segments + multi-day tokens each become their own `ClassSession`; `lib/parsing/timeUtils.ts` handles 24h conversion |
| Time conflict detection + back-to-back room distance warning | Done | `lib/parsing/conflicts.ts`; overlaps render red on the grid (`features/grid/GridBlock.tsx`), room-distance warnings surface in `features/grid/ConflictsPanel.tsx` |
| Duplicate subject detection | Done | Also in `lib/parsing/conflicts.ts`, surfaced in `ConflictsPanel.tsx` |
| Parsing report + success-rate indicator + auto-suggest fixes | Done | `features/upload/ParseReportPanel.tsx` + per-issue `suggestion` field from the parser |
| Weekly grid rendering (Mon–Sun × hourly slots) | Done | `features/grid/WeeklyGrid.tsx` — only shows days that actually have classes, falls back to Mon–Fri |
| Smart color assignment (OKLCH/HSL, consistent per subject) | Done | `lib/parsing/colors.ts` — deterministic hash → hue, golden-angle spacing; colorblind-safe palette function included but not yet wired to a UI toggle (that's Phase 4) |
| Live "current time" indicator, day summary tooltip | Done | `hooks/useCurrentTime.ts` + `WeeklyGrid.tsx` (red line + hover tooltip on day header) |
| LocalStorage autosave + crash recovery (local) | Done | `store/index.ts` — Zustand `persist` middleware, autosaves on every state change, rehydrates on reload |

---

## Phase 2 — Editing & Personalization
**Depends on:** Phase 1 (needs the grid + data model to exist). **Independent of Phase 3, 4, 5** — none of those need editing to exist first.

| Subsection | Status | Notes |
|---|---|---|
| Manual time/room/instructor field editing | Not Started | |
| Manual color override (filtered to accessible palette if colorblind mode is on) | Not Started | Depends on Phase 4's palette existing to filter against — if Phase 4 isn't done yet, ship without the filter and add it later; not a hard blocker |
| Custom events (title, note, day/time) | Not Started | Include the `is_visible_on_share` field on the local data model now, even though it does nothing until Phase 7 — cheaper to add the field early than migrate later |
| Undo / Redo history stack | Not Started | Zustand middleware |
| Revert to original (from `raw_schedule_string`) | Not Started | |

---

## Phase 3 — Analytics & Insights
**Depends on:** Phase 1 (reads the same data model). **Independent of Phase 2** — analytics can be built and demoed against Phase 1's static parsed data without editing existing yet; can be developed in parallel with Phase 2 if you have the bandwidth.

| Subsection | Status | Notes |
|---|---|---|
| Total units calculator | Not Started | |
| Free period (gap) analysis — green/gray shading | Not Started | |
| Gap statistics (longest/shortest/total idle) | Not Started | |
| Busiest day heatmap | Not Started | |
| Instructor workload bar | Not Started | |
| Instructor heatmap view | Not Started | Could also live in Phase 4 (it's view-like) — placed here since it's workload data, your call if you'd rather move it |
| Schedule Optimizer (elective-shuffling suggestions) | Not Started | The most complex item in this phase — consider building it last within Phase 3 |

---

## Phase 4 — Views, Filters & Accessibility
**Depends on:** Phase 1 only. **Independent of Phase 2 and 3.**

| Subsection | Status | Notes |
|---|---|---|
| Grid View ↔ List View toggle | Not Started | |
| Filter by instructor, filter by day | Not Started | |
| Zoom in/out | Not Started | |
| Colorblind-friendly palette toggle | Not Started | |
| High-contrast mode | Not Started | |
| Tooltips on all interactive elements | Not Started | |
| Responsive design (desktop/tablet/mobile) | Not Started | Worth treating as an ongoing constraint across every phase rather than a one-time task, but tracked here as the formal pass |

---

## Phase 5 — Client-Side Export
**Depends on:** Phase 1 (needs a grid to render). **Independent of Phase 2, 3, 4** — exports whatever state exists, richer once those phases exist but not blocked on them.

| Subsection | Status | Notes |
|---|---|---|
| PNG export (`html-to-image`) | Not Started | |
| Print-ready PDF export (print-CSS primary, `html2canvas`+`jsPDF` fallback) | Not Started | Per the dev plan's recommendation |
| .ics (iCal) export | Not Started | |
| Batch export (ZIP of your own multiple semester files) | Not Started | Sequential generation with progress, not all-at-once |

---

## Phase 6 — Cloud Account & Sync (Supabase)
**Depends on:** Phase 1 (needs a schedule data shape to sync). **Not dependent on Phase 2–5** — you could technically add cloud sync to a bare Phase 1 app, though it's more useful once editing/analytics exist. This is the first phase that touches a network at all.

| Subsection | Status | Notes |
|---|---|---|
| Supabase project setup | Not Started | |
| Schema migrations (`schedules`, `classes`, `class_sessions`, `custom_events`, `profiles`) | Not Started | |
| RLS policies written + tested per table | Not Started | Non-negotiable: enabled and tested before anything else in this phase ships |
| Auth (OAuth + magic link, no password auth) | Not Started | |
| Local → cloud sync middleware (debounced) | Not Started | |
| Optimistic concurrency (`version` column check) | Not Started | |
| "My schedules" list (cloud-synced ones) | Not Started | |
| Cloud backup as crash-recovery fallback | Not Started | Extends Phase 1's local-only crash recovery |

---

## Phase 7 — Sharing (Public Links)
**Depends on:** Phase 6 (needs auth + hosted rows to share) and reads the `is_visible_on_share` field introduced in Phase 2. **Independent of Phase 3, 4, 5.**

| Subsection | Status | Notes |
|---|---|---|
| Generate/revoke public slug | Not Started | |
| Public read-only view route (`/schedule/:slug`) | Not Started | Unauthenticated, RLS-gated |
| Personal-notes visibility enforcement | Not Started | Enforced at the RLS layer (Phase 6), this subsection is just the UI toggle exposing it |
| Optional share-link expiry | Not Started | |

---

## Phase 8 — Bonus Advanced Intelligence
**Depends on:** Phase 1 at minimum. Each sub-item is independent of the others — pick and choose.

| Subsection | Status | Notes |
|---|---|---|
| Natural language override (`compromise`, allowlisted actions only) | Not Started | Also depends on Phase 2 — it needs editing actions to actually invoke |
| Exam week stress prediction | Not Started | Depends on Phase 3's gap/workload data existing |
| Semester timeline bar (Gantt-style) | Not Started | Needs manual semester-start-date input added somewhere in the UI first |
| Weather/commute intelligence | Not Started | Use a keyless provider (e.g. Open-Meteo) per the dev plan — fully independent of every other phase, including Phase 6, since it needs no account or secret |

---

## Folder layout — current build status

Folders below are annotated with the phase that first populates them, so
this doubles as a build-order map. Phases 0 and 1 are done — see the
Build Log for exactly which files landed in each.
Folders below are annotated with the phase that first populates them, so
this doubles as a build-order map. Phases 0 and 1 are done — see the
Build Log for exactly which files landed in each.

```
timetable-orchestrator/
├── src/
│   ├── features/
│   │   ├── upload/         # Phase 1 — done (FileDropzone, ColumnMappingTable, RawPreviewTable, ParseReportPanel, UploadFlow)
│   │   ├── grid/            # Phase 1 — done (WeeklyGrid, GridBlock, ConflictsPanel)
│   │   ├── upload/         # Phase 1 — done (FileDropzone, ColumnMappingTable, RawPreviewTable, ParseReportPanel, UploadFlow)
│   │   ├── grid/            # Phase 1 — done (WeeklyGrid, GridBlock, ConflictsPanel)
│   │   ├── analytics/       # Phase 3 — folder created, empty
│   │   ├── export/          # Phase 5 — folder created, empty
│   │   ├── sharing/         # Phase 7 — folder created, empty
│   │   └── auth/            # Phase 6 — folder created, empty
│   ├── store/                # Phase 0 skeleton → Phase 1 added scheduleSlice.ts + persist middleware → Phases 2, 6 add more slices
│   ├── store/                # Phase 0 skeleton → Phase 1 added scheduleSlice.ts + persist middleware → Phases 2, 6 add more slices
│   ├── lib/
│   │   ├── supabase/         # Phase 6 — folder created, empty
│   │   ├── parsing/          # Phase 1 — done (headerAliasing, scheduleStringParser, conflicts, colors, parseFile, timeUtils, levenshtein)
│   │   ├── parsing/          # Phase 1 — done (headerAliasing, scheduleStringParser, conflicts, colors, parseFile, timeUtils, levenshtein)
│   │   ├── export/           # Phase 5 — folder created, empty
│   │   └── nlp/              # Phase 8 — folder created, empty
│   ├── hooks/                # Phase 1 — useCurrentTime.ts
│   ├── types/                # Phase 0 base types → Phase 1 added the full parsing/grid data model
│   └── pages/                # Phase 1 — HomePage.tsx (main view) → extended in Phase 7 (public view)
│   ├── hooks/                # Phase 1 — useCurrentTime.ts
│   ├── types/                # Phase 0 base types → Phase 1 added the full parsing/grid data model
│   └── pages/                # Phase 1 — HomePage.tsx (main view) → extended in Phase 7 (public view)
├── supabase/
│   ├── migrations/           # Phase 6 — folder created, empty
│   └── functions/            # Not planned unless a future feature needs a real secret — see dev plan §10
└── package.json               # Phase 0 scaffold, Phase 1 added `xlsx` — done, unverified (see Build Log)
└── package.json               # Phase 0 scaffold, Phase 1 added `xlsx` — done, unverified (see Build Log)
```

---

## Suggested build order (one reasonable path through the phases)

This is one linear path, not a requirement — Phases 3, 4, and 5 can be reordered or run in parallel with each other since none of them depend on one another, only on Phase 1.

**0 → 1 → (2, 3, 4, 5 in any order/parallel) → 6 → 7 → 8**

The natural "first real milestone" is the end of Phase 1: a working, local-only upload-and-view tool with no account and no sharing — fully usable on its own, matching your "each phase should function independently" requirement.

---

## Build Log

Dated, append-only record of what actually happened: code added, bugs
fixed, decisions made. The phase tables above show current status only;
this is the history. Newest entry on top.

### 2026-07-24 — GridBlock / WeeklyGrid redesign

**Changed:**
- `features/grid/GridBlock.tsx` — subject title (`cls.subjectTitle`) and
  instructor (`cls.instructorName`) are now rendered in the block body
  itself (progressive disclosure by block height), not just exposed via
  the hover tooltip as before.
- Visual redesign of the block from a solid `cls.colorHex`-filled card to
  a white (`--paper-raised`) card with a colored left accent bar
  (`--accent`, 3px), matching the existing `.card-tab` pattern. Fixes a
  real contrast risk: arbitrary per-subject hex colors as a full
  background have no guaranteed contrast against fixed text color, e.g.
  pale subject colors with light text; text now always sits on a fixed
  paper background using the `--ink-900/700/500/300` scale.
- All sizing/color/shadow/font values pulled from existing design tokens
  (`--radius-sm`, `--shadow-sm`, `--line`, `--font-mono`) instead of
  hardcoded hex/px, so the block matches the rest of the app.
- Conflict indicator changed from a heavy 2px full-border treatment to a
  rose-tinted top/right/bottom border plus a small corner dot — reads as
  a status flag rather than a stress signal.
- Removed the time range from the block body — `WeeklyGrid`'s time axis
  already conveys this via block position, so repeating it was
  redundant. Time remains in the hover tooltip.
- Title overflow: replaced single-line ellipsis truncation with
  `-webkit-line-clamp: 2` (`.gridblock__title`) so long titles wrap to a
  second line before truncating, instead of cutting off after a few
  characters.
- Inline styles removed from both `GridBlock.tsx` and `WeeklyGrid.tsx` in
  favor of classes in `index.css`, matching the existing `.card`/`.btn`/
  `.badge` convention. Only genuinely per-instance values remain inline:
  `top`/`height` (block position/size), `--accent` (per-class color) in
  `GridBlock`; `top`/`height` for hour marks, track height, and the
  now-line in `WeeklyGrid`.
- `WeeklyGrid`'s day-header tooltip converted from `useState` +
  `onMouseEnter`/`onMouseLeave` to a pure CSS `:hover` reveal
  (`.day-header__tooltip`), removing a re-render on every mouse move.
- Room re-laid-out into a header row next to the subject code
  (`.gridblock__header`, code left / room right) instead of being pinned
  to the block bottom behind a `height >= 78px` gate. The old gate meant
  room silently never appeared on any short/typical-height block —
  moving it into the always-rendered header row fixes that. Code
  truncates first under space pressure (`min-width: 0` +
  `text-overflow: ellipsis`) so room, the shorter fixed-width string,
  stays fully visible.
- Title/instructor disclosure thresholds adjusted (30px / 52px) now that
  the header row is a fixed, always-present element above them.

**Fixed:**
- Subject title overflow cutting off mid-word on short/medium blocks
  (single-line ellipsis → 2-line clamp, see above).
- Room label not rendering on the majority of real-world blocks because
  it was gated behind an 78px height threshold most sessions never
  reach — moved into the always-visible header row.

**Known gaps / deferred, not bugs:**
- `ParsedClass` type must have `instructorName` for this to type-check;
  not yet confirmed present on the type definition in `src/types/index.ts`.
- Still unverified in a running dev server — same standing verification
  gap noted throughout this log (no `npm install`/`npm run dev` in the
  build sandbox).

### 2026-07-23 — Thursday sessions silently dropped (`lib/parsing/scheduleStringParser.ts`)

**Found:**
- `SEGMENT_RE`'s day-token character class — `[MTWFSUmtwfsu]` — does not
  include `H`/`h`. Since the class quantifier (`+`) stops at the first
  character it doesn't match, any day token containing `Th` (`"TTh"`,
  `"MWTh"`, `"MThF"`, or bare `"Th"`) gets cut short: only the letters
  before the `h` are captured in the day-token group, and the stray `h`
  spills into the trailing `rest` group instead.
- Confirmed with `"1-2:30 pm TTh"`: day-token group captures `"TT"`
  (not `"TTh"`), and `rest` captures `"h"` instead of `""`.
- Downstream effect in `parseDayTokens("TT")`: produces `['Tue', 'Tue']`
  — Tuesday is duplicated and Thursday is never generated, so any
  Thursday session for a `Th`-containing class never reaches the grid.
- Secondary effect: the leaked `"h"` gets passed into
  `splitBuildingRoom()` as (or prepended to) the room string, so the
  room field for that segment can also come out wrong.
- Plain day tokens without `Th` (e.g. `"MWF"`) are unaffected — this is
  specific to any combination that includes the two-letter `Th` code.
- Root cause is isolated to the regex character class only —
  `parseDayTokens()`'s own `"th"` two-character lookahead logic is
  already correct and needs no change.

**Fixed:**
- Added `H`/`h` to `SEGMENT_RE`'s day-token character class:
  `[MTWFSUHmtwfsuh]+` (or, since the regex already has the `i` flag,
  just `[MTWFSUH]+`). Verified via standalone regex test that this
  correctly captures `"TTh"` and `"Th"` in full and leaves `rest`
  clean (e.g. room text like `"CCMS-RM-04"` no longer gets a leaked
  `h` prefix).

### 2026-07-23 — Header-row detection fix (`lib/parsing/parseFile.ts`, `lib/parsing/headerAliasing.ts`)

**Fixed:**
- `readWorkbook` in `parseFile.ts` assumed the sheet's row 0 was always
  the header row. Real-world exports commonly have letterhead/title
  rows above the actual table — confirmed against a real sample file
  (a registrar "Enrolled Subjects" printout), where the true header
  (`Class, Subj Code, Description, Units, Schedule, Instructor,
  Section`) sits 4 rows below a college-name/address title block. With
  the old code, `guessColumnMapping` had nothing to match against that
  title row, so every data row failed to parse ("Missing subject code"
  / "Missing schedule string") even though the file was well-formed.
- A TS narrowing bug in the same function:
  `cell === undefined || cell === null ? undefined : cell` doesn't
  narrow `unknown` the way it narrows a real union — the false branch
  typed as `{}` instead of `string | number | undefined`, tripping
  ts(2322). Replaced with an explicit `typeof` check.

**Added:**
- `findHeaderRow()` in `headerAliasing.ts` — scans the first 25 rows,
  runs the existing synonym/fuzzy `guessColumnMapping` against each one
  as a header candidate, and picks whichever row resolves the most
  `REQUIRED_FIELDS`. Skips candidate rows with fewer than 2 populated
  cells first (title rows are typically single-cell), so a stray
  one-word title can't outscore the real header. Falls back to row 0
  (old behavior) if nothing in the window matches anything, so
  `isMappingEmpty`'s manual-mapping UI still kicks in for genuinely
  unrecognizable files. No new matching logic — reuses
  `guessColumnMapping` as-is, so it generalizes to any header wording
  the synonym table already understands, not just this one sample file.
- `readWorkbook` now calls `findHeaderRow` instead of assuming
  `rows[0]`, and slices `rawRows` starting after the detected header
  row instead of always `rows.slice(1)`.

**Known gaps / deferred, not bugs:**
- Search window capped at 25 rows — comfortably covers any
  letterhead-style export seen so far; would need raising only if a
  file has an unusually long preamble.
- Doesn't handle multi-row spanning headers (e.g. a merged header cell
  sitting over two sub-columns). Not a known real-world need yet.
- `ParseIssue.rowIndex` / `ParsedClass.sourceRowIndex` are still
  positions within `rawRows` (relative to the detected header row), not
  the literal Excel row number. Fine for now since nothing surfaces raw
  Excel row numbers to the user yet, but worth revisiting if
  `ParseReportPanel` ever needs to point someone back to a specific row
  in their original file.
- Verified by re-running the real sample xlsx through the equivalent
  parsing logic standalone (Node script reproducing `findHeaderRow` +
  `readWorkbook`), not through the actual Vite app build — same
  sandbox network restriction noted in earlier entries (`npm install`
  still hasn't been run against the real project).

### 2026-07-23 — Upload UI polish (FileDropzone, ParseReportPanel, RawPreviewTable, ColumnMappingTable)

**Changed** (presentation-only, no prop/type changes):
- `features/upload/FileDropzone.tsx` — swapped inline styles for the
  existing `.dropzone` / `.format-chip` / `.alert-error` classes from
  `index.css`, added an upload icon, a "Loaded <filename>" confirmation
  once a file is accepted, and a more specific rejection message that
  names the bad file and restates the accepted formats.
- `features/upload/ParseReportPanel.tsx` — success rate now renders as
  a color-coded `.badge` (sage/amber/rose) instead of an inline hex
  color; the issues list reuses the shared `.alert-error` box; added an
  explicit "every row parsed cleanly" message for the zero-issues case
  instead of just rendering nothing.
- `features/upload/RawPreviewTable.tsx` — switched to the shared
  `.table-scroll` styling instead of duplicating table CSS inline;
  added a leading row-number column (`Row N`) that lines up with the
  row numbering `ParseReportPanel` already uses, so a flagged row is
  easy to find in the preview; added an explicit empty state instead
  of rendering a headerless table before a file is loaded.
- `features/upload/ColumnMappingTable.tsx` — mandatory fields left
  unmapped are now highlighted (rose background + border), not just
  marked with `*`; "not used" columns render as `.badge-teal` chips
  instead of a comma-joined string; the fallback-mode banner now uses
  the existing amber tokens (`--amber` / `--amber-tint`) instead of
  one-off hex values.

**Not changed:**
- `index.css` untouched, per request — all four components consume its
  existing tokens/classes rather than adding new global CSS.
- No changes to `@/types` or `@/lib/parsing` — `ColumnMapping`,
  `ParseReport`, `RawRow`, `RequiredField`, `isMappingEmpty`, etc. are
  all unaffected.

**Follow-up to:**
- Closes the gap flagged in the "Visual Design Pass" entry below, which
  had applied the new `index.css` classes to `HomePage`/`UploadFlow`
  but explicitly left `RawPreviewTable`, `ColumnMappingTable`, and
  `ParseReportPanel` unstyled.

### 2026-07-23 — Visual Design Pass (index.css, HomePage.tsx, UploadFlow.tsx)

**Changed:**
- `src/index.css` — replaced the Phase 0 scaffold stub (just
  `color-scheme`, `box-sizing`, and a `body` margin reset) with a full
  design-token system: a warm "ruled planner" palette (paper/ink/amber/
  teal/rose/sage), `Fraunces` + `Inter` + `IBM Plex Mono` via Google
  Fonts, a subtle ledger-grid background texture on `body` (echoing the
  weekly grid), and reusable component classes — `.shell`, `.card`/
  `.card-pad`, `.btn`/`.btn-primary`/`.btn-secondary`, `.badge-*`,
  `.alert-error`, `.dropzone`, `.format-chip`, `.table-scroll` — plus a
  `:focus-visible` outline and a `prefers-reduced-motion` override.
- `pages/HomePage.tsx` — rebuilt to use the new classes instead of no
  styling at all: `.shell` for the page frame, `.app-header`/
  `.app-title`/`.app-subtitle`, and an `.eyebrow` badge ("Local-only ·
  nothing leaves your device") ahead of the `<h1>`.
- `features/upload/UploadFlow.tsx` — rebuilt to use the new classes
  instead of local inline-style objects (`primaryButtonStyle`,
  `secondaryButtonStyle`): `.card`/`.card-pad` wrapping the raw-preview
  and column-mapping sections, `.row-between`/`.section-heading` for
  their headers, a `.badge-amber` showing the unmatched-column count,
  `.alert-error` for the read-error message, `.btn-primary`/
  `.btn-secondary` for the buttons, and `.format-chip`s for the
  `.xlsx`/`.xls` format hints under the dropzone.
- No logic changes in either component — `useStore` selectors, the
  upload/mapping/generate handlers, and the `canGenerate` gating are
  unchanged; this pass is styling-only.

**Known gaps / deferred, not bugs:**
- This is the design pass for the components Phase 1 already shipped
  (`HomePage`, `UploadFlow`) — the newer classes referenced here
  (`.badge-*`, `.alert-*`, `.table-scroll`, etc.) aren't yet applied to
  the rest of Phase 1's components (`RawPreviewTable`,
  `ColumnMappingTable`, `ParseReportPanel`, the grid components). Worth
  a follow-up pass so the whole app matches, rather than assuming it
  already does.

### 2026-07-23 — Dependency security fixes

**Changed:**
- `xlsx` pinned to SheetJS's CDN-hosted 0.20.3 build
  (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`) instead of
  the unmaintained npm 0.18.5, fixing prototype pollution + ReDoS
  (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9). No fix was ever
  published to the npm registry for this range. `npm audit` can no
  longer track this dependency for future CVEs since it's not
  registry-sourced — check cdn.sheetjs.com periodically for newer
  patched versions.
- `vite` bumped `^5.4.21` → `^6.0.0`, `@vitejs/plugin-react` → `^5.0.0`,
  to pull in `esbuild >=0.25.0` (GHSA-67mh-4wv8-2f99, a dev-server-only
  CORS issue — not shipped to users, doesn't affect `npm run build`
  output). Deliberately targeted Vite 6 rather than the Vite 8 that
  `npm audit fix --force` defaults to, since Vite 8 swaps the bundler
  engine (Rolldown/Oxc) and is a much bigger migration than this fix
  needed.
- `npm audit`: 0 vulnerabilities (down from 1 high + 2 moderate).

**Known gaps / deferred, not bugs:**
- Dev server and production build not yet re-verified after the Vite
  5→6 bump — run `npm run dev` and `npm run build` before trusting
  this fully, same verification gap noted in Phase 0/1 above.

### 2026-07-23 — Phase 1: Core Local Experience

**Added:**
- Data model in `src/types/index.ts`: `RawRow`, `RequiredField`,
  `ColumnMapping`, `ClassSession`, `ParsedClass`, `ParseIssue`,
  `ParseReport`, `ConflictWarning` — shaped to match the `classes` /
  `class_sessions` tables in `PROJECT.md` §3 so Phase 6 cloud sync won't
  need a data-model migration later
- `lib/parsing/` (the single source of truth for parsing, per
  `PROJECT.md` §9 rule 3):
  - `levenshtein.ts` — edit distance for typo-tolerant header matching
  - `headerAliasing.ts` — synonym table per field, normalizes headers
    (case/periods/underscores/spaces stripped), exact match first then
    fuzzy fallback; `isMappingEmpty` drives the fallback manual-mapping UI
  - `scheduleStringParser.ts` — parses comma/semicolon-separated
    segments like `"1-2:30 pm TTh, 2-4 pm F CCMS-RM-04"` into
    `ClassSession[]`; case-insensitive day-code tokenizer (longest-match
    first: `Th`/`Su` before bare `T`/`S`); meridiem-inheritance heuristic
    for shorthand like `"1-2:30 pm"` where only the end time states AM/PM
  - `timeUtils.ts` — 24h time standardization + display formatting
  - `conflicts.ts` — time-overlap, back-to-back different-building
    room-distance warning, and duplicate-subject-code detection, all as
    one pure function over the parsed classes
  - `colors.ts` — deterministic OKLCH pastel color per subject code
    (hash → hue, golden-angle spacing so hues don't cluster); includes a
    3-color colorblind-safe palette function, not yet wired to a toggle
  - `parseFile.ts` — reads the uploaded workbook (`xlsx`/SheetJS),
    guesses the column mapping, and builds `ParsedClass[]` + a
    `ParseReport` from the (possibly user-corrected) mapping
- `store/scheduleSlice.ts` — upload/mapping/parsed-classes state and the
  actions driving the upload flow; `store/index.ts` rewritten to wrap
  the combined store in Zustand's `persist` middleware (LocalStorage
  autosave + reload-time crash recovery)
- `hooks/useCurrentTime.ts` — minute-granularity clock for the grid's
  live time indicator, without re-rendering every second
- `features/upload/`: `FileDropzone`, `ColumnMappingTable`,
  `RawPreviewTable`, `ParseReportPanel`, and `UploadFlow` tying them
  together against the store
- `features/grid/`: `WeeklyGrid` (day/hour layout, only renders days
  that actually have classes, current-time line, hover tooltip with
  per-day hours/class-count/subjects), `GridBlock` (red border on
  time-overlap conflicts), `ConflictsPanel` (room-distance and
  duplicate-subject warnings, which aren't visual grid overlaps)
- `pages/HomePage.tsx` assembling the above; `App.tsx` now renders it
- Added `xlsx` to `package.json` dependencies

**Fixed:**
- `scheduleStringParser.ts`'s day-code tokenizer originally did a
  case-sensitive character match (`'M'`, `'T'`, `'Th'`, ...), so
  lowercase input like `"mwf"` or `"tth"` silently failed to parse.
  Caught before packaging and rewrote it to lowercase the token first.
- `UploadFlow.tsx` initially selected four store fields as one object
  literal from `useStore`, which is a known Zustand re-render smell
  (returns a new object every call, defeats reference-equality
  bail-out). Changed to four separate `useStore` selector calls.

**Known gaps / deferred, not bugs:**
- Still unverified end-to-end — same network restriction as Phase 0
  (no `npm install` run in the build sandbox). Run `npm install && npm
  run dev`, then upload a real sheet, before trusting this fully.
- The schedule-string parser is a heuristic tuned to the formats in
  `FEATURES.md`'s own examples (e.g. `"1-2:30 pm TTh, 2-4 pm F
  CCMS-RM-04"`), not a full grammar. Rows it can't confidently parse
  are reported in the Parse Report with a reason and, where possible, a
  suggested fix — not silently dropped or guessed.
- Colorblind-safe palette exists in `colors.ts` but has no toggle yet —
  that UI lands in Phase 4 per the roadmap; noted so it isn't mistaken
  for a Phase 1 gap.
- Room-distance warnings are heuristic (same-day, back-to-back,
  different building-code string) — there's no real distance/travel-time
  calculation, matching the original feature description's own framing
  of it as a warning, not a guarantee.

### 2026-07-22 — Phase 0 scaffolding

**Added:**
- Vite + React + TypeScript project (`package.json`, `vite.config.ts`,
  three-way `tsconfig` split, `index.html`, `src/main.tsx`, `src/App.tsx`,
  `src/index.css`, `src/vite-env.d.ts`)
- Full folder structure per dev plan §4, `.gitkeep` in every folder not
  yet populated (`features/{upload,grid,analytics,export,sharing,auth}`,
  `lib/{supabase,parsing,export,nlp}`, `hooks/`, `pages/`,
  `supabase/{migrations,functions}`)
- `eslint.config.js` (flat config), `.prettierrc.json`, `.prettierignore`,
  `.gitignore`
- Zustand store skeleton at `src/store/index.ts` — empty `StoreState`,
  slice-pattern convention documented in-file for later phases
- Base shared types in `src/types/index.ts` (`DayOfWeek`, `AppMode`)
- `README.md` documenting the scaffold and the verification gap below

**Fixed:**
- `eslint.config.js` initially referenced `@eslint/js`, `globals`, and
  `typescript-eslint` without them being declared as devDependencies —
  added all three to `package.json` before packaging

**Known gap / not yet done:**
- The build environment has no network access, so `npm install` was
  never run and `npm run dev` / `npm run build` / `npm run lint` were
  never actually executed against this scaffold. Dependency versions
  are believed-correct but unresolved and unverified. This is the
  first thing to confirm locally before Phase 1 work starts.

---

## Documentation

Where to find things, kept up to date as the project grows.

| Doc | Purpose |
|---|---|
| `PROJECT.md` | Full development plan — stack choices, DB schema, RLS policies, security model, non-negotiable engineering rules |
| `FEATURES.md` | Full feature list, organized by product area (not by build phase) |
| `ROADMAP.md` (this file) | Phase-by-phase status, dependency order, folder-to-phase mapping, and the Build Log above |
| `README.md` (in project root) | Setup/run instructions, current scaffold contents, next-step pointer |

**Conventions used across this project:**
- Every phase's status is tracked in the tables above; the Build Log is
  the only place history lives — don't infer history from a status
  value alone, since "Done" doesn't say *when* or *how*.
- Any deviation from `PROJECT.md` (e.g. a dependency version bump, a
  library swap) gets recorded in the Build Log under the phase it
  happened in, not silently made.
- `lib/parsing` remains the single source of truth for schedule parsing
  (per `PROJECT.md` §9, rule 3) — no duplicate parsing logic elsewhere,
  including inside NL-override code in Phase 8.