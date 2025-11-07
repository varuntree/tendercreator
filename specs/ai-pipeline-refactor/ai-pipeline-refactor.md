# Plan: AI Pipeline Refactor & Standardization

## Plan Description

Comprehensive refactoring of Gemini AI integration across the entire application to establish:
- **Modular patterns**: Reusable AI service layer with consistent interfaces
- **Reliable retry logic**: Exponential backoff, rate limit handling, configurable retries
- **Clear user feedback**: Progress states, error messages, loading indicators
- **Optimized requests**: Reduce from ~20+ Gemini calls to ~5 for bulk generation via batching
- **Documentation**: Patterns recorded in standards, enforced in future development
- **Context optimization**: Consistent assembly, caching strategy, efficient prompt construction

Fixes issues from rapid vertical development: inconsistent error handling, duplicate code, inefficient request patterns (too-many-requests errors for 2 documents), messy agent pipelines, and lack of systematic retry/feedback mechanisms.

## User Story

As a **platform user**
I want **reliable AI content generation that doesn't fail silently or spam rate limits**
So that **I can generate tender documents efficiently without mysterious errors or waiting for retry delays**

## Problem Statement

Current AI integration scattered across 7 API routes, 5 service files, 5 prompt files with:

**Request Inefficiency:**
- Single doc: 3 separate requests (win themes, bid analysis, content) when user opens work package
- Should be: 2 requests (strategy combined, then content)
- Bulk "Generate All": Sequential 1-by-1 → N*2 requests for N documents
- Should be: 1 request for ALL documents returning all results
- Too many requests → rate limit errors for just 2-3 documents

