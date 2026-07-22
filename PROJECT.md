# Smart Academic Timetable Orchestrator — Development Plan v2 (Supabase / No Custom Backend)

This supersedes the previous plan. The biggest change: **no Express/Fastify server, no Puppeteer worker, no job queue.** The frontend talks directly to Supabase (Postgres + Auth + Row Level Security), and every computation — parsing, conflict detection, analytics, exports — runs in the browser. Dropping the multi-user comparison feature also removes the one piece that genuinely needed a backend to arbitrate between two people.

---

## 1. Users

Confirmed: no roles. Two states of the *same* single-user experience, not two user types:

| State | What it means |
|---|---|
| **Local-only** | Everything lives in LocalStorage. Zero Supabase calls. This must fully work with no account, ever. |
| **Cloud-synced** | User opted into a free account (Supabase Auth) — same data, mirrored to Postgres, accessible from other devices, shareable via public link. |

Public link viewers remain unauthenticated, read-only, and are not a "role" in the system — they're just anonymous `SELECT`s permitted by an RLS policy.

---

## 2. Stack — with pros/cons

### Frontend: React + TypeScript + Vite + Zustand
Unchanged from before — this part of the reasoning didn't depend on backend choice. Zustand still owns the undo/redo history stack, and now also owns the debounced "sync this schedule to Supabase" side-effect.

### Backend: **Supabase** (Postgres + Auth + Storage + RLS, optionally Edge Functions)
- ✅ No server to build, deploy, or scale — you get a real relational Postgres database with an auto-generated REST/client API (PostgREST) for free.
- ✅ Row Level Security (RLS) becomes your entire authorization layer, enforced *in the database*, not in application code you have to remember to write correctly on every route. This is actually a strict improvement over the old plan's "app code hides personal notes on share" fix — RLS enforces it even if a client is compromised or buggy.
- ✅ Built-in OAuth + magic-link auth, no password storage to worry about.
- ❌ RLS policies are easy to get subtly wrong, and a wrong policy is a *silent* security hole (over-permissive `SELECT`, not a crash) — every policy needs an explicit test, not just a happy-path check.
- ❌ No background job queue. Anything that used to be an async worker job (PDF rendering, batch ZIP) must now complete synchronously in the browser tab — fine at personal-tool scale, a real constraint if usage ever grows.
- ❌ No server-side recomputation of anything. Whatever the browser calculates (units, conflicts, analytics) is what gets trusted and saved — see the trust-model note in §8.

This is the right call for "personal tool, no roles, no multi-user arbitration" — you were right to cut the custom backend.

