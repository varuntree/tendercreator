# Plan: revamp-tender-planning-flow

## Plan Description
Revamp the tender planning experience so strategy generation is an explicit action initiated from the work package screen, not an automatic side-effect. This includes redesigning the Tender Planning UI (requirements, bid/no-bid, win strategy) to match the new creative direction the user provided, replacing the existing three-step loader and tabbed layout. The new flow introduces a dedicated “Start Tender Planning” entry button in place of “Generate Content,” ensures “Generate Content” only appears after strategy data exists, and implements refreshed cards/sections for requirements, bid analysis, and win themes.

## User Story
As a bid writer working on a tender document
I want to intentionally kick off the Tender Planning step and only generate content once strategy assets exist
So that I remain in control of AI calls, understand the plan produced, and experience a polished, modern UI that reinforces trust in the workflow.

## Problem Statement
Automatic strategy generation on document open causes confusion, duplicate API calls, and a loader that never clears even when win themes already exist. The current UI (ProcessLoader + tabbed layout) feels dated and does not reflect the new design direction. We need a controlled flow where planning is triggered deliberately, clearly communicates status, and visually aligns with the refreshed product vision.

## Solution Statement
Introduce a two-phase CTA sequence: (1) “Start Tender Planning” to call `/api/work-packages/[id]/generate-strategy`, (2) reveal “Generate Content” only after bid analysis + win themes exist. Replace the ProcessLoader Inline + segmented tabs with a single modern layout that stacks hero, CTA row, and three redesigned cards (Requirements, Bid/No-Bid, Win Themes) styled per the provided references. Maintain underlying functionality (requirements list, bid analysis summary, editable win themes) but reorganize it into the new layout and state machine.

## Pattern Analysis
- `app/(dashboard)/work-packages/[id]/page.tsx:32-152` manages work package, project, and content loading; we will extend its state contract (currently `contentLoaded`) so downstream components know when data is fresh before enabling actions.
- `components/workflow-steps/strategy-generation-screen.tsx:62-520` houses the existing Tender Planning UI, auto-generation effect, ProcessLoader, segmented tabs, and CTA arrangement. This is the primary refactor surface to implement the new manual trigger and redesigned sections.
- `components/workflow-steps/workflow-tabs.tsx:1-78` shows how step progress indicators sit above tabbed content; we may keep the overall WorkflowTabs wrapper but the strategy tab content will change entirely, so this file demonstrates how neighboring steps expect to receive `completedSteps`.
- `components/workflow-steps/assessment-parameters-table.tsx:1-140` and `components/workflow-steps/bid-recommendation-card.tsx:1-160` illustrate how complex cards leverage shadcn `Card`, `Badge`, `Select`, etc. These patterns (header, helper badge, responsive grid) must be mirrored in the redesigned sections.
- `components/process-loader-overlay.tsx:11-210` + `components/streaming-progress.tsx:6-90` show the existing step-loader visual, which we will remove in favor of a lighter status indicator. Understanding how loaders were previously wired helps ensure we retire unused props and avoid regressions.
- Coding standards in `ai_docs/documentation/standards/coding_patterns.md` mandate Tailwind + shadcn usage and forbid hard-coded design values; new UI elements must keep using tokens.

## Dependencies
### Previous Plans
- `specs/optimize_workflow_4_steps/optimize_workflow_4_steps.md` – defines the four-step workflow expectations (Requirements → Strategy → Editor → Export). Our redesign must respect this sequencing (strategy before editor) and any guardrails described there.
- `specs/ai-pipeline-refactor/ai-pipeline-refactor.md` – documents the combined strategy endpoint and save semantics; we rely on that work to keep API behavior intact while changing invocation timing.

### External Dependencies
None (reusing existing Supabase + Gemini integrations).

## Relevant Files
Use these files to implement the task:

- `app/(dashboard)/work-packages/[id]/page.tsx` – orchestrates data fetch and passes props to the strategy screen; update to surface new CTA states and stop auto-generation triggers.
- `components/workflow-steps/strategy-generation-screen.tsx` – main Tender Planning UI that must be redesigned, handle the new “Start Tender Planning” button, conditional “Generate Content” button, and updated sections.
- `components/workflow-steps/bid-recommendation-card.tsx` & `components/workflow-steps/assessment-parameters-table.tsx` – supply reusable UI chunks for bid analysis; adapt or wrap them to fit the new layout.
- `components/workflow-steps/workflow-tabs.tsx` & `components/workflow-steps/step-progress-indicator.tsx` – ensure WorkflowTabs still receives correct completion state after we change when strategy is considered “done.”
- `app/api/work-packages/[id]/generate-strategy/route.ts` – no logic changes expected, but references help confirm payload structure and success criteria for the new CTA gating.
- `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` – read to understand existing E2E manual test structure prior to drafting the new test script.

### New Files
- `.claude/commands/e2e/test_revamp_tender_planning_flow.md` – new manual E2E test instructions covering the updated Tender Planning → Generate Content flow.