**Inconsistent Patterns:**
- Win themes + bid analysis = 2 separate API calls with separate error handling
- Some routes have retry logic, others don't
- Error responses inconsistent (some return retry info, others don't)
- Context assembly duplicated in each route

**Token Limit Confusion:**
- Code assumes 1M token window
- Actual: 64K token limit (Gemini 2.0 Flash)
- No validation that context fits in 64K before sending

**Error Handling Chaos:**
- Rate limit: detected in 4 places, handled differently
- Frontend: no automatic retry, user must manually retry
- Generic errors: some show message, others silent fail
- Bulk generation: only place with retry logic

**Time/Progress Issues:**
- Bulk generation for 10 docs → 60+ seconds, no clear progress
- Long requests timeout (need edge runtime)
- User doesn't know what's happening during generation

**Documentation Gaps:**
- No standards for AI usage patterns
- No enforcement of consistent retry/error handling
- Token limits not documented

## Solution Statement

Create **simplified AI pipeline** with minimal requests and real-time feedback:

1. **Single Document Flow** (when user opens work package):
   - **Auto-trigger on mount**: Generate bid/no-bid + win themes in ONE request
   - Display results to user
   - **User clicks "Generate Content"**:
     - Immediately navigate to editor
     - Stream content in real-time (paragraph by paragraph)
     - Content appears as Gemini generates
   - **Total: 2 requests** (was 3)

2. **Bulk Generation Flow - Hybrid Client-Orchestrated Batching**:
   - Frontend splits docs into smart batches (2-3 docs per batch)
   - Sequential batch requests: `/api/projects/[id]/generate-batch`
   - Each batch: ONE Gemini request generates multiple docs
   - Live progress: "Batch 2 of 4... (5/10 documents complete)"
   - 5s delay between batches (rate limit safety)
   - **Total: ~N/3 requests** (10 docs = 4 batches vs 20+ requests before)

3. **Unified AI Service Layer**:
   - Single `geminiService.executeRequest()` for all calls
   - Consistent retry logic (exponential backoff)
   - Rate limit detection + retry with delay
   - Token validation (64K limit)
   - Unified error format

4. **Context Optimization**:
   - Validate context fits in 64K tokens
   - Smart batching: token-aware batch sizing
   - Context assembled once per batch (not per doc)
   - Truncate intelligently if needed (oldest org docs first)
   - Accurate token counting

5. **Progress & Error Handling**:
   - Edge runtime for long requests (batch generation)
   - Real-time progress: per-batch updates
   - Streaming content generation for single docs
   - Consistent error messages with retry info
   - Automatic retry on rate limit
   - Graceful degradation: split batches if too large

6. **Documentation**:
   - AI integration patterns documented
   - 64K token limit enforced
   - Standard retry/error patterns

## Pattern Analysis

**Current Patterns Discovered:**

1. **Rate Limit Detection** (`/libs/ai/error-parser.ts:78-124`):
   - Detects 429 status, `QuotaFailure` error, "quota"/"rate limit" in message
   - Extracts `retryDelay` from `RetryInfo` (format "42s")
   - Defaults to 60s if not found
   - **Keep**: This pattern works, centralize usage

2. **Context Assembly** (`/libs/ai/context-assembly.ts:16-70`):
   - Fetch org docs, RFT docs, concatenate with metadata
   - Token estimation (4 chars/token)
   - **Optimize**: Add caching, better token estimation

3. **Prompt Building** (various files in `/libs/ai/prompts/`):
   - All follow pattern: context + task + output format
   - JSON prompts: "valid JSON only, no markdown"
   - **Keep**: Good pattern, ensure consistency

4. **Bulk Generation** (`/libs/utils/bulk-generation.ts:128-304`):
   - Sequential processing (1 doc at a time)
   - Retry logic: 3 attempts for rate limits, exponential backoff for others
   - Progress callbacks
   - **Improve**: Make this the standard pattern everywhere

**Deviations Needed:**

1. **Combine bid analysis + win themes** into single request
   - Justification: Reduces API calls from 2 → 1 for strategy phase
   - Implementation: New prompt generates both together

2. **Hybrid client-orchestrated batching for bulk generation**
   - Justification: Balances speed, progress updates, and token limits
   - Implementation: Frontend controls batching, backend handles 2-3 docs per request
   - Benefits: ~N/3 requests vs N*2, live progress, token efficient

3. **Streaming content generation**
   - Justification: Better UX, immediate feedback, modern AI interaction pattern
   - Implementation: Navigate to editor immediately, stream content as generated
   - Pattern: Similar to ChatGPT-style generation

4. **Auto-start strategy generation on work package open**
   - Justification: User expects to see strategy when they open doc
   - Implementation: Frontend triggers on mount, shows loading

5. **Token limit enforcement: 64K**
   - Justification: Current code assumes 1M, actual is 64K
   - Implementation: Validate context size, smart batch sizing, truncate if needed

## Dependencies

### Previous Plans
- None - this is foundational refactor

### External Dependencies
- `@google/generative-ai` v0.24.1 (existing)
- Consider adding: `js-tiktoken` or similar for accurate token counting

## Relevant Files

### Current AI Integration Files

**Core AI Logic:**
- `/libs/ai/client.ts` - Gemini client initialization, model config
- `/libs/ai/analysis.ts:87-155` - RFT analysis, requirement extraction
- `/libs/ai/content-generation.ts:21-200` - Win themes, content generation, editor actions, selection edit
- `/libs/ai/bid-analysis.ts:26-107` - Bid/no-bid analysis with scoring
- `/libs/ai/error-parser.ts:78-134` - Rate limit detection, error parsing
- `/libs/ai/context-assembly.ts:16-89` - Context fetching, token estimation

**Prompts:**
- `/libs/ai/prompts/analyze-rft.ts:5-53` - RFT document identification prompt
- `/libs/ai/prompts/extract-requirements.ts:5-37` - Requirement extraction prompt
- `/libs/ai/prompts/generate-win-themes.ts:3-44` - Win themes generation prompt
- `/libs/ai/prompts/generate-content.ts:4-65` - Document content generation prompt
- `/libs/ai/prompts/editor-actions.ts:3-130` - 6 editor action prompts + selection edit

**API Routes:**
- `/app/api/projects/[id]/analyze/route.ts:8-169` - RFT analysis (SSE streaming)
- `/app/api/work-packages/[id]/win-themes/route.ts:14-79` - Win themes generation
- `/app/api/work-packages/[id]/bid-analysis/route.ts:14-80` - Bid analysis generation
- `/app/api/work-packages/[id]/generate-content/route.ts:14-97` - Content generation (edge runtime)
- `/app/api/work-packages/[id]/extract-requirements/route.ts:52-56` - Manual requirement extraction
- `/app/api/work-packages/[id]/editor-action/route.ts:62-64` - Legacy editor actions
- `/app/api/work-packages/[id]/selection-edit/route.ts:43-59` - Selection edit

**Utilities:**
- `/libs/utils/bulk-generation.ts:128-304` - Bulk document generation with retry logic

**Frontend Components:**
- `/components/analysis-trigger.tsx:31-94` - RFT analysis trigger with SSE
- `/components/workflow-steps/strategy-generation-screen.tsx:83-226` - Win themes, bid analysis, content gen triggers
- `/components/workflow-steps/content-editor.tsx:381-420` - Selection edit trigger
- `/components/work-package-table.tsx:122-179` - Bulk generation trigger

**Repositories:**
- `/libs/repositories/work-package-content.ts:137-236` - Save themes, bid analysis, content

### Files to Modify

**New Service Layer:**
- `/libs/ai/gemini-service.ts` (NEW) - Unified AI request executor
- `/libs/ai/request-queue.ts` (NEW) - Rate limit queue manager
- `/libs/ai/token-counter.ts` (NEW) - Accurate token counting
- `/libs/ai/prompts/combined-generation.ts` (NEW) - Combined themes + content prompt

**Refactored Services:**
- `/libs/ai/content-generation.ts` - Use new service layer
- `/libs/ai/analysis.ts` - Use new service layer
- `/libs/ai/bid-analysis.ts` - Use new service layer
- `/libs/ai/context-assembly.ts` - Add caching, better token estimation
- `/libs/ai/error-parser.ts` - Enhance with user-friendly messages

**API Routes to Refactor:**
- `/app/api/work-packages/[id]/generate/route.ts` (NEW) - Combined themes + content
- `/app/api/work-packages/[id]/win-themes/route.ts` - Update to use new service
- `/app/api/work-packages/[id]/generate-content/route.ts` - Update to use new service
- `/app/api/work-packages/[id]/bid-analysis/route.ts` - Make on-demand only
- `/app/api/work-packages/[id]/selection-edit/route.ts` - Use new service
- `/app/api/projects/[id]/analyze/route.ts` - Use new service

**Utilities:**
- `/libs/utils/bulk-generation.ts` - Refactor to use new service, add batching

**Frontend:**
- `/components/workflow-steps/strategy-generation-screen.tsx` - Auto-trigger combined strategy on mount, use new endpoints
- `/components/work-package-table.tsx` - Update bulk generation to single request

### New Files

**Service Layer:**
- `/libs/ai/gemini-service.ts` - Unified AI request executor with retry/error handling
- `/libs/ai/request-queue.ts` - Rate limit queue manager (optional, for future)
- `/libs/ai/token-counter.ts` - Accurate token counting (64K validation)
- `/libs/ai/prompts/combined-strategy.ts` - Bid analysis + win themes in one request
- `/libs/ai/prompts/batch-generation.ts` - Batch of 2-3 documents in one request

**New API Routes:**
- `/app/api/work-packages/[id]/generate-strategy/route.ts` - Strategy generation (bid + themes)
- `/app/api/projects/[id]/generate-batch/route.ts` - Batch generation (2-3 docs per request, edge runtime)

**Tests:**
- `.claude/commands/e2e/test_ai_generation.md` - E2E test for new AI flows

**Documentation Updates (not new files):**
- Update `/ai_docs/documentation/standards/coding_patterns.md` with AI integration rules
- Update `/ai_docs/documentation/CONTEXT.md` with correct 64K token limit

## Acceptance Criteria

- [ ] **Single doc strategy**: When user opens work package → auto-generates bid/no-bid + win themes in 1 request
- [ ] **Single doc content streaming**: User clicks "Generate Content" → immediately navigate to editor → content streams in real-time
- [ ] **Total single doc**: 2 requests (was 3)
- [ ] **Bulk batching**: 10 docs = ~4 batch requests (2-3 docs per batch) vs 20+ before
- [ ] **Live progress**: Bulk generation shows "Batch 2 of 4... (5/10 documents complete)"
- [ ] **Token validation**: All requests validate context fits 64K, smart batch sizing
- [ ] **Rate limit handling**: All AI routes automatically retry with exponential backoff, 5s delay between batches
- [ ] **User feedback**: Streaming content, per-batch progress, clear error messages with retry delays
- [ ] **Consistent errors**: All routes return same error format with `isRateLimitError`, `retryDelaySeconds`, `message`
- [ ] **Edge runtime**: Batch generation endpoint uses edge runtime
- [ ] **Graceful degradation**: If batch too large, automatically split and retry
- [ ] **Documentation**: AI patterns updated in existing standards files
- [ ] **Zero regression**: All existing features work identically from user perspective
- [ ] **E2E test**: AI generation flow tested end-to-end with real Gemini calls

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create Unified AI Service Layer

**Core service with retry, queue, error handling:**

- Create `/libs/ai/gemini-service.ts`:
  - `executeRequest()` function: single entry point for all Gemini calls
  - Parameters: `{ prompt, systemInstruction?, temperature?, maxRetries, requestType }`
  - Retry logic: exponential backoff (1s, 2s, 4s...), configurable max retries
  - Rate limit handling: detect, extract delay, wait, retry
  - Error parsing: use `parseGeminiError()`, return consistent format
  - Logging: all requests to console (or `ai_interactions` table)
  - Return: `{ success: boolean, data?, error?, retryDelaySeconds? }`

- Create `/libs/ai/request-queue.ts`:
  - In-memory queue for rate-limited requests
  - `enqueue(request)`: add to queue
  - `processQueue()`: process with delay between requests (configurable, default 2s)
  - Status tracking: queued, processing, completed, failed
  - Export `requestQueue` singleton

- Create `/libs/ai/token-counter.ts`:
  - Use `js-tiktoken` or similar for accurate counting
  - `countTokens(text: string): number`
  - `estimateContextTokens(context: ProjectContext): number`
  - Fallback to 4-chars-per-token if library fails

### 2. Optimize Context Assembly

**Add caching, better token estimation:**

- Update `/libs/ai/context-assembly.ts`:
  - Add in-memory cache: `contextCache = new Map<projectId, { context, timestamp }>()`
  - `assembleProjectContext()`: check cache first (TTL 5 minutes)
  - Use `token-counter.ts` for accurate token estimation
  - Add `validateContextSize()` with warning at 800K, error at 1M
  - Add `clearContextCache()` for manual invalidation
  - Return: `{ context, tokenCount, fromCache: boolean }`

### 3. Create Combined Prompts

**Strategy (bid + themes) in single request:**

- Create `/libs/ai/prompts/combined-strategy.ts`:
  - `buildStrategyPrompt(workPackage, context)`:
    - Task 1: Generate bid/no-bid analysis (6 criteria scores)
    - Task 2: Generate 3-5 win themes
    - Output format: JSON with `{ bidAnalysis: {...}, winThemes: string[] }`
  - Include: work package requirements, org docs, RFT docs
  - Emphasize: leverage org strengths, address requirements

**Batch generation (2-3 docs per batch):**

- Create `/libs/ai/prompts/batch-generation.ts`:
  - `buildBatchPrompt(workPackages[], context, instructions)`:
    - Generate bid + themes + content for 2-3 work packages in array
    - Output format: JSON array `[{ workPackageId, bidAnalysis, winThemes, content }]`
    - Include all context once (shared across all docs in batch)
    - Token estimate validation before building
    - Emphasize: each document independent, address its specific requirements
    - Example: Batch of 3 docs with shared context = single prompt

### 4. Refactor AI Service Functions

**Update all AI functions to use new service layer:**

- Update `/libs/ai/content-generation.ts`:
  - `generateWinThemes()`: use `geminiService.executeRequest()`
  - `generateDocumentContent()`: use service with streaming support
  - `generateDocumentContentStream()`: NEW - streaming version for real-time content
  - `executeEditorAction()`: use service
  - `runSelectionEdit()`: use service
  - NEW: `generateStrategy()`: bid + themes in 1 call
  - NEW: `generateBatch()`: 2-3 docs in 1 call
  - Remove duplicate error handling (service handles it)

- Update `/libs/ai/analysis.ts`:
  - `analyzeRFTDocuments()`: use service
  - `extractRequirementsForDocument()`: use service

- Update `/libs/ai/bid-analysis.ts`:
  - `generateBidAnalysis()`: use service (kept for backwards compatibility)

### 5. Create New API Routes

**Strategy generation (bid + themes):**

- Create `/app/api/work-packages/[id]/generate-strategy/route.ts`:
  - POST request
  - Validate work package exists
  - Assemble context (validate 64K)
  - Call `generateStrategy()` from service
  - Parse response: extract bid analysis + win themes
  - Save both to database
  - Return: `{ bidAnalysis, winThemes }`
  - Error handling: consistent format with retry info

**Batch generation (2-3 docs per batch):**

- Create `/app/api/projects/[id]/generate-batch/route.ts`:
  - POST request
  - **Edge runtime** (may take 30-60s per batch)
  - Body: `{ workPackageIds: string[] }` (2-3 IDs)
  - Validate all work packages exist
  - Assemble context ONCE for all docs in batch
  - Validate token limit for batch (context + all requirements)
  - If >64K: return error with suggestion to reduce batch size
  - Call `generateBatch()` from service
  - Parse response: array of results
  - Save all to database in transaction
  - Return: `{ results: [{ workPackageId, success, bidAnalysis, winThemes, content }] }`
  - Error handling:
    - Token limit exceeded → suggest smaller batch
    - Partial failure → return partial results
    - Rate limit → return retry delay

### 6. Refactor Existing API Routes

**Update all AI routes to use new service:**

- Update `/app/api/work-packages/[id]/generate-content/route.ts`:
  - **Add streaming support** via Server-Sent Events
  - Use `generateDocumentContentStream()` from service
  - Stream chunks as Gemini generates
  - Event format: `event: chunk\ndata: { text: "..." }\n\n`
  - Final event: `event: done\ndata: { fullContent: "..." }\n\n`
  - Save complete content to database on done
  - Edge runtime for long generation
  - Keep backwards compatibility: if `Accept: text/event-stream` → stream, else → full response

- Update `/app/api/work-packages/[id]/win-themes/route.ts`:
  - Use `geminiService.executeRequest()` instead of direct call
  - Remove manual rate limit detection (service handles)
  - Keep for backwards compatibility

- Update `/app/api/work-packages/[id]/bid-analysis/route.ts`:
  - Use service layer
  - Remove auto-generation logic (make on-demand only)

- Update `/app/api/work-packages/[id]/selection-edit/route.ts`:
  - Use service layer
  - Keep temperature config

- Update `/app/api/projects/[id]/analyze/route.ts`:
  - Use service layer for Gemini call
  - Keep SSE streaming logic

- Deprecate `/app/api/work-packages/[id]/editor-action/route.ts`:
  - Add deprecation notice, redirect to selection-edit

### 7. Refactor Bulk Generation Utility

**Client-orchestrated smart batching:**

- Update `/libs/utils/bulk-generation.ts`:
  - Remove: `generateSingleDocument()`, old sequential processing
  - NEW: `createSmartBatches(workPackageIds, options)`:
    - Split into optimal batches of 2-3 docs
    - Token-aware: estimate batch size based on requirements
    - Return: `string[][]` (array of batches)
    - Options: `{ maxBatchSize: 3, maxTokensPerBatch: 60000 }`

  - NEW: `bulkGenerateDocuments(projectId, workPackageIds, onProgress)`:
    - Create smart batches from work package IDs
    - Sequential batch processing:
      - For each batch: POST `/api/projects/[id]/generate-batch`
      - Wait 5 seconds between batches (rate limit safety)
      - Call `onProgress` after each batch completes
    - Progress callback: `{ phase, batchNumber, totalBatches, completedDocs, totalDocs, message }`
    - Error handling:
      - Batch too large → split in half, retry
      - Rate limit → wait + retry
      - Partial failure → continue with next batch
    - Return: `{ succeeded: Result[], failed: [{ workPackageId, error }] }`

  - Helper: `delay(ms)` for rate limit delays
  - Helper: `retryBatchWithSplit(batch)` for graceful degradation

### 8. Update Frontend Components

**Single document flow with streaming:**

- Update `/components/workflow-steps/strategy-generation-screen.tsx`:
  - **Auto-trigger on mount**: Call `/api/work-packages/[id]/generate-strategy` (lines 83-89)
  - Show loading: "Generating bid analysis and win themes..."
  - Display results: bid analysis + win themes
  - **"Generate Content" button**:
    - Immediately navigate to editor: `router.push('/work-packages/[id]/edit')`
    - Don't wait for response
  - Remove separate win themes + bid analysis buttons (now combined)
  - Progress: 2-step visual (Strategy → Content)

- Update `/components/workflow-steps/content-editor.tsx`:
  - **New: Streaming content listener**
  - On mount: check if content generation in progress
  - If generating:
    - Show indicator: "Generating content..." at top of editor
    - Open EventSource to `/api/work-packages/[id]/generate-content`
    - Listen for `chunk` events
    - Append each chunk to TipTap editor in real-time
    - On `done` event: hide indicator, enable editing
  - If content exists: show normally
  - Allow user to edit even while streaming (lock until done)

**Bulk generation flow:**

- Update `/components/work-package-table.tsx`:
  - "Generate All" button: calls `bulkGenerateDocuments()` utility
  - Show live progress:
    - "Generating batch 2 of 4..."
    - Progress bar: `(completedDocs / totalDocs) * 100`
    - "5 of 10 documents complete"
  - Display results after each batch:
    - "✓ Technical Specification, BoQ, Methodology complete"
  - Final summary: "Successfully generated 8/10 documents. 2 failed."
  - Show failed docs with error messages
  - Allow retry for failed docs individually (call single-doc endpoint)

**Analysis trigger:**

- Update `/components/analysis-trigger.tsx`:
  - Use service-layer error format
  - Show retry delay: "Rate limited. Retry in 42 seconds."

---
✅ CHECKPOINT: Steps 1-8 complete (Service layer + API refactor). Continue to step 9.
---

### 9. Update Database Save Operations

**Ensure atomic saves for combined generation:**

- Update `/libs/repositories/work-package-content.ts`:
  - `saveCombinedGeneration()`: save themes + content in single transaction
  - Upsert `work_package_content` with both fields
  - Increment `content_version`
  - Return full content record

### 10. Update Existing Documentation with AI Patterns

**Update standards with AI integration rules:**

- Update `/ai_docs/documentation/standards/coding_patterns.md`:
  - Add section: **"## AI Integration Rules"**
  - **Token limits**: 64K input limit (Gemini 2.0 Flash), validate before sending
  - **Service layer**: Always use `geminiService.executeRequest()`, never direct `model.generateContent()`
  - **Error handling**: Standard format `{ success, data?, error?, retryDelaySeconds? }`
  - **Retry logic**: Exponential backoff (1s, 2s, 4s), max 4 retries
  - **Rate limits**: Auto-detect, extract delay, retry
  - **Context assembly**: Validate 64K, truncate oldest org docs if needed
  - **Prompt patterns**: JSON output with strict format, markdown for content
  - Add to code review checklist: "AI calls use geminiService", "Context validated for 64K"

- Update `/ai_docs/documentation/CONTEXT.md`:
  - Fix token limit: Change "1M token window" to "64K token window"
  - Update AI strategy section with correct limits
  - Document new flows: 2 requests for single doc, 1 request for bulk

### 11. Add Progress Tracking Hooks

**Frontend hooks for consistent progress UI:**

- Create `/libs/hooks/useAIGeneration.ts`:
  - `useAIGeneration(endpoint, options)`:
    - State: `{ isGenerating, progress, error, data }`
    - `trigger()`: call API, handle errors, update state
    - Auto-retry on rate limit (optional)
    - Progress callbacks
  - Return: `{ trigger, isGenerating, progress, error, data, reset }`

- Update frontend components to use hook:
  - Strategy screen, bulk generation, analysis trigger

### 12. Create E2E Test

**Test AI generation flows end-to-end:**

- Create `.claude/commands/e2e/test_ai_generation.md`:
  - **Prerequisites**: Project with uploaded RFT docs, 5+ work packages

  - **Test 1**: Single document strategy auto-generation
    - Navigate to work package (opens strategy screen)
    - Verify: loading indicator shows "Generating bid analysis and win themes..."
    - Wait for completion
    - Verify: bid analysis displayed with scores
    - Verify: win themes displayed (3-5 themes)
    - Verify: no errors
    - Screenshot: completed strategy

  - **Test 2**: Streaming content generation
    - On strategy screen, click "Generate Content"
    - Verify: immediately navigated to editor
    - Verify: "Generating content..." indicator appears
    - Verify: content streams in paragraph by paragraph
    - Watch content appear in real-time
    - Wait for completion
    - Verify: indicator disappears, content fully loaded
    - Screenshot: streaming in progress, then complete

  - **Test 3**: Bulk batch generation
    - Navigate to project dashboard
    - Click "Generate All Documents" (5 work packages)
    - Verify: progress shows "Generating batch 1 of 2..."
    - Verify: progress bar updates
    - Verify: "2 of 5 documents complete" after first batch
    - Wait for all batches
    - Verify: "Successfully generated 5/5 documents"
    - Verify: all work packages have content
    - Screenshot: progress during generation, final results

  - **Test 4**: Batch error handling
    - If possible, trigger rate limit
    - Verify: clear error message with retry delay
    - Verify: retry works after delay
    - Verify: partial results saved if some batches succeed

  - **Test 5**: RFT analysis (existing flow)
    - Upload new RFT
    - Click "Analyze"
    - Verify: documents identified
    - Verify: requirements extracted
    - Screenshot: analysis results

---
✅ CHECKPOINT: Steps 9-12 complete (Database, docs, testing). Continue to step 13.
---

### 13. Run Validation Commands

**Ensure zero regressions:**

- Run all validation commands (see Validation Commands section below)
- Fix any failures
- Verify E2E test passes
- Check no rate limit errors during bulk generation
- Verify all AI features work

## Testing Strategy

### Unit Tests

**Test new service layer:**
- `gemini-service.ts`: Mock Gemini API, test retry logic, error handling, rate limit detection
- `request-queue.ts`: Test queue processing, delays, status tracking
- `token-counter.ts`: Test token counting accuracy
- `context-assembly.ts`: Test caching, token validation

**Test refactored functions:**
- All AI service functions: mock service layer, verify correct prompts built
- Repository saves: verify atomic transactions

### Edge Cases

**Rate Limiting:**
- Simulate 429 error → verify retry with delay
- Simulate multiple rate limits → verify exponential backoff
- Simulate rate limit during bulk → verify queue handles gracefully

**Token Limits:**
- Large context (>800K tokens) → verify warning
- Context >1M tokens → verify error, truncation

**Network Failures:**
- Timeout → verify retry
- Connection error → verify user-friendly message

**Invalid Responses:**
- Malformed JSON → verify retry with stricter prompt
- Empty response → verify error handling

**Concurrent Requests:**
- Multiple users generating simultaneously → verify queue handles
- Bulk generation + single generation → verify no interference

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

### 1. Install Dependencies
```bash
npm install js-tiktoken
```
**Expected**: Package installed successfully

### 2. Check TypeScript Compilation
```bash
npm run build
```
**Expected**: Zero TypeScript errors, build succeeds

### 3. Test Token Counter
```bash
# Create test script to verify token counting
node -e "const { countTokens } = require('./libs/ai/token-counter.ts'); console.log(countTokens('Hello world'));"
```
**Expected**: Returns accurate token count (e.g., 2-3 tokens)

### 4. Test Context Assembly Caching
```bash
# Check cache logic (manual verification in code)
grep -n "contextCache" /Users/varunprasad/code/prjs/tendercreator/tendercreator/libs/ai/context-assembly.ts
```
**Expected**: Shows cache implementation with TTL

### 5. Verify All AI Routes Use Service Layer
```bash
# Check no direct model.generateContent calls in routes
grep -r "model.generateContent" app/api/
```
**Expected**: Zero matches (all use geminiService instead)

### 6. Test Single Document Strategy Auto-Generation (Manual)
- Navigate to work package
- Verify: Auto-triggers strategy generation on mount
- Verify: Single API call to `/api/work-packages/[id]/generate-strategy`
- Verify: Both bid analysis and win themes appear
- Check Network tab: 1 request

### 7. Test Streaming Content Generation (Manual)
- On strategy screen, click "Generate Content"
- Verify: Immediately navigates to editor
- Verify: Content streams in paragraph by paragraph
- Verify: "Generating..." indicator shows, then hides when complete
- Check Network tab: SSE connection to `/api/work-packages/[id]/generate-content`

### 8. Test Bulk Batch Generation (Manual)
- Navigate to project with 10 work packages
- Click "Generate All"
- Verify: Progress shows "Batch 1 of 4..." then updates
- Verify: "3 of 10 documents complete" after first batch
- Verify: No "too many requests" errors
- Check Network tab: ~4 requests to `/api/projects/[id]/generate-batch`
- Total time: Should be ~90-120 seconds

### 9. Test Batch Error Handling (Manual)
- If possible, trigger rate limit during bulk generation
- Verify: Clear error message with retry delay
- Verify: Automatic retry after delay
- Verify: Completed batches saved even if later batch fails

### 10. Run E2E Test
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_ai_generation.md`
**Expected**: All test steps pass with screenshots

### 11. Check Documentation
```bash
cat ai_docs/documentation/standards/ai-integration-patterns.md | head -50
```
**Expected**: Shows AI usage guidelines and patterns

### 12. Verify No Regressions
- Test RFT analysis → verify documents identified
- Test win themes generation (legacy route) → verify works
- Test bid analysis → verify works (on-demand)
- Test editor selection edit → verify works
- Test export → verify generates correctly

# Implementation log created at:
# specs/ai-pipeline-refactor/ai-pipeline-refactor_implementation.log

## Definition of Done
- [x] All acceptance criteria met
- [x] All validation commands pass with expected output
- [x] No regressions (existing tests still pass)
- [x] Patterns followed (documented in Pattern Analysis)
- [x] E2E test created and passing (if UI change)

## Notes

**Request Reduction Math:**
- **Before (single doc)**: Open work package = 2 API calls (win themes + bid analysis) → user clicks generate = 1 call → **3 total**
- **After (single doc)**: Open work package = 1 call (strategy combined) → user clicks generate = 1 call (streaming) → **2 total**
- **Before (bulk 10 docs)**: Sequential = 20 calls (10 themes + 10 content) + optional 10 bid = **20-30 calls**
- **After (bulk 10 docs)**: Client-orchestrated batching = **4 batches** (3+3+3+1 docs)
- **Savings**: Single doc 33% reduction, bulk 80-87% reduction (4 calls vs 20-30)

**Time Estimates:**
- Single doc strategy: ~10-15 seconds
- Single doc content (streaming): ~20-30 seconds (but user sees progress)
- Bulk 10 docs: ~90-120 seconds (4 batches * ~25s + delays) vs 180+ seconds before

**Context Optimization:**
- Batch generation: context assembled once per batch (not per doc)
- Smart batching: 2-3 docs per batch based on token estimates
- 64K validation prevents token limit errors
- Truncation strategy: remove oldest org docs first if needed
- Example: 3 docs with shared context = single 40K prompt vs 3 separate 25K prompts

**Batching Strategy:**
- Fixed batch size: 3 docs (simple, reliable)
- If batch exceeds 64K: split in half automatically
- 5 second delay between batches (rate limit safety)
- Graceful degradation: batch fails → retry individually

**Backwards Compatibility:**
- Keep legacy routes (`/win-themes`, `/bid-analysis`, `/generate-content`) for backwards compatibility
- Update strategy screen to use new `/generate-strategy` endpoint
- Bulk generation uses new `/generate-batch` endpoint with client orchestration
- Deprecate old sequential bulk logic

**Streaming Benefits:**
- User engagement: sees content appear like ChatGPT
- Perceived performance: immediate navigation to editor
- Can cancel generation mid-stream
- Better error recovery: partial content saved

**Rate Limit Strategy:**
- Queue ensures 2s delay between requests (configurable)
- Exponential backoff: 1s, 2s, 4s, 8s (max 4 retries)
- Default delay from Gemini error: use their `retryDelay`
- User sees: "Processing... (queued)" → clear they're waiting

**Future Optimizations (Post-MVP):**
- Streaming for bulk generation (show each doc as it completes)
- Better progress tracking during long bulk requests
- Parallel processing if token limits allow (split into 2-3 batches)
- Redis-based queue for multi-instance deployments

## Research Documentation

No external research needed - refactoring existing codebase with known patterns.

**Key References:**
- Gemini API docs: Rate limits, retry logic
- Current implementation analysis (from exploration agents)
- PRD AI workflows section

## Unresolved Questions

**1. Optimal Batch Size**
- Fixed at 3 docs per batch?
- Or dynamic based on requirement complexity?
- Start with 3, optimize later?

**2. Token Truncation Strategy**
- If context > 64K, remove oldest org docs first?
- Or prioritize by doc category (certifications > case studies)?
- Or fail with clear error asking user to reduce docs?

**3. Batch Failure Recovery**
- If 1 of 3 docs in batch fails, Gemini may return partial JSON
- Parse partial response or treat as complete failure?
- Retry entire batch or just failed doc?

**4. Streaming Content Save**
- Save content to database incrementally as streaming?
- Or only save complete content at end?
- Risk: user closes tab mid-stream loses content?

**5. Rate Limit Delay Between Batches**
- 5 seconds sufficient?
- Or should be configurable?
- Learn from Gemini error delays dynamically?
