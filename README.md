# Smart Academic Timetable Orchestrator

Personal, no-roles academic timetable tool. See `PROJECT.md`,
`FEATURES.md`, `ROADMAP.md` in the project docs for the full plan and
the dated Build Log — this README only tracks the scaffold/setup.

## Status: Phases 0–1 done (unverified — see below)

Phase 1 is the first genuinely usable milestone: upload a `.xlsx`/`.xls`
schedule file, fix the column mapping if needed, and see it laid out as
a weekly grid — entirely in the browser, LocalStorage-only, no account,
no network calls. See `ROADMAP.md`'s Build Log for the full list of
what landed in each phase and any bugs caught along the way.

**Important — still unverified.** The sandbox this was built in has no
network access, so `npm install` has never actually been run against
this project and `npm run dev` / `npm run build` / `npm run lint` have
never executed. Before doing anything else:

```bash
npm install
npm run dev
```

Then open `localhost:5173`, upload a real schedule file, and confirm:
- the upload/column-mapping/preview flow works
- classes render on the grid, in distinct colors, on the right days/times
- overlapping classes show a red border; check the browser console for
  any parsing errors from `lib/parsing`
- reloading the page brings your last schedule back (LocalStorage)
- `npm run lint` passes clean

If anything breaks or a `package.json` version needs bumping, flag it
back — that's expected the first time this actually runs.

## Folder layout

```
src/
├── features/
│   ├── upload/       # Phase 1 — done
│   ├── grid/         # Phase 1 — done
│   ├── analytics/    # Phase 3
│   ├── export/       # Phase 5
│   ├── sharing/      # Phase 7
│   └── auth/         # Phase 6
├── store/            # scheduleSlice.ts (Phase 1) + persist middleware → more slices in Phases 2, 6
├── lib/
│   ├── supabase/     # Phase 6
│   ├── parsing/      # Phase 1 — done, single source of truth for schedule parsing
│   ├── export/       # Phase 5
│   └── nlp/          # Phase 8
├── hooks/            # useCurrentTime.ts (Phase 1)
├── types/            # base types (Phase 0) + full parsing/grid model (Phase 1)
└── pages/            # HomePage.tsx (Phase 1) → public view added in Phase 7
supabase/
├── migrations/       # Phase 6
└── functions/        # not planned unless a future feature needs a secret
```

## Next phase

**Phase 2 — Editing & Personalization**, or **Phase 3/4/5** (all only
depend on Phase 1, can be done in any order). Pick whichever you want
next.
