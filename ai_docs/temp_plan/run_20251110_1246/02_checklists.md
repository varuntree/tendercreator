# Implementation Checklist
- [x] Phase 1 · Step 1: Audit sidebar/layout/hook usage and document current mobile blockers.
- [x] Phase 1 · Step 2: Wrap the desktop sidebar inside a Radix Sheet triggered only on mobile.
- [x] Phase 1 · Step 3: Adjust `app/(dashboard)/layout.tsx` padding/margins so the mobile Sheet has full width.
- [x] Phase 2 · Step 4: Replace the fixed project sidebar with a mobile-only info card and responsive container.
- [x] Phase 2 · Step 5: Hide the Kanban board on `<md` while keeping the table visible.
- [x] Phase 3 · Step 6: Reduce the requirements table to priority+requirement columns on mobile.
- [x] Phase 3 · Step 7: Stack the bid guidance grid and guard wide tables with overflow wrappers.
- [x] Phase 3 · Step 8: Convert the floating action panel into a sticky full-width bar on phones.
- [x] Phase 4 · Step 9: Make the company profile dialog full-screen on mobile and scrollable.
- [x] Phase 4 · Step 10: Apply the same mobile dialog pattern to all remaining modals.
- [x] Phase 5 · Step 11: Enforce 44px tap targets for icon buttons/touch controls at `max-md`.
- [x] Phase 5 · Step 12: Stack or wrap navbar elements to prevent overflow for small viewports.
- [x] Phase 5 · Step 13: Make settings tabs scrollable/stacked on phones without wrapping.
- [x] Phase 6 · Step 14: Verify no desktop visual regressions (screenshots or close comparison).
- [x] Phase 6 · Step 15: Execute the core mobile flows listed in the plan at representative breakpoints.
- [x] Phase 6 · Step 16: Run all quality gates (`npm run build`, `npm run lint`, `npm run type-check`).

# Review Checklist
- [x] Confirm every change is scoped to `max-md`/mobile-first utilities and leaves desktop markup untouched.
- [x] Align implementation with the acceptance criteria (sidebar sheet, Kanban hide, modal behavior, etc.).
- [x] Validate that manual testing notes cover both desktop (1920px) and mobile (iPhone/Android) breakpoints.
- [x] Ensure touch-target adjustments meet the 44px minimum without bloating desktop clickable areas.
- [x] Verify that no new dependencies were added and the existing stacks (Radix, Tailwind, lucide-react) are used appropriately.
- [x] Confirm all temporary/debug helpers were removed and no dead code remains.
- [x] Quality gates (build, lint, type-check) have documented PASS statuses.
- [x] Documentation updates (tracking, plan artifacts, assumption log, README references, etc.) are complete.
- [x] Orientation/part logs show how the plan mapped to repo modules and highlight any deferred cleanups.
