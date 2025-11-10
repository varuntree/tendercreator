# Expanded Plan for Mobile Responsive Optimization

This document breaks the provided mobile responsive optimization plan into discrete phases, steps, and substeps so the run workspace can track progress against each deliverable.

## Phase 0: Bootstrapping & Path Resolution
1. Confirm the workspace (`AI_docs/temp_plan/run_YYYYMMDD_HHMM`) and update the `LATEST` pointer so artifacts live in a predictable directory.
2. Resolve `PLAN_PATH` to `/Users/varunprasad/code/prjs/tendercreator/tendercreator/specs/mobile_responsive_optimization/plan.md` and log it in the tracking file alongside the repo summary.
3. Seed the workspace with the tracking file, state file, and any helper documents required by the run instructions (checklists, assumptions, etc.).

## Phase 1: Foundation & Sidebar
### Step 1 – Audit Sidebar and Layout
- Review `components/sidebar.tsx` for the current collapse logic, toggle states, and LocalStorage usage.
- Inspect `app/(dashboard)/layout.tsx` to understand how the sidebar is rendered and where the main content receives its left margin.
- Confirm the `use-media-query` hook (hooks/use-media-query.ts) returns reliable `max-width: 767px` matches and note any gaps.
- Document the existing behavior so we can compare against the mobile-first implementation.

### Step 2 – Sidebar Sheet Implementation
- Import and configure the Radix Sheet from `@/components/ui/sheet`, the `Menu` icon from `lucide-react`, and the `use-media-query` hook inside `components/sidebar.tsx`.
- Extend the component so desktop (≥ md) renders the existing sidebar, while mobile (< md) renders a Sheet with a `SheetTrigger` hamburger at the top and the sidebar markup housed in `SheetContent`.
- Keep the current desktop width/padding and only expose the new Sheet UI for mobile breakpoints.

### Step 3 – Layout Adjustments for Mobile
- Update `app/(dashboard)/layout.tsx` so the main content uses responsive padding (`px-4 sm:px-6 lg:px-8`) and the left margin only appears at ≥ md (e.g., `md:ml-[72px]` or `md:ml-[20px]`).
- Hide the sidebar markup (or limit it to `md:block`) on small screens so the Sheet takeovers do not render twice.
- Reconcile any top-level wrappers (flex containers, background) to avoid desktop leakage when the sidebar is hidden.

## Phase 2: Project Detail Page
### Step 4 – Project Metadata for Mobile
- Wrap the sidebar `<aside>` (app/(dashboard)/projects/[id]/page.tsx) in `hidden lg:block` so it disappears below the large breakpoint.
- Add an `lg:hidden` project header card that surfaces avatar, client, deadline, and key stats above the main stack so mobile users still see essential context.
- Switch the page container to `flex-col lg:flex-row` and make the main area fluid (`flex-1`) rather than relying on fixed widths.

### Step 5 – Kanban Visibility Toggle
- Surround the Kanban section (lines ~474-530) with a `hidden md:block` wrapper so tablets/desktops retain the board while phones only see the table beneath.
- Add a descriptive comment so later reviewers know the intent (desktop board + mobile table).
- Ensure the work package table remains accessible on all breakpoints since it already serves the phone layout.

## Phase 3: Work Package Strategy Screen
### Step 6 – Requirements Table Simplification
- In `components/workflow-steps/strategy-generation-screen.tsx`, hide the `#` and `Source` columns at `<md` by applying `hidden md:table-cell` to both the `<th>` and `<td>` elements.
- Keep `Priority` and `Requirement` visible, shrink padding, and wrap the table in `overflow-x-auto` for edge cases.

### Step 7 – Bid Guidance Grid Stack
- Change the `grid` container of recommendations/criteria from `grid-cols-2` to `grid-cols-1 md:grid-cols-2`, letting mobile cards stack.
- Wrap wide tables inside the section with `overflow-x-auto` so they can scroll horizontally without breaking the viewport.

### Step 8 – Floating Action Panel
- Update the floating panel to span the full width on mobile with `fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-auto w-full` and plenty of vertical padding (`p-4`), while preserving the existing desktop float.
- Ensure the button group stacks vertically on phones (`flex-col md:flex-row gap-2`).

## Phase 4: Forms & Modals
### Step 9 – Company Profile Dialog
- Target the `DialogContent` wrapper inside `components/company-profile-form.tsx` and add `max-md:w-screen max-md:h-screen max-md:max-w-none` while keeping `md:max-w-[600px]` for desks.
- Make the modal scrollable via `overflow-y-auto` and stack submit/cancel buttons on mobile.

### Step 10 – Global Dialog Audit
- Search for every `Dialog`/`DialogContent` usage across the repo, catalog whether it already responds to narrow widths, and apply the mobile-friendly full-screen wrapper where needed.
- Prioritize high-visibility modals (create project, generate documents, settings) but document any that already behave correctly.

## Phase 5: Touch Targets & UI Polish
### Step 11 – Touch Target Audit
- Review icon-only buttons (sidebar nav, table actions, floating controls) ensuring they have at least `min-h-[44px] min-w-[44px]` or padding adjustments at `max-md` sizes.
- Keep desktop versions tight by scoping size-inflations to `max-md` utilities (e.g., `max-md:p-3`).

### Step 12 – Responsive Navbar
- Let the navbar container become `flex-col md:flex-row` and limit breadcrumb length on mobile (collapse middle items, keep last two).
- Wrap stats/badges so they either stack or hide under a `md:flex-row` layout, ensuring the user menu fits inside the viewport.

### Step 13 – Settings Tabs
- Place the tab list inside `overflow-x-auto` with `whitespace-nowrap` so they scroll on phones instead of wrapping or truncating.
- Keep tabs stacked on small screens if scrolling is insufficient for the layout.

## Phase 6: Testing & Validation
### Step 14 – Desktop Visual Regression
- Capture reference screenshots of key pages at 1920px widths before/after changes (or note key sections to eyeball) and confirm there are no visual regressions.

### Step 15 – Mobile Manual Testing
- Exercise authentication, projects, work packages, strategy editor, editors, exports, and settings flows at 375x667/390x844/360x740 viewports using DevTools or a device.

### Step 16 – Quality Gates
- Run `npm run build`, `npm run lint`, and `npm run type-check` (or `tsc --noEmit`) to guarantee no compile/lint regressions before sign-off.

## Continuous Documentation & Tracking
- Mirror this plan in `02_checklists.md` (implementation + review checklists) and log each heartbeat/part in `TRACKING.md`.
- Record assumptions and risks in `03_assumptions_and_risks.md` with validation steps.
- Update `.agent_state.json` after each phase so the run state can be resumed if interrupted.
