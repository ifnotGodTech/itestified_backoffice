# Dashboard UI/UX Review — Actionable Todos

Reviewed by clicking through every route in `dashboard/frontend` with a headless
browser (`E2E_BYPASS_AUTH=1`, backend offline), at desktop (1440px) and mobile
(390px) viewports, plus source-reading the components behind what was rendered.
No console errors on any route; every finding below is a design/behavior issue,
not a crash.

Two sections, per request: **A) needs a full UI refactor**, **B) needs real
mock data / better mock wiring**. A third section lists smaller polish items
found along the way.

---

## A. Needs a full refactor

### A1. Pagination does nothing, anywhere in the app — ✅ FIXED
Every table's `Previous`/`Next` control was a static `<button>` with no
`onClick`, no `disabled`, no page-state.

**Fix**: added a shared pagination layer and wired it through all 9
verticals (Testimonies text+video, Donations, Users, Admin Management,
Notifications History, Reviews, Scripture of the Day, Inspirational Pictures,
plus the decorative Activity Log sub-screen):
- `domain/entities/pagination.ts` — `AdminPaginationFields` (`page`,
  `hasNextPage`, `hasPreviousPage`), mixed into all 9 view-model types.
- `data/services/pagination.ts` — `parsePageParam`, `paginateRows` (slices
  fixture arrays for mock builders), `formatShowingLabel`.
- `presentation/components/shared/admin-table-primitives.tsx` —
  `AdminPaginationFooter`: renders a real `<Link>` when a page exists in that
  direction, a non-interactive `aria-disabled` `<span>` otherwise. One
  component, used by all 9 tables — no more copy-pasted footer markup.
- Every `...FromApi`/`...FromBackend` service now sends `page`/`page_size` to
  the Django backend (which already runs DRF `PageNumberPagination`) and
  derives `hasNextPage`/`hasPreviousPage` from the response's `next`/
  `previous` fields. Mock-only services (Admin Management, Reviews) paginate
  their fixture arrays locally with the same helper, so behavior is identical
  whether the backend is up or not.
- Route-state builders (`buildTestimoniesHref`, `buildDonationsHref`, etc.)
  all gained a `page` param, included only when `page > 1` — so switching tabs
  or applying a filter naturally resets to page 1 without extra code.
