# Plan: breadcrumb-navigation-update

## Plan Description
Breadcrumb navigation currently displays a single, generic label (e.g., just “Project Workspace”), which fails to reflect the actual hierarchy or entity names. This plan introduces a fully dynamic breadcrumb system that adapts to every dashboard route, surfaces project/document names, and stays synced as users navigate so the navigation bar becomes an accurate locator.

## User Story
As a tender writer navigating the app
I want breadcrumbs that show the exact project and document I’m working on
So that I always know where I am and can backtrack quickly within the workspace.

## Problem Statement
The existing breadcrumb component (`components/breadcrumbs.tsx:1-29`) only renders a single label derived from the pathname and ignores deeper levels. Even when opening a work package, the navbar still shows “Projects,” offering no contextual cues. This makes navigation confusing and hides critical metadata like project or document names.

## Solution Statement
Refactor the breadcrumb system to produce multi-level trails. Use router segments to generate static labels (e.g., “Projects”) while allowing pages to push dynamic labels (e.g., actual project/document names) via a shared context or event bus (currently prototype via `Navbar` project events). Update project and work-package pages to emit structured breadcrumb payloads so the navbar can render `Projects / <Project Name> / <Document Name>` consistently.

## Pattern Analysis
- `components/breadcrumbs.tsx:1-29` shows the current simplistic implementation: a `usePathname` lookup returning one label. We’ll replace this with a composable breadcrumb list builder that emits clickable segments.
- `components/navbar.tsx:21-89` subscribes to custom events (`tendercreator:set-project-nav`) to show project names beside the breadcrumb. This pattern proves we can broadcast metadata from deep pages to the navbar; we can extend it to full breadcrumb payloads.
- `app/(dashboard)/work-packages/[id]/page.tsx:84-99` already dispatches project name events on mount/unmount. We can evolve this to dispatch full breadcrumb details (project + document) to keep the navbar in sync.
- `app/(dashboard)/projects/[id]/page.tsx` and the list page host the Project dashboard view; their existing data loading hooks provide the info needed to populate breadcrumb segments.
- Standards in `ai_docs/documentation/standards/coding_patterns.md` require Tailwind + shadcn for UI structure, so the new breadcrumbs must follow the same utility-based styling.

## Dependencies
### Previous Plans
- `specs/revamp-tender-planning-flow/revamp-tender-planning-flow.md` – ensured docs pages dispatch project context events; we’ll extend similar mechanics without regressing that functionality.

### External Dependencies
None.

## Relevant Files
Use these files to implement the task:

- `components/breadcrumbs.tsx` – replace single-label renderer with dynamic breadcrumb trail component.
- `components/navbar.tsx` – update to consume breadcrumb data structure (array of segments, optional click handlers) instead of hard-coded project name add-on.
- `app/(dashboard)/projects/page.tsx` & `app/(dashboard)/projects/[id]/page.tsx` – ensure list page sets root breadcrumb, project detail pushes project-specific name.
- `app/(dashboard)/work-packages/[id]/page.tsx` – emit breadcrumb data including project + document names.
- `libs/repositories/work-packages.ts` (if needed) – confirm document metadata available for breadcrumb labels.
- `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` – read before drafting the new breadcrumb E2E test instructions.

### New Files
- `.claude/commands/e2e/test_breadcrumb_navigation_update.md` – manual E2E validation script for the new breadcrumb behavior.

## Acceptance Criteria
1. Breadcrumbs display full hierarchy for all dashboard routes: `Projects` list shows “Projects,” project detail shows “Projects / <Project Name>,” and work package shows “Projects / <Project Name> / <Document Type>` (or document name if available).
2. Breadcrumb segments use actual entity names loaded from Supabase (no hard-coded “Project Workspace”).
3. Breadcrumb component renders clickable links for intermediate segments (e.g., clicking “Projects” returns to the projects list; clicking the project name returns to the project dashboard).
4. Breadcrumb updates are event-driven or context-driven so navigating between pages updates instantly without reloads.
5. No regressions to the navbar layout (keeps avatar, actions, etc.).
6. New E2E test instructions document how to verify breadcrumb behavior end-to-end.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Research Current Breadcrumb + Context Events
- Re-read `components/breadcrumbs.tsx` and `components/navbar.tsx` to document current props + event usage.
- Inspect project/work-package pages to confirm available data for names and note existing event dispatch patterns.

### 2. Design Breadcrumb Data Contract
- Define a shared TypeScript interface for breadcrumb segments (label, href, isActive) within `components/breadcrumbs.tsx` or a new helper file.
- Plan how pages will provide dynamic labels (e.g., via custom events or a lightweight global store).

### 3. Implement Dynamic Breadcrumb Component
- Refactor `components/breadcrumbs.tsx` to accept segment data (from context or event) and render `Home` + “/” separated clickable links.
- Ensure component falls back gracefully when no dynamic data exists (default to `[Projects]`).

### 4. Update Navbar to Consume Breadcrumb Data
- Modify `components/navbar.tsx` to subscribe to the new breadcrumb event contract (replacing the current `projectInfo` state).
- Remove ad-hoc project-name span and instead render whatever segments the breadcrumb component outputs.

### 5. Emit Breadcrumb Metadata from Pages
- `app/(dashboard)/projects/page.tsx`: on mount, emit breadcrumb data representing `[Projects]`.
- `app/(dashboard)/projects/[id]/page.tsx`: once project data loads, emit `[Projects] -> [Project Name]`.
- `app/(dashboard)/work-packages/[id]/page.tsx`: after project + work package load, emit `[Projects] -> [Project Name] -> [Document Type or Name]`.
- Ensure events are cleaned up on unmount to avoid stale state.

### 6. Handle Route Changes Without Data (Fallback)
- Ensure breadcrumb component can derive a minimal trail from `usePathname` while waiting for events, so loading states still show sensible labels.

### 7. Author E2E Test Instructions
- After implementation stabilizes, write `.claude/commands/e2e/test_breadcrumb_navigation_update.md` describing steps to verify breadcrumbs across list → project → document routes. Follow guidance in `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md`.

---
✅ CHECKPOINT: Steps 1-7 complete (Breadcrumb architecture + docs). Continue to validation.
---

### 8. QA + Validation
- Manually test navigation through projects list, project detail, and work package detail to ensure breadcrumbs update and links work.
- Run lint/tests from Validation Commands.

## Testing Strategy
### Unit Tests
- No new automated unit tests planned; rely on manual QA + lint.

### Edge Cases
- Navigating directly to `/work-packages/[id]` via URL (no prior events) should still render fallback breadcrumbs while data loads, then swap to full names once ready.
- Projects without names (unlikely) should fallback to “Untitled Project” label.
- Ensure event listeners are removed on unmount to prevent memory leaks.

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

1. `npm run lint` → expect "✔ No ESLint warnings or errors".
2. `npm run test` → currently unavailable; note the absence if still missing but ensure no additional failures.
3. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_breadcrumb_navigation_update.md` to validate manually (documented steps, screenshots per instructions).

# Implementation log created at:
# specs/breadcrumb-navigation-update/breadcrumb-navigation-update_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output (or documented if script missing)
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented above)
- [ ] E2E test created and passing (manual instructions executed)

## Notes
- Consider extracting breadcrumb event helper utilities if further pages need to emit segments later.
- Future enhancement: persist breadcrumb segments in URL state for SSR-friendly behavior.

## Research Documentation
- None beyond references cited in Pattern Analysis.
