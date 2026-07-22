# Smart Academic Timetable Orchestrator

Personal, no-roles academic timetable tool. See `PROJECT.md`,
`FEATURES.md`, `ROADMAP.md` in the project docs for the full plan —
this README only tracks the scaffold itself.

## Phase 0 status: done (scaffolding only, unverified)

What's here:

- Vite + React + TypeScript project structure
- Folder layout matching the dev plan's §4 file structure, with `.gitkeep`
  placeholders in every folder a later phase will populate
- ESLint (flat config) + Prettier configured
- Zustand store skeleton (`src/store/index.ts`) — empty `StoreState`,
  slice pattern documented in a comment, no slices yet (Phase 1 adds the
  first one)
- Base shared types (`src/types/index.ts`)
- A one-line placeholder `App.tsx` that renders and nothing else

**Important — this was built without running `npm install`.** The
sandbox this was generated in has no network access, so the
`node_modules` tree was never fetched and `npm run dev` / `npm run
build` were never actually executed against it. The `package.json`
versions are correct as of this writing but haven't been dependency-
resolved. Before starting Phase 1, run:

```bash
npm install
npm run dev
```

and confirm the placeholder page loads at `localhost:5173` and `npm
run lint` passes clean. If anything in `package.json` needs a version
bump to resolve, that's expected — flag it back and I'll adjust.

## Folder layout

```
src/
├── features/
│   ├── upload/       # Phase 1
│   ├── grid/         # Phase 1
│   ├── analytics/    # Phase 3
│   ├── export/       # Phase 5
│   ├── sharing/      # Phase 7
│   └── auth/         # Phase 6
├── store/            # skeleton now → slices added in Phases 1, 2, 6
├── lib/
│   ├── supabase/     # Phase 6
│   ├── parsing/      # Phase 1 — single source of truth for schedule parsing
│   ├── export/        # Phase 5
│   └── nlp/           # Phase 8
├── hooks/
├── types/             # base types now → extended every phase
└── pages/              # Phase 1 (main view) → Phase 7 (public view)
supabase/
├── migrations/         # Phase 6
└── functions/          # not planned unless a future feature needs a secret
```

## Next phase

**Phase 1 — Core Local Experience: Upload → Parse → Grid.** No Supabase,
no accounts, no network calls. This is the first genuinely usable
milestone — upload a file, see your schedule.