- Reviews' `ReviewsViewModel` was missing a `searchQuery` field entirely
  (search worked but couldn't be echoed back into a pagination link) — added
  it so Next/Previous preserve an active search term.

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (128/128 passing), and
`next build` all clean. Re-crawled every route in a real headless browser:
at page 1 with small/empty datasets, both buttons now render as disabled
`<span>`s (previously always looked clickable); navigating to `?page=2`
correctly renders `Previous` as a real link back to page 1 (with the `page`
param correctly dropped from the URL) while `Next` stays disabled; clicking
that link navigates end-to-end with zero console errors.

### A2. Sidebar never collapses on mobile — dashboard is unusable under ~900px — ✅ FIXED
At a 390px viewport the full 235px desktop sidebar stayed pinned, squeezing
page content into a ~150px column; text wrapped illegibly, and table headers
overlapped. There was no hamburger toggle and no responsive breakpoint at all
in `admin-dashboard-shell.tsx` — the `grid-cols-[235px_1fr]` layout was fixed
regardless of viewport.

**Fix**:
- `admin-dashboard-shell.tsx`: grid is now `md:grid-cols-[235px_1fr]` (single
  column below 768px); the desktop `<aside>` is `hidden md:block`.
- New `admin-mobile-nav.tsx` (client component): a hamburger button
  (`md:hidden`) that opens a slide-in drawer — fixed overlay, dimmed
  backdrop, 260px panel reusing the existing `AdminSidebarNav` (same nav
  component as desktop, so no duplicated logic or drift between the two).
  Drawer closes on backdrop click, on Escape via the close button, and
  automatically on navigation (closes itself when `usePathname()` changes,
  using the render-time state-adjustment pattern rather than a
  setState-in-effect, to satisfy `react-hooks/set-state-in-effect`).
  `document.body` scroll is locked while open.
- Header row made responsive alongside it: greeting text now truncates
  instead of wrapping, the subtitle and the decorative theme/panel icons
  (already flagged as non-functional in A3) hide below `sm`, and the account
  name/role text hides below `md` — only the functional notification bell
  stays visible at every width. Content padding (`px-3` → `md:px-4`) and
  `main` gets `min-w-0` so it can actually shrink instead of forcing overflow.

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (128/128 — the existing
`admin-dashboard-shell.test.tsx` needed no changes since the drawer's copy of
the nav only mounts when opened), and `next build` all clean. Browser-tested
at 390px: hamburger opens the drawer, clicking a nav link inside navigates
and auto-closes it, clicking the backdrop closes it, zero console errors on
any interaction. Re-crawled all 13 admin/settings routes at 390px: **11 of 13
now have zero horizontal overflow** (previously the whole app overflowed
because of the fixed sidebar). Desktop (1440px) re-screenshotted and is
pixel-identical to before — hamburger confirmed hidden, no regression.

**New follow-up surfaced by this fix** (not fixed here — separate root
cause): `admin-management-table.tsx` and `reviews-table.tsx` still overflow
horizontally on mobile (188px and 161px respectively) because their header
rows use fixed-width grid columns with no wrap/scroll handling. This was
always broken — it was simply invisible before, hidden behind the sidebar
squeeze. Needs its own pass (likely `overflow-x-auto` on the table wrapper,
or column stacking) — tracked as **A2a** below.

### A2a. Admin Management and Reviews tables overflow horizontally on mobile — ✅ FIXED
Confirmed via the A2 mobile re-crawl: `/admin` overflowed ~188px and
`/reviews` overflowed ~161px at 390px width. Both tables used a fixed-width
header grid with no `overflow-x-auto` wrapper or responsive column strategy,
unlike the rest of the app.

**Fix** (`admin-management-table.tsx`, `reviews-table.tsx`):
- The grid header row + data rows are now wrapped in `overflow-x-auto` with
  an inner `min-w-[860px]` / `min-w-[760px]` container, so columns keep their
  intended widths and become horizontally scrollable *within the card*
  instead of forcing the whole page to overflow or cramming text together.
  Loading/error/empty messages stay outside that wrapper (full width, no
  scroll needed for a one-line message).
- The header row above the table (title + search + action buttons) now
  stacks vertically below `sm` (`flex-col sm:flex-row`) and the search input
  goes full-width on mobile instead of a fixed 240px/220px, so that row no
  longer contributes to the overflow either.

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (128/128), `next build`
all clean. Re-tested both pages at 390px: `document.documentElement`
horizontal overflow is 0 on both (was 188px / 161px), and the inner
`overflow-x-auto` container was confirmed to actually scroll (`scrollLeft`
0 → 200 moves the columns, revealing Status/Last Active/Permissions cleanly).
Re-tested both at 1440px: 0 overflow, screenshots pixel-identical to before —
no desktop regression.

### A3. Header theme toggle and "panel" icon are dead decoration — ✅ FIXED
`HeaderIcon kind="theme"` and `kind="moon" active` were plain `<span>`s with
no `href`/`onClick`. The `kind="panel"` icon was the same. A working
`next-themes` setup already existed (`ThemeProvider` mounted at root,
`[data-theme="light"]` token overrides fully defined in `globals.css`) but
nothing ever called `setTheme`.

**Scope decision**: wiring the icons alone would have been dishonest —
investigating first showed only ~24 of ~63 component files actually read the
`var(--color-*)` tokens; the other ~39 (including the entire persistent
chrome: shell, sidebar, mobile drawer, notification bell, logout button) were
hardcoded to dark hex. Flipping `data-theme` without fixing that would have
produced a half-inverted, broken-looking page — arguably worse than the
current all-dark state. So the fix was scoped to make the **persistent
chrome** (the part visible on every single page, including the toggle
itself) genuinely theme-aware, and to be explicit that page *content* is a
separate, tracked follow-up rather than silently leaving it half-done.

**Fix**:
- New `admin-theme-toggle.tsx`: a real sun/moon two-state control calling
  `next-themes`' `setTheme`. Hydration-safety uses `useSyncExternalStore`
  (React's own mechanism for "value differs between server and client")
  instead of the classic `useEffect(() => setMounted(true), [])` pattern,
  because this repo's `react-hooks/set-state-in-effect` lint rule rejects
  that pattern — confirmed by first shipping the effect-based version and
  hitting exactly the hydration-mismatch warning it exists to prevent when
  navigating client-side with a persisted "light" theme, then fixing it.
- `admin-dashboard-shell.tsx`, `admin-sidebar-nav.tsx`, `admin-mobile-nav.tsx`,
  `header-notification-bell.tsx`, `admin-sidebar-logout-button.tsx`: every
  hardcoded background/border/text hex converted to the matching
  `var(--color-*)` token (surface → elevated/muted/panel/strong by role,
  text → primary/secondary/muted, accent → primary, red badge → danger).
  Modal/drawer backdrops (`bg-black/60`) intentionally left as literal black
  — a dimming overlay should stay dark in either theme.
- The dead `kind="panel"` icon had no spec and nothing to wire it to — per
  the todo's own "or delete" option, it's removed rather than left decorative.
  The old, never-rendered `core/ui/theme-toggle.tsx` (superseded by the new
  component) was deleted too, so there's exactly one theme-toggle
  implementation instead of one dead one plus one live one.
- The toggle is also reachable on mobile: it's in the header for `sm`+, and
  was added as an "Appearance" row inside the `AdminMobileNav` drawer for
  narrower screens (the header hides it below `sm` for space, same as the
  A2 fix already did for the bell).

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (128/128 — the
existing `admin-dashboard-shell.test.tsx` needed no changes), `next build`
all clean. Browser-tested the full loop: initial `data-theme` is `dark`,
clicking the sun sets `light` and the chrome visibly turns light (white
sidebar/header, dark-on-light text, purple accent preserved), a full
client-side navigation to another route while light-themed stays light with
**zero hydration-mismatch warnings** (this is the specific failure mode the
`useSyncExternalStore` fix targets — reproduced and confirmed fixed), a hard
reload preserves it via `next-themes`' localStorage persistence, and clicking
the moon returns to dark. Mobile drawer toggle confirmed clickable and
functional (theme flips correctly) even though it renders below the fold in
a full-page screenshot.

**New follow-up surfaced by this fix**: page *content* (tables, cards, forms)
is still hardcoded dark in the ~39 files that don't use the CSS var tokens —
confirmed live on `/testimonies` in light mode: the card container and
already-tokenized parts turn white correctly, but non-tokenized elements
(e.g. the "Unable to load testimonies" error banner) stay dark, producing a
visibly inconsistent page. Tracked as **A3a** below; this is a large,
mechanical, multi-file effort on its own and deliberately out of scope here.

### A3a. Page content doesn't respond to the theme toggle yet — ✅ FIXED
Confirmed via the A3 fix: with light mode on, page content stayed dark while
the chrome around it correctly went light.

**What this actually took, vs. the original estimate**: the plan was "hex →
token conversion, one vertical at a time." Investigating first found the
real shape of the problem was different and much bigger — not 34 files with
a handful of hex colors each, but **~1000+ occurrences of `text-white/N`,
`border-white/N`, `bg-white/N`** opacity utilities across 35 files, on top of
~60 distinct literal hex values used as surface backgrounds. Converting the
opacity utilities one call site at a time was never going to be tractable in
one pass.

**The actual fix, in two parts**:

1. **One CSS line instead of ~1000 call-site edits.** Tailwind v4 compiles
   `text-white/70` etc. to `color-mix(in oklab, var(--color-white) 70%, transparent)`
   — confirmed by inspecting the compiled output before relying on it. That
   means every `white/N` utility in the app already reads from a single
   variable. Added `--color-white: var(--color-text-primary);` to `:root` in
   `globals.css`: dark mode is a no-op (text-primary is already `#fff`
   there), light mode retheme's every one of those ~1000 occurrences at
   once, in every file, with zero component changes.
2. **The literal hex surfaces still needed real conversion** (`--color-white`
   doesn't touch arbitrary values like `bg-[#1e1e1e]`). Enumerated all
   distinct hex values in use, sampled real usage context for the common
   ones to confirm consistent semantic roles before touching anything, then
   mapped: near-black page backgrounds → `--color-surface-strong`, card/panel
   backgrounds (`#171717`/`#181818`/`#1b1b1b`/`#1e1e1e`/`#1f1f1f`/etc.) →
   `--color-surface-elevated`, secondary/hover/input backgrounds
   (`#242424`/`#2a2a2a`/`#262626`/etc.) → `--color-surface-muted`, neutral
   borders → `--color-border-soft`/`-subtle`, near-white/gray text →
   `--color-text-primary`/`-secondary`. Applied across all ~35 files.
   **Deliberately left untouched**: the purple/red/green/amber accent and
   status colors (buttons, badges, pills) — `globals.css` already defines
   these identically in both `:root` and `[data-theme="light"]`, so they're
   theme-invariant by the design system's own existing convention, not
   something this fix needed to change.

**A real regression found and fixed mid-fix**: the `--color-white` change
alone, before the surface conversion caught up, made "alert banner" style
components (literal dark-red/dark-green tinted background + `text-white`
heading, e.g. "Unable to load testimonies") render dark text on a
still-dark-literal background — worse than before. Caught this by screenshot
before calling it done, then fixed the ~5 genuine cases by pinning their text
to a literal `text-[#ffffff]` (opting out of the retheme, matching how
badges/pills already use fixed literal text) rather than leaving it
theme-driven. Also caught and reverted 2 cases where an overly broad
find-and-replace had "fixed" text that was actually already correct
(sitting on a `var(--color-surface-elevated)` container, not a literal one).

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (128/128 — a ~40-file,
thousand-plus-line diff with zero test changes needed, since tests assert
behavior/text content, not class names), `next build` all clean. Screenshotted
all 14 admin/settings routes in both dark and light mode (28 screenshots) —
zero console errors across all of them. Dark mode confirmed pixel-identical
to before (this was designed to be a no-op there). Light mode confirmed
correct on: populated tables with real data (Admin Management, Reviews),
error states (Testimonies, Users, Donations — including the previously-buggy
alert banners, now legible), the richest page in the app (Analytics — chart,
donut, multiple tables), and a page that mixes an error banner with populated
fields (My Profile). Mobile drawer re-checked, unaffected.

### A4. Testimony detail modal can show fabricated data over a live error banner — ✅ FIXED
`/testimonies?view=1` with the backend unreachable rendered the list as
"Unable to load testimonies" **and** opened a detail modal populated with
fixture content ("Miraculous Healing After Prayer" / Emmanuel Oreoluwa) as if
it were the real record.

**Worse than originally scoped**: checking how `testimonies-overlays.tsx`
consumes the view model showed the leak wasn't limited to the detail
modal — `showRejectModal`, `showScheduleModal`, `showArchiveModal`,
`showEditModal`, and `showDeleteModal` all gate directly on
`viewModel.selectedRow` the same way. `/testimonies?reject=1` with the
backend down would have shown a "Reject this testimony?" confirmation
dialog for the fabricated Emmanuel Oreoluwa record — an admin could
plausibly click through a moderation action believing they were looking at
a real, loaded record.

**Fix** (`get-testimonies-view-model.ts`): both error branches (`!response.ok`
and `catch`) now explicitly override `selectedRow: null` and all six
`show*Modal`/`showActionMenu` flags to `false`, instead of leaking them in
via `...base` (`base` is the mock-fixture builder, which resolves
`selectedRow` from `?view=`/`?reject=`/etc. against fixture data regardless
of whether the real fetch succeeded). With `selectedRow` null and every show
flag false, `testimonies-overlays.tsx`'s `selectedDetailRow = detailRow ??
viewModel.selectedRow` and each modal's render guard correctly resolve to
"show nothing" — the list-level error banner is the only thing the admin
sees, which is honest and requires no separate modal-specific error UI.

**Verified**: added two regression tests to
`get-testimonies-view-model.test.ts` — one for a network failure (`catch`)
and one for a `500` response (`!response.ok`), both requesting a testimony
via the URL (`view`/`reject`) and asserting `selectedRow` is `null` and every
modal flag is `false`. `tsc --noEmit`, `eslint .`, `vitest run` (130/130,
up from 128), `next build` all clean. Browser-reproduced the original bug
scenario plus the three newly-identified sibling paths
(`?view=1`, `?reject=1`, `?schedule=1`, `?tab=video&edit=1`) against the
live dev server with the backend down: confirmed none of the fixture names
("Emmanuel Oreoluwa", "Miraculous Healing After Prayer", "God Healed Me")
appear anywhere on the page in any of the four cases, zero console errors.
Screenshot of `?view=1` now shows only the error banner, matching the
original bug report's page state minus the fabricated modal.

### A5. Error-state visual language is inconsistent across pages — ✅ FIXED
Two different treatments existed for "couldn't load" states: a bordered
red-tinted card with a bold title (Testimonies, Users, Home-management), and
plain centered gray text with no card, title, or icon everywhere else
(Donations, Admin Management, Reviews, Notifications History, Inspirational
Pictures, Notification Settings, My Profile) — 10 error states total, in two
visibly different styles, several with duplicated near-identical JSX.

**Fix**: added `AdminErrorState` to `shared/admin-table-primitives.tsx` — one
component (title + message + a small warning icon), used everywhere:
- Testimonies, Users, Home-management already had bespoke but
  byte-for-byte-identical implementations of the card pattern; replaced all
  three with the shared component (pure de-duplication, zero visual change).
- Donations, Admin Management, Reviews, Notifications History, Inspirational
  Pictures, Notification Settings, My Profile were upgraded from the plain
  gray-text treatment to the card, each with a page-appropriate title (e.g.
  "Unable to load donations") passed alongside their existing `errorMessage`.

Background/border color is deliberately left as the literal dark-red hex
pairing from A3a — not the surface tokens — since (like status badges) an
error state should stay legible and instantly recognizable as "error"
regardless of theme, not blend into a light page.

**Verified**: `tsc --noEmit`, `eslint .`, `vitest run` (130/130, no test
changes needed — tests assert on the message text, which is unchanged),
`next build` all clean. Screenshotted all 10 pages in both dark and light
mode (20 screenshots) — zero console errors. Confirmed: the three refactored
pages render pixel-identical to before; the seven upgraded pages now show
the same card/icon/title treatment; the card is legible and clearly reads as
an error in light mode too (confirmed on Notification Settings and My
Profile); Reviews (mock-only, no `FromApi`) correctly never shows an error
state at all — unrelated pre-existing gap (B6), unaffected by this fix.

### A6. Analytics page is a non-functional prototype — mock quality ✅ FIXED, backend wiring still blocked
Every row in "Engagement by Category" was identically `100 / 100 / 100`
across all 8 categories; the donut chart showed `0%` on every segment despite
each having "100 Posts"; "Top Performing Videos" repeated the exact same
title ("Miraculous Healing from Cancer") six times with identical stats.

**Checked first**: whether "real backend wiring" was actually achievable.
`grep`ed the Django backend for any analytics endpoint — there is none.
Building a `getAnalyticsViewModelFromApi` against an endpoint that doesn't
exist would mean inventing an API contract nobody has agreed to, which is
backend-team-scoped design work, not a frontend fix. This is the same
situation as B6 (Reviews/Admin Management) — noted there, not re-solved
here. **Backend wiring stays open; tracked below as B7.**

**What was actually fixed** (`get-analytics-view-model.ts`,
`analytics-page.tsx`, `domain/entities/analytics.ts`):
- Two bugs, not one. The `0%` text was the visible symptom, but the pie
  chart's actual slice *sizes* were a second, separate, deeper bug: `DonutChart`
  computed each wedge as an equal `100 / segments.length` share via
  `conic-gradient`, completely ignoring the data — so even with correct
  percentage text, the visual pie would have stayed evenly divided regardless
  of real proportions. Fixed both: `donutSegments` gained a numeric `percent`
  field (computed from a real per-category post count, not display-string
  parsing), and `DonutChart` now builds its `conic-gradient` stops
  proportionally from that field via a small `donutConicGradient` helper.
  Confirmed this bug was live on the Donations donut too (54/32/14 split
  was *also* rendering as three equal thirds before this fix).
- `CATEGORY_ENGAGEMENT` replaces the uniform 100/100/100 rows with distinct,
  plausible per-category numbers, used as the single source for both the
  category table and the (now-correct) donut percentages, so the two can't
  drift apart.
- `TOP_TESTIMONIES` replaces the 6x-repeated "Miraculous Healing from
  Cancer" row with 6 distinct titles and varied like/view counts.
- Fixed `topListTitle: testimonyMode === "text" ? "Top Performing Videos" : "Top Performing Videos"`
  — both ternary branches returned the identical string, so the text-mode
  view was mislabeled "Top Performing *Videos*". Now reads "Top Performing
  Testimonies" in text mode, "Top Performing Videos" in video mode.

**Verified**: added 2 regression tests to `analytics-page.test.tsx` —
category rows are no longer uniform, top-row titles are unique, every donut
segment has `percent > 0` and the set sums to ~100 (not the old always-0
case), and the top-list title genuinely varies by mode instead of being a
no-op ternary. `tsc --noEmit`, `eslint .`, `vitest run` (132/132, up from
130), `next build` all clean. Screenshotted Testimony Analytics in both text
and video mode, Donation Analytics, and Testimony Analytics in light mode
(4 screenshots) — zero console errors. Visually confirmed the donut charts
now show genuinely unequal, proportional wedges matching their percentage
labels (both testimony-category and donation-channel donuts), the category
table has realistic varied numbers, and the top-performing lists show six
distinct, readable entries.

---

## B. Needs mock data created / mock-fallback fixed

These are services that already have a hardcoded mock builder
(`getXViewModel`) as well as a real `...FromApi`/`...FromBackend` function,
but the fallback behavior on failure is either misleading or contradicts
itself. This is different from A — the fix here is in the *data layer*, not
layout.

### B1. Scripture of the Day silently serves fake data as if it succeeded — ✅ FIXED
`getScriptureOfTheDayViewModelFromApi` returned `getScriptureOfTheDayViewModel(input)`
directly on both `!response.ok` and `catch` — no error flag, no banner,
nothing. With the backend down, `/scripture-of-the-day` rendered 3
confident-looking rows ("Jeremiah 29:11", Uploaded/Scheduled badges) with no
indication they were fake.

**Worse than scoped, same as A4**: this service didn't have a `phaseState`
field *at all* — unlike every other vertical, there was no error/loading/
empty concept to wire up in the first place. And checking how
`scripture-of-the-day-overlays.tsx` consumes the view model found the exact
same fixture-leak class of bug fixed in A4: `showDetails`/`showEdit`/
`showDeleteConfirm` all gate directly on `viewModel.selectedRow`, which the
mock builder resolves from `?menu=`/`?view=`/`?edit=`/`?remove=` regardless
of whether the real fetch succeeded. `/scripture-of-the-day?edit=1` with the
backend down would have opened a real-looking "Edit Scripture" form
pre-filled with fixture content.

**Fix**:
- `domain/entities/scripture-of-the-day.ts`: added `ScriptureState` and
  `phaseState`/`errorMessage` fields to the view model — bringing this
  vertical in line with the `phaseState` pattern every other service
  already has.
- `get-scripture-of-the-day-view-model.ts`: the mock builder now gates
  `rows` on `phaseState === "populated"`, matching the other mocks. Both
  `FromApi` error branches route through one `errorViewModel()` helper that
  sets `phaseState: "error"` and explicitly nulls `selectedRow` plus all
  four modal/menu flags — the same leak-prevention shape as A4's testimonies
  fix, applied here for the first time.
- `scripture-of-the-day-overview-table.tsx`: rows are now gated on
  `phaseState === "populated"`, with `loading`/`error`/`empty` branches
  added — the `error` branch uses the shared `AdminErrorState` from A5, so
  this vertical gets the same visual language as everywhere else for free.
- `scripture-of-the-day-page.tsx`: the client-side tab-switch fetch catch
  handler was leaving the view permanently stuck on "Loading scriptures..."
  on failure (no error path existed to fall into); now sets an explicit
  error state, and `loadingScriptureViewModel` also clears `showEdit`/
  `showDeleteConfirm` so an in-flight tab switch can't leave a stale modal
  flag set either.

**Verified**: new `get-scripture-of-the-day-view-model.test.ts` (3 tests: a
real successful mapping, and the two failure paths asserting `phaseState`,
zero rows, null `selectedRow`, and all four modal flags false). `tsc --noEmit`,
`eslint .`, `vitest run` (135/135, up from 132), `next build` all clean.
Browser-reproduced the original bug: `/scripture-of-the-day` with the
backend down now shows the standard error card and zero rows; confirmed via
`innerText` (what a user actually sees) that "Jeremiah 29:11" no longer
appears anywhere visible — it's only present in Next.js's inert hydration
`<script>` payload (an unused prop value, same as any client component ships
for any unrendered field; verified this is not a real leak by checking
`innerText` vs `textContent` separately). `?edit=1` with the backend down no
longer opens the Edit Scripture form. Checked in both dark and light mode.

### B2. Overview page can't distinguish "nothing pending" from "backend unreachable" — ✅ FIXED
`get-admin-overview-view-model.ts`'s `catch` block and `!response.ok` branch
both collapsed to `getAdminOverviewViewModel({ ...input, empty: true })` — the
same visual state as a genuinely quiet day (0 pending testimonies, 0 pending
donations, "No Data here Yet"). This is the landing page every admin sees
first; a transient backend outage looked identical to "you're all caught
up," which risked real pending items going unnoticed. `AdminOverviewViewModel`
had no `errorMessage`/error phase at all — exactly as scoped, confirmed by
reading the file: only an `empty: boolean` field existed, no `phaseState`
concept like every other vertical already has.

**Fix**:
- `domain/entities/overview.ts`: replaced `empty: boolean` with the standard
  `AdminOverviewState = "populated" | "empty" | "error"` `phaseState` field
  plus an optional `errorMessage`, matching the pattern from A5/B1.
- `get-admin-overview-view-model.ts`: the mock builder now takes a generic
  `state?: string` input normalized through `normalizeState()` (recognizing
  `"empty"` and `"error"`, defaulting to `"populated"`) instead of a single
  boolean. `getAdminOverviewViewModelFromApi`'s `!response.ok` branch and its
  `catch` block both now route through `getAdminOverviewViewModel({ ...input,
  state: "error" })`, setting a real `phaseState: "error"` with a concrete
  `errorMessage` instead of silently reusing the empty-state shape.
- `overview/page.tsx`: passes `state: params.state` straight through instead
  of narrowly translating it into `empty: params.state === "empty"`.
- `admin-overview.tsx`: restructured around `phaseState` — the metrics grid
  now renders an em-dash ("—") instead of "0" when `phaseState === "error"`
  (a bare `0` would read as "confirmed caught up" when the truth is "couldn't
  check"), and the table area now has three distinct branches: populated rows,
  the existing "No Data here Yet" empty state, or the shared `AdminErrorState`
  card from A5 on error. The dead half of the old `tableColumns` ternary
  (unreachable once the header row moved inside the populated-only branch)
  was removed.

**Verified**: updated `admin-overview.test.tsx`'s existing empty-state test
for the new `{ state: "empty" }` input shape, and added a regression test
asserting the error state renders "Unable to load your overview," never "No
Data here Yet" or a bare "0," and shows exactly two dash placeholders.
`tsc --noEmit`, `eslint .`, `vitest run` (136/136, up from 135), `next build`
all clean. Browser-verified with Playwright against the dev server (no
backend running, so every request naturally exercises the error path): the
Overview page now shows the red-tinted `AdminErrorState` card with dash
metrics instead of misleading zeros, confirmed in both dark and light theme
with zero console errors. Populated/empty visual states are unchanged from
before and remain covered by the existing passing component tests.

### B3. My Profile shows an error banner *and* stale fields at the same time — ✅ FIXED
`/my-profile` rendered "We could not load your profile right now" directly
above a fully populated Personal Information / Contact Information block
(Role: Super Admin, Full Name: E2E Admin, etc.) sourced from the mock
fallback — exactly as scoped. Confirmed by reading the code:
`MyProfileViewModel` already had a `phaseState` field (unlike B1/scripture-
of-the-day, which needed the field added from scratch), and the component
already branched on it to show the `AdminErrorState` banner — but the
`<div className="space-y-4">` block containing both `SettingsCard`s, and the
`ProfilePicture` avatar above it, rendered **unconditionally** with no
`phaseState` guard at all, so the error banner and the populated-looking
fields always appeared together.

**Fix**: `my-profile-page.tsx` — wrapped both `<ProfilePicture>` and the
Personal/Contact Information `<div className="space-y-4">` block in
`viewModel.phaseState !== "loading" && viewModel.phaseState !== "error"`,
mirroring the exact guard already used by the sibling
`notification-settings-page.tsx` in the same feature directory (which had
this right from the start) — so the fix brings `my-profile-page.tsx` in line
with an established pattern rather than inventing a new one. The password-
change modal and its empty `readOnly` inputs were left untouched: they're
driven purely by a URL query flag, not by fetched profile data, so there's
no fabricated-record leak risk there (checked, unlike the A4/B1 modal
leaks).

**Also found, logged separately as B8**: `roleLabel` ("Super Admin") is
never read from the `/profile/me/` API response even on a fully successful
load — `get-my-profile-view-model.ts`'s `getMyProfileViewModelFromApi` merge
only overrides `fullName`/`emailAddress`/`mobileNumber`/`hasProfileImage`
from the real payload, leaving `roleLabel` hardcoded from the mock builder
in every case. Out of B3's literal scope (not phaseState-specific — it's
wrong on success too), so left unfixed here.

**Verified**: added a regression test in `settings-pages.test.tsx` asserting
that on `state: "error"`, "Unable to load your profile" shows while
"Personal Information," "Contact Information," and the profile-picture-menu
trigger are all absent. `tsc --noEmit`, `eslint .`, `vitest run` (137/137, up
from 136), `next build` all clean. Browser-verified with Playwright against
the dev server (no backend, so `/my-profile` naturally hits the error path):
confirmed via `innerText` that "Personal Information" no longer appears
anywhere on the error page, in both dark and light theme, zero console
errors.

### B4. Donations header stats are hardcoded regardless of load state
`get-donations-view-model.ts:154,166,249-250,379` — `Donors (3)` and
`Total Donations (₦1,000,000)` come from the mock `donationRows` fixture and
render in the page header even when the table body below says "We could not
load donations right now." Same root cause as B1/B2: the error branch
(`get-donations-view-model.ts:362-363,384-385`) reuses the mock builder
wholesale instead of zeroing out or hiding the derived stats.

### B5. Sidebar "Notifications history" badge is a hardcoded literal, not live data
`get-admin-shell-view-model.ts:11` — `badge: "10"` is a string literal, shown
on every page regardless of actual unread count. This sits right next to a
*correctly* implemented live unread-count bell in the header
(`header-notification-bell.tsx`, polls `/api/admin/notifications/unread-testimony-count`
every 30s) — the inconsistency will be confusing the moment the two numbers
disagree in a real demo. Wire the sidebar badge to the same source, or drop
it until it can be.

### B6. Reviews and Admin Management have no backend integration attempt yet
`get-reviews-view-model.ts` and `get-admin-management-view-model.ts` export
only the mock builder — no `FromApi` function exists at all (unlike every
other admin section). Both render cleanly as static mock UI today, which is
fine for now, but flagging so it's an explicit, tracked gap rather than an
oversight: when the backend endpoints exist, these need the same
`...FromApi` treatment (with a real error state per section A/B pattern
above) that the other 8 services already have.

### B7. Analytics has no backend endpoint to wire to at all
Same shape as B6, one level further back: `get-reviews-view-model.ts` and
`get-admin-management-view-model.ts` at least have a real Django app/model
behind them, just no API endpoint wired up yet. Analytics has neither —
`grep`ed the backend for any `analytics` route and found nothing. Getting
real data here means designing and building new Django aggregation
endpoints (engagement-by-category, top-testimonies-by-views, distribution
percentages, time-series) across the testimonies/donations/users apps —
backend design work, out of scope for a frontend pass. The mock's *data
quality* was fixed (see A6 above); the mock is now internally consistent and
presentable, but it is still a mock.

### B8. My Profile's Role field is hardcoded, even on a successful load
Found while fixing B3. `get-my-profile-view-model.ts`'s
`getMyProfileViewModelFromApi` fetches `/profile/me/` and merges
`full_name`/`email`/`phone_number`/`avatar` from the real payload over the
mock builder's defaults — but never touches `roleLabel`, so "Role: Super
Admin" renders on every real page load regardless of the signed-in admin's
actual role. Unlike B1–B3/B4, this isn't a `phaseState`-leak (it's wrong on
`populated` too, not just `error`) — likely needs a `role` field added to the
backend's `/profile/me/` response, or reading it off the existing session,
if the session already carries it.

## C. Smaller polish (not blocking, worth a pass)

- Header greeting ("Hello Admin" / "How are you doing today?") is a hardcoded
  literal in `admin-dashboard-shell.tsx` even though `viewModel.fullName` is
  available and already shown in the top-right account pill — could
  personalize ("Hello Elvis").
- Testimony detail modal (`?view=1`): avatar image at the top renders as a
  blank white circle, and the close button sits flush against the top edge —
  looks unfinished, worth a design pass on the modal header.
- Reviews page has no page-header subtitle (other list pages like Donations
  have one under the H1) — inconsistent page-header pattern across sections.
- Reviews table has row checkboxes with no visible bulk-action bar when rows
  are selected, and no "select all" affordance beyond the header checkbox —
  confirm whether bulk actions are planned or the checkboxes should come out.
- `/testimonies?view=1` shows a "Schedule" action on a **Pending** testimony —
  worth confirming that's an intended action for that status, since
  scheduling usually implies an already-approved item.
- `/signup`'s "invite only" screen has both a primary "Back to Log In" button
  and a redundant "I have an account" link doing the same thing directly
  below it.

---

## Screenshots

Full-page captures for every route (desktop + 3 mobile) are saved at
`/tmp/ui_review/screenshots/` for reference while working through this list.
