# Plan: auto-strategy-during-analysis

## Plan Description
Restructure the project analysis workflow so every work package receives requirements, bid/no-bid guidance, and win themes automatically during the initial Analyze step. This removes the in-app “generate strategy” sub-step; when a user opens a document, the strategy tab already contains all artifacts and only the Generate Content action remains.

## User Story
As a tender writer analyzing a new project
I want strategy assets (requirements, bid decision, win themes) to be produced automatically during analysis
So that opening a work package lets me jump straight into content generation without extra waiting steps.

## Problem Statement
Currently, Analyze RFT only outputs requirements + work packages. Win themes and bid/no-bid are generated later inside the document workflow, requiring another API call per work package and confusing the user with perpetual spinners. We need to pre-compute all strategy data so the first workflow step is already satisfied.

## Solution Statement
Extend the `/api/projects/[id]/analyze` pipeline to, after creating each work package, assemble context and call the combined strategy generator (bid analysis + win themes). Persist results immediately with `saveCombinedGeneration`. Update UI to treat strategy as “ready on open,” removing the auto-trigger logic + CTA in `StrategyGenerationScreen` and ensuring the screen simply displays data with a regenerate option if needed.

## Pattern Analysis
- `app/api/projects/[id]/analyze/route.ts:70-170` orchestrates analysis → work package creation. This is where we will append strategy generation per document using `generateStrategy` and `saveCombinedGeneration` (pattern from `app/api/work-packages/[id]/generate-strategy/route.ts:17-87`).
- `components/workflow-steps/strategy-generation-screen.tsx:1-520` still assumes strategy may not exist and triggers auto-generation / Start Tender Planning CTA. This must be simplified to assume data exists (with optional regenerate) and only gate the Generate Content button on win themes presence.
- `libs/repositories/work-package-content.ts:240-294` provides `saveCombinedGeneration` used for atomic saves; we will reuse it during analysis.
- `libs/ai/content-generation.ts:210-272` defines `generateStrategy` using Gemini; needs to be callable from the analysis batch with correct context assembly (`libs/ai/context-assembly.ts`).
- Past spec `specs/revamp-tender-planning-flow/revamp-tender-planning-flow.md` reworked the strategy UI; we’ll leverage that layout but remove the Start Planning button.

## Dependencies
### Previous Plans
- `specs/revamp-tender-planning-flow/revamp-tender-planning-flow.md` — ensures strategy screen already surfaces requirements/bid/win sections; we will streamline it to an always-ready view.
- `specs/ai-pipeline-refactor/ai-pipeline-refactor.md` — documents the combined strategy endpoint + `saveCombinedGeneration` semantics used for atomic saves.

### External Dependencies
None (reuse existing Gemini + Supabase stack).

## Relevant Files
Use these files to implement the task:
- `app/api/projects/[id]/analyze/route.ts` — extend analysis flow to call strategy generation per work package.
- `libs/ai/content-generation.ts`, `libs/ai/context-assembly.ts` — ensure helper functions support repeated use (maybe new helper to reuse context per project).
- `libs/repositories/work-package-content.ts` — store generated bid/win data after analysis.
- `components/workflow-steps/strategy-generation-screen.tsx` — simplify UI/logic: no Start Planning CTA, show ready data, keep regenerate for manual refresh.
- `components/work-package-table.tsx` — confirm “Open” button doesn’t expect planning to run when clicked.
- `.claude/commands/test_e2e.md`, `.claude/commands/e2e/test_basic_query.md` — read before writing new E2E script.

### New Files
- `.claude/commands/e2e/test_auto_strategy_during_analysis.md` — manual E2E instructions verifying everything is pre-generated after Analyze.

## Acceptance Criteria
1. Running Analyze RFT now generates requirements, bid/no-bid analysis, and win themes for every work package during the same API call.
2. When opening any work package, the strategy tab immediately shows completed bid analysis + win themes with no additional spinner or Start Planning button.
3. Generate Content CTA is available immediately (still disabled until win themes exist) since themes are precomputed.
4. Users can still regenerate strategy from the document screen, but default state no longer triggers API calls automatically on mount.
5. The bulk analysis operation remains resilient: handle Gemini rate limits gracefully, log failures per document, and continue processing remaining docs.
6. New E2E instructions cover analyzing a project and verifying that opening a doc shows ready-made strategy data.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Research Current Pipeline + Context Assembly
- Re-read `app/api/projects/[id]/analyze/route.ts`, `libs/ai/content-generation.ts`, and `libs/ai/context-assembly.ts` to understand how context is built and reused.
- Confirm where work package content records are created and how `saveCombinedGeneration` behaves on missing records.

### 2. Design Strategy Generation Hook for Analysis
- Outline how to reuse assembled project context across multiple work packages to avoid redundant work.
- Decide error-handling strategy: if bid analysis fails for one doc, log error and continue, returning warning to client.

### 3. Update Analyze API
- After each work package is created, generate strategy data (bid analysis + win themes) using `generateStrategy`.
- Persist results with `saveCombinedGeneration`; include minimal metadata in SSE progress events so UI can reflect success/failure in future.
- Ensure context assembly happens once before loop and is reused.

### 4. Adjust Client Workflow Screen
- Remove Start Planning button + planning status logic from `StrategyGenerationScreen`; treat strategy data as ready.
- Retain Regenerate Strategy button for manual refresh, but default state should simply render the cards (with loading fallback only if data truly missing).
- Make Generate Content button available immediately (still requires win themes to exist but they should on first load).

### 5. Clean Up Obsolete Events/State
- Remove any breadcrumb or CTA code relying on tender planning states (e.g., `planningStatus`, auto-trigger effects) now that planning happens server-side.
- Ensure no references remain to `Start Tender Planning` copy.

### 6. Update Analyze UI Messaging (Optional)
- If needed, tweak front-end copy (e.g., Strategy screen helper text) to reflect that planning already completed during analysis.

### 7. Add/Update E2E Test Instructions
- Create `.claude/commands/e2e/test_auto_strategy_during_analysis.md` describing how to analyze a project, open a document, and confirm strategy data already exists without triggering extra actions.

---
✅ CHECKPOINT: Steps 1-7 complete (Backend + UI plan + docs). Continue to validation.
---

### 8. QA + Validation
- Manually run Analyze on a sample project (fixtures) and ensure each work package immediately contains bid/win data.
- Open work packages to confirm UI shows ready strategy and Generate Content works.
- Run lint/tests per Validation Commands.

## Testing Strategy
### Unit Tests
- No new automated tests planned; rely on manual QA and lint.

### Edge Cases
- Gemini double-call failure: ensure analysis continues and surfaces error for affected work package.
- Projects with many work packages: confirm context re-use prevents repeated heavy assembly.
- Regenerate strategy still works post-change.

## Validation Commands
1. `npm run lint` → expect success.
2. `npm run test` → still missing script; document as such if unchanged.
3. Follow `.claude/commands/test_e2e.md`, then execute `.claude/commands/e2e/test_auto_strategy_during_analysis.md` instructions manually.

# Implementation log created at:
# specs/auto-strategy-during-analysis/auto-strategy-during-analysis_implementation.log

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Validation commands executed/documented
- [ ] No regressions observed
- [ ] Patterns followed per analysis
- [ ] E2E instructions captured

## Notes
- Consider rate limiting: if strategy generation spikes, we may need lightweight queueing later.
- Potential future enhancement: batch strategy generation to reduce API calls (not in scope now).

## Research Documentation
- None beyond references cited above.
