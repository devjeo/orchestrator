# Smart Academic Timetable Orchestrator — Roadmap

Rule followed throughout: **a phase can only depend on an earlier phase, never a later one.** Several phases are also fully independent of each other even when both come after Phase 1 — they just don't touch the same code. Each phase (other than Phase 0, which is pure scaffolding) is something you could stop after and still have a usable app.

Status values used below: Not Started, In Progress, Done, Blocked.

**Current status: Phase 0 done. Phases 1–8 not started.** See the Build
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
| Drag-and-drop / file browser upload (.xlsx/.xls) | Not Started | |
| Auto-detect headers + Smart Header Matching (fuzzy) | Not Started | |
| Manual column override + fallback manual mapping mode | Not Started | |
| Raw data preview table | Not Started | |
| Messy schedule-string parser (time/day/room extraction) | Not Started | Lives in `lib/parsing` — single source of truth, per the dev plan's non-negotiable rule |
| Multi-session class splitting, 24h time standardization | Not Started | |
| Time conflict detection + back-to-back room distance warning | Not Started | |
| Duplicate subject detection | Not Started | |
| Parsing report + success-rate indicator + auto-suggest fixes | Not Started | |
| Weekly grid rendering (Mon–Sun × hourly slots) | Not Started | |
| Smart color assignment (OKLCH/HSL, consistent per subject) | Not Started | |
| Live "current time" indicator, day summary tooltip | Not Started | Grid polish — kept here since the grid isn't really "done" without it |
| LocalStorage autosave + crash recovery (local) | Not Started | |

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

Based on the dev plan v2 file structure. Phase 0 created every folder
below (with `.gitkeep` placeholders where empty); folders are annotated
with the phase that will first populate them with real code, so this
doubles as a build-order map.

```
timetable-orchestrator/
├── src/
│   ├── features/
│   │   ├── upload/         # Phase 1 — folder created, empty
│   │   ├── grid/            # Phase 1 — folder created, empty
│   │   ├── analytics/       # Phase 3 — folder created, empty
│   │   ├── export/          # Phase 5 — folder created, empty
│   │   ├── sharing/         # Phase 7 — folder created, empty
│   │   └── auth/            # Phase 6 — folder created, empty
│   ├── store/                # Phase 0 — skeleton created (src/store/index.ts) → slices filled in by Phases 1, 2, 6
│   ├── lib/
│   │   ├── supabase/         # Phase 6 — folder created, empty
│   │   ├── parsing/          # Phase 1 — folder created, empty
│   │   ├── export/           # Phase 5 — folder created, empty
│   │   └── nlp/              # Phase 8 — folder created, empty
│   ├── hooks/                # folder created, empty — introduced as needed, first likely in Phase 1
│   ├── types/                # Phase 0 — base types created (src/types/index.ts) → extended every phase
│   └── pages/                # Phase 1 (main view) → extended in Phase 7 (public view) — folder created, empty
├── supabase/
│   ├── migrations/           # Phase 6 — folder created, empty
│   └── functions/            # Not planned unless a future feature needs a real secret — see dev plan §10
└── package.json               # Phase 0 — done, unverified (see Build Log)
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