## Acceptance Criteria
1. Opening a work package no longer triggers `/api/work-packages/[id]/generate-strategy`; the request fires only when the user presses the new “Start Tender Planning” (name TBD in design) button.
2. The primary CTA row shows the new planning button when no strategy exists, and swaps to “Generate Content” (enabled) plus “Continue in Editor” only after bid analysis + win themes are persisted.
3. ProcessLoaderInline (and any inline step loader copy) is removed from the strategy screen; instead a new status banner / subtle progress indicator communicates planning state per the provided inspiration.
4. Requirements, Bid/No-Bid, and Win Themes are rendered in redesigned cards/sections (no tabs). Requirements remain read-only list, bid analysis shows criteria + recommendation, win themes remain editable with add/edit/delete/regenerate actions.
5. Loading and empty states reflect the new flow: before planning the sections show placeholders; during planning, a clean skeleton/loader appears; after planning, real data populates. Regenerate reuses the same CTA states.
6. “Generate Content” button remains disabled until planning succeeds; invoking it still calls `/api/work-packages/[id]/generate-content` and navigates to the editor tab.
7. Implement a new manual E2E test script file describing how to validate the revamped flow end-to-end, referencing `.claude/commands/test_e2e.md` conventions.
8. All existing lint/test commands pass.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Research & Design Notes
- Review design inspiration assets provided by the user alongside `ai_docs/documentation/CONTEXT.md`, `PRD.md`, and standards doc to capture tone/spacing expectations.
- Audit current CSS utility usage inside `strategy-generation-screen.tsx` and note which parts can be removed vs. repurposed.

### 2. Update Data Flow on Work Package Page
- Modify `app/(dashboard)/work-packages/[id]/page.tsx` to remove any remnants of auto-generation assumptions (e.g., don’t set strategy step complete until content indicates it).
- Ensure props passed to the strategy screen include flags needed for the new CTA gating (e.g., booleans for `hasStrategyData`, `isPlanning`).

### 3. Redesign Strategy Screen Structure
- In `components/workflow-steps/strategy-generation-screen.tsx`, remove SegmentedControl, Tabs, and ProcessLoaderInline usage.
- Build the new hero/header section with brief description, subtle status badge, and CTA placeholder area (two buttons). Use Tailwind + shadcn per standards.
- Introduce a compact status indicator (e.g., pill with dot + text) to replace the removed loader.

### 4. Implement Manual Tender Planning CTA Logic
- Add state to track planning lifecycle (`isPlanning`, `hasStrategyData`, timestamps for last run).
- Render a “Start Tender Planning” button (with icon + helper text) that POSTs `/generate-strategy` and drives the new planning states.
- Only once planning succeeds should the “Generate Content” button become visible/enabled; ensure CTA row updates accordingly.

### 5. Rebuild Requirements Card
- Create a new requirements card layout inspired by the design reference (title, summary count, scrollable list, badges for mandatory/optional).
- Include placeholder/empty states when planning hasn’t run or when no requirements exist.

### 6. Rebuild Bid/No-Bid Section
- Compose a refreshed section that surfaces the assessment table summary plus bid recommendation card inside a cohesive container (e.g., two-column grid with highlights, simplified copy from existing components).
- Ensure the regenerate action hooks into the same `handleGenerateStrategy` logic while surfacing a small tooltip/helper.

### 7. Rebuild Win Themes Section
- Design a new card for win themes featuring chips or list rows with edit/delete actions, plus an inline “Add Win Theme” control.
- Provide visual cues for planning status (e.g., skeleton placeholders) and ensure manual edits persist locally until saved/regenerated (matching current behavior).

### 8. Wire Loading/Empty States & Status Messaging
- When planning has never run: show prompts encouraging user to start planning, greyed requirements/bid/themes sections, and disable Generate Content.
- While planning is running: show consistent spinner/skeleton across all sections plus disable CTA buttons.
- After planning: show real data, highlight last updated timestamp, and mark WorkflowTabs strategy step complete.

### 9. Create New Manual E2E Test Script
- After implementation details are known, draft `.claude/commands/e2e/test_revamp_tender_planning_flow.md` describing how to validate the new UX (login, open project, start planning, observe UI changes, generate content).
- Follow instructions from `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` for structure.

---
✅ CHECKPOINT: Steps 1-9 complete (Design & Frontend refactor). Continue to step 10.
---

### 10. QA & State Regression Pass
- Manually verify strategy regeneration, editing win themes, and content generation still work.
- Ensure no automatic `/generate-strategy` requests fire on page load (check Network tab).

### 11. Update Documentation/Comments if Needed
- Add concise comments where logic is non-obvious (e.g., CTA gating) referencing this revamp.

### 12. Run Validation Commands
- Execute linters/tests listed below and ensure expected output before handing off.

## Testing Strategy
### Unit Tests
- Rely on existing behavior (no new unit tests specified), but consider future tests for CTA state hooks once component structure stabilizes.

### Edge Cases
- Work packages with zero requirements (sections should still render with helpful copy).
- Strategy data existing before UI load (ensure buttons immediately show the correct state without extra API calls).
- Regeneration failures (toast error + state reset).

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

1. `npm run lint` → should finish with `0 errors`.
2. `npm run test` → existing unit tests pass (if none, command should exit cleanly).
3. `npm run test:e2e` (or equivalent Playwright/Cypress command if configured) – expect suite to pass; if unavailable, document manual verification.
4. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_revamp_tender_planning_flow.md` once created to validate UX manually.

**E2E Testing Strategy:**
- Use credentials from `.claude/commands/test_e2e.md` (test@tendercreator.dev / TestPass123!).
- Follow existing sample test structure when authoring the new script.
- Capture screenshots referenced in the test doc to prove the new UI states if feasible.

# Implementation log created at:
# specs/revamp-tender-planning-flow/revamp-tender-planning-flow_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (if UI change)

## Notes
- Consider extracting reusable subcomponents (e.g., status badge, CTA row) if layout grows complex.
- Keep CTA copy flexible (easily updated) by centralizing text constants near the component top.

## Research Documentation
- None beyond references cited above; no additional research files were created.