### Export rendering — now genuinely client-side
Puppeteer is gone (it needs a server). Replacements:
- **PNG:** `html-to-image` or `dom-to-image-more`, screenshotting the actual grid DOM.
- **PDF:** two real options, different tradeoffs —
  - `html2canvas` + `jsPDF`: full control over layout, but canvas-screenshot fidelity (fonts/shadows can look slightly off).
  - Native `window.print()` with dedicated print CSS: higher-fidelity text rendering (it's real vector text, not a screenshot), but less layout control.
  - **Recommendation:** print-CSS as the primary path since "crisp text" is explicitly a stated goal; keep `html2canvas` as a fallback for browsers with poor print-CSS support.
- **ICS:** the `ics` npm package, pure client-side, no server needed.
- **Batch ZIP:** `JSZip`, bundling multiple client-generated exports — matches the spec's "processed client-side" note exactly.

---

## 3. Database plan (Supabase Postgres)

Same relational shape as before, trimmed for the removed multi-user features, with RLS as the real security layer.

```
-- auth.users is managed by Supabase Auth. App-specific profile data:
profiles
  id (references auth.users.id), display_name, created_at

schedules
  id, owner_id (references auth.users.id, NOT NULL — only cloud-synced schedules exist here),
  semester_label, is_public boolean default false,
  public_slug (unique, nullable), share_link_expires_at (nullable),
  version int default 1,   -- optimistic concurrency
  created_at, updated_at

classes
  id, schedule_id, subject_code, subject_title, instructor_name,
  units, color_hex, raw_schedule_string

class_sessions
  id, class_id, day_of_week, start_time, end_time, room, building

custom_events
  id, schedule_id, title, note, day_of_week, start_time, end_time,
  is_visible_on_share boolean default false
```

**RLS policies (the important part):**

```sql
-- schedules
create policy "owner full access" on schedules
  for all using (auth.uid() = owner_id);

create policy "public read of shared schedules" on schedules
  for select using (is_public = true);

-- classes / class_sessions (same pattern on both)
create policy "read if owner or public parent" on classes
  for select using (
    exists (
      select 1 from schedules s
      where s.id = classes.schedule_id
        and (s.owner_id = auth.uid() or s.is_public = true)
    )
  );

create policy "write if owner" on classes
  for all using (
    exists (select 1 from schedules s where s.id = classes.schedule_id and s.owner_id = auth.uid())
  );

-- custom_events — this is where the privacy fix from v1 becomes a DB guarantee, not an app-code promise
create policy "read own events, or public+shareable events" on custom_events
  for select using (
    exists (
      select 1 from schedules s
      where s.id = custom_events.schedule_id
        and (
          s.owner_id = auth.uid()
          or (s.is_public = true and custom_events.is_visible_on_share = true)
        )
    )
  );
```

**Deliberately not included:**
- No `exports` table, no `parsing_issues` table, no raw-file storage bucket — see §5 for why.
- No `schedule_shares`/friendship table — the multi-user similarity feature is gone from this spec, so there's no longer anything that needs to model relationships *between* users.

---

## 4. File structure

This is now a single deployable frontend app plus a `supabase/` config folder — no `apps/api`, no worker service.

```
timetable-orchestrator/
├── src/
│   ├── features/
│   │   ├── upload/
│   │   ├── grid/
│   │   ├── analytics/
│   │   ├── export/
│   │   ├── sharing/
│   │   └── auth/
│   ├── store/              # zustand: schedule state, undo/redo history, sync middleware
│   ├── lib/
│   │   ├── supabase/       # client init + typed query functions per table
│   │   ├── parsing/        # the single source of truth parser (xlsx + fuzzy header matching)
│   │   ├── export/         # png/pdf/ics/zip generation, all client-side
│   │   └── nlp/            # compromise-based command parser, allowlisted actions
│   ├── hooks/
│   ├── types/
│   └── pages/
├── supabase/
│   ├── migrations/         # SQL: tables + RLS policies, version-controlled
│   └── functions/          # only if you decide you need a secret-holding Edge Function (see §5)
└── package.json
```

`lib/parsing` is still its own clearly-bounded module even without a monorepo split — it's still the highest-risk, most-tested code in the app, it's just no longer duplicated between a client preview and a server truth, because there's only one parser now.

---

## 5. Holes in the spec — and proposed fixes

Two holes from v1 are already resolved by this revision (multi-user comparison is gone; batch export is now explicitly "your own semester variants, client-side" — no more ambiguity). Remaining ones:

1. **Weather/commute intelligence needs a secret API key**, and there's no backend to hide it behind — putting a real API key in a client bundle exposes it to anyone who opens devtools.
   → **Fix:** use a **keyless** weather API (e.g., Open-Meteo) instead of one requiring a secret key. This fully eliminates the need for the one Supabase Edge Function you'd otherwise need, keeping the "no custom backend" promise intact for real. If you specifically want a provider that requires a key, that's the one case where a minimal Edge Function becomes necessary — flagging as a decision in §10.

2. **Client-side PDF/PNG fidelity is a real step down from server-rendered Puppeteer output.** Canvas-screenshot libraries can misrender fonts, shadows, and gradients depending on the browser.
   → **Fix:** print-CSS-first approach (see §2) for the "print-ready" claim specifically, since real browser print rendering is closer to what "vector, crisp text" implies than a canvas screenshot is.

3. **No server-side recompute means the trust model changed.** Previously, "the server revalidates client calculations" was a non-negotiable rule. There is no server now.
   → **This is fine, not a bug** — it's the user's own data, computed by their own browser, saved to their own row. The only place this would matter is if a *viewer* of a public link needed to trust the numbers came from an untampered process — for a personal sharing tool, that's an acceptable trust level. Documenting it explicitly so it's a conscious tradeoff, not an oversight.

4. **No background job for batch ZIP export** means a large batch (many semesters × PDF+PNG+ICS each) runs entirely in one browser tab, synchronously.
   → **Fix:** keep batch export scoped realistically (a handful of a user's own semester files, not dozens), show progress per file, and generate sequentially rather than all-at-once to avoid freezing the tab.

5. **Rate limiting / abuse protection on public share links is weaker without a backend proxy.** Supabase gives you DB-level RLS, not request-rate throttling.
   → **Accepted as a delimitation** (see §11) — reasonable for a personal-scale tool; not something to over-engineer for here.

6. **NL override still shouldn't silently mutate data**, even though it's now client-side JS and not a security boundary in the traditional sense — a misparsed "move Capstone to Thursday" could still silently corrupt the user's own schedule with no explanation.
   → **Fix unchanged from v1:** constrain `compromise`'s output to a small allowlisted set of structured actions, always show a confirmation before applying, always undoable.

7. **Colorblind palette vs. manual color override** — same conflict as v1.
   → **Fix unchanged:** color picker is filtered to the accessible palette when colorblind mode is on.

8. **Semester timeline bar has no data source** — same as v1.
   → **Fix unchanged:** manual one-time input of semester start date + length + exam week at schedule creation.

9. **Do you store the original uploaded `.xlsx` file anywhere?** Nothing in the spec requires it once parsing succeeds.
   → **Recommendation: don't.** `raw_schedule_string` per class row already gives you "revert to original" at the data level. Storing the original file adds a Supabase Storage bucket, its own RLS policies, and cleanup logic for a benefit (re-parsing from scratch) you likely won't use. Treat this as explicitly out of scope (§11) unless you tell me otherwise.

---

## 6. Data access pattern (replaces "API endpoints")

There's no hand-written REST layer to design — Supabase auto-generates one from the schema, called through the `supabase-js` client. What used to be an "endpoint list" is now a table of **client-side operations against Supabase tables**, all governed by the RLS policies in §3.

| Operation | Table(s) touched | Auth needed |
|---|---|---|
| Sign in (OAuth/magic link) | `auth.users` (Supabase-managed) | — |
| Upload + parse file | *(none — entirely client-side in `lib/parsing`, nothing hits Supabase until the user saves)* | — |
| Save/sync a schedule to the cloud | `schedules`, `classes`, `class_sessions` (upsert) | Signed in |
| Load "my schedules" | `select * from schedules where owner_id = auth.uid()` | Signed in |
| Edit a class field | `update classes ...` (RLS checks parent schedule ownership) | Signed in, owner |
| Add/edit a custom event, incl. share visibility | `custom_events` (insert/update) | Signed in, owner |
| Create/revoke a public link | `update schedules set is_public, public_slug ...` | Signed in, owner |
| View a shared schedule | `select ... where is_public = true` (anon key, RLS-gated) | None |
| Compute analytics | *(client-side, no query beyond loading the schedule)* | — |
| Export PNG/PDF/ICS/ZIP | *(client-side only, no Supabase call)* | — |
| Weather lookup | Direct browser call to a keyless API (see fix in §5) | — |

**Edge Functions:** not needed with the keyless-weather-API resolution. Keep this row empty unless a future feature genuinely requires hiding a secret — at that point, and only then, add one function, scoped as narrowly as possible.

---

## 7. "Middleware" in a backend-less architecture

There's no Express middleware chain anymore. The equivalent concerns are handled at two layers instead:

- **Database layer:** RLS policies are the real authorization middleware — every table, no exceptions, default-deny until a policy explicitly allows access.
- **Client layer (Zustand middleware):**
  - Undo/redo history capture
  - Debounced background sync to Supabase (local-first: every edit hits local state immediately, cloud sync happens after a short debounce)
  - Optimistic-concurrency check on sync (`update ... where version = $expected`, treat a 0-row result as a conflict and prompt the user)

---

## 8. Security implementation details

- **RLS is the whole security model now** — every table must have RLS *enabled* (not just policies written; Supabase tables are insecure-by-default until you flip this on) before anything ships. Test each policy against both an authenticated non-owner and an anonymous user, not just the owner's own session.
- **Auth:** OAuth + magic link only, no password auth enabled in Supabase Auth settings — consistent with v1's reasoning, still avoids storing/handling passwords entirely.
- **Public anon key is meant to be public** — worth stating explicitly since it trips people up coming from a traditional backend mindset: the Supabase URL + anon key are safe to ship in the client bundle. Security comes from RLS, not from hiding that key. The only thing that must never ship client-side is a *service-role* key or a genuine third-party secret (which, per §5's weather fix, you now don't need at all).
- **XSS:** unchanged — any user-entered text (event notes, subject titles) is escaped on render, never dumped into `dangerouslySetInnerHTML`.
- **Public share links:** unguessable `public_slug` (generate with `pgcrypto`'s `gen_random_uuid()` or a client-side `nanoid`), optional expiry column, one-click revoke by clearing `is_public`.
- **Guest/local-only data:** never touches Supabase at all — the trust boundary question ("what if a guest tampers with their own local data?") is moot, since it's entirely their own browser and never reaches a shared system.
- **Trust model change:** documented explicitly in §5, point 3 — worth restating here because it's the one place this plan meaningfully differs from a typical "never trust the client" rule. It's an accepted tradeoff for a personal, single-owner-per-schedule tool, not an oversight.

---

## 9. Summary of non-negotiable engineering rules

1. **RLS enabled on every table, before it ships** — no table goes live in a "just trust the client" state, even temporarily during development.
2. Local-only mode must work with **zero Supabase calls** — cloud sync is strictly additive, never required.
3. Parsing logic lives in one client module (`lib/parsing`) — it's the single source of truth, since there's no server copy anymore.
4. `raw_schedule_string` is preserved per class row — revert-to-original never requires re-uploading.
5. No secret key (weather or otherwise) ships in the client bundle. Prefer keyless third-party APIs; only add an Edge Function if a feature genuinely can't work without a real secret.
6. Public share visibility is opt-in per field and enforced **at the RLS layer**, not just hidden in the UI.
7. NL override never silently mutates data — allowlisted structured actions + confirmation + undo, always.
8. `schedules.version` optimistic-concurrency check required before trusting any multi-device sync.
9. No password auth — OAuth/magic-link only.

---

## 10. Open architectural decisions (need your input)

- **Weather API provider** — I'm recommending a keyless option (e.g., Open-Meteo) specifically so you never need an Edge Function. If you have a preferred provider that requires a key, that reopens the "one small Edge Function" question.
- **PDF export approach** — print-CSS (higher text fidelity, less layout control) vs. `html2canvas`+`jsPDF` (more control, screenshot fidelity). I lean print-CSS given the spec's own "crisp text" wording, but it's a real design call worth your sign-off.
- **Original file retention** — I'm recommending you *don't* store the uploaded `.xlsx` in Supabase Storage at all (§5, point 9). Confirm that's fine, or tell me if you want it for some reason (e.g., audit/debugging).
- **Hosting for the frontend itself** — Vercel/Netlify/Cloudflare Pages are all trivial fits for a Supabase-backed SPA with no server component; any preference, or is this not decided yet?

---

## 11. Delimitations (explicitly out of scope)

- Any multi-user feature (the similarity-score comparison from v1 is gone — confirmed by this spec revision).
- Server-side recomputation/validation of anything — all compute is client-side, documented as an accepted tradeoff, not a gap to fix later.
- Background job processing for exports — batch operations run synchronously in-browser; keep batch sizes realistic.
- Request-level rate limiting / anti-scraping on public share links — RLS controls *access*, not *request volume*.
- Storing the original uploaded file — `raw_schedule_string` per row is the revert mechanism, not a stored file copy.
- Institutional/admin bulk upload of other people's data — this spec is explicitly personal/no-roles, so that whole direction from v1 is dropped.