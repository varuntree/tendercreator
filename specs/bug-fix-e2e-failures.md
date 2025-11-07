# Bug: E2E Test Critical Failures - Content Generation & Schema Issues

## Bug Description

Three critical issues blocking E2E test completion:

**Issue 1: Content streaming endpoint fails**
- GET returns 405 Method Not Allowed
- POST with streaming returns 400 Bad Request
- Users cannot generate content after strategy completion

**Issue 2: Database schema out of sync**
- `start_date` column missing from `projects` table (code references it, schema doesn't have it)
- `bid_analysis` column errors suggest schema cache issues
- "Win themes must be generated first" error when work package content should exist

**Issue 3: Content initialization logic broken**
- `saveGeneratedContent()` requires existing content record
- Combined strategy generation may not create content record properly
- Race condition between bid_analysis/win_themes saves

## Problem Statement

E2E tests fail at content generation step due to:
1. Missing/non-existent API endpoint (`generate-strategy` confirmed exists, route issue suspected)
2. Database schema drift between migrations and code
3. Content record initialization order issues in bulk generation flow

## Solution Statement

1. **Fix generate-content route**: Verify route registration, check HTTP method configuration
2. **Sync database schema**: Add missing `start_date` column, verify bid_analysis column exists
3. **Fix content initialization**: Use atomic `saveCombinedGeneration()` instead of separate calls, ensure content record created before content save

## Steps to Reproduce

### Issue 1:
1. Complete strategy generation (bid + themes)
2. Click "Generate Content" button
3. Observe: 405 or 400 error, no content streams

### Issue 2:
1. Create new project via UI
2. Observe: 500 error "Could not find the 'start_date' column"
3. Run bulk generation
4. Observe: "bid_analysis column not found" errors

### Issue 3:
1. Use combined strategy endpoint
2. Then call content generation
3. Observe: "Work package content not found - win themes must be generated first"

## Root Cause Analysis

**Issue 1 Root Cause:**
- Route file exists at `/app/api/work-packages/[id]/generate-content/route.ts`
- Only exports `POST` function (no GET)
- Client may be making GET request first or wrong Accept header
- Edge runtime configuration may affect route

**Issue 2 Root Cause:**
- Code in `libs/repositories/projects.ts:44` references `start_date` field
- Migration `001_initial_schema.sql` never created `start_date` column
- Projects table only has: `deadline`, not `start_date`
- Schema drift: code added field without migration

**Issue 3 Root Cause:**
- `saveGeneratedContent()` (line 178) requires existing content record
- `saveBidAnalysis()` and `saveWinThemes()` both create content record if not exists
- Race condition: if both run simultaneously, one may fail
- Batch generation may call `saveGeneratedContent()` before strategy endpoints create record
- `saveCombinedGeneration()` exists but not used in batch generation flow

## Relevant Files

### Schema Issues
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/migrations/phase_1/001_initial_schema.sql` - Missing `start_date` column in projects table (line 40-54)
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/libs/repositories/projects.ts` - References non-existent `start_date` field (lines 31, 44, 63)

### Content Generation Route
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/app/api/work-packages/[id]/generate-content/route.ts` - Main content generation endpoint, only POST method
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/components/workflow-steps/content-editor.tsx` - Client-side streaming consumer

### Content Save Logic
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/libs/repositories/work-package-content.ts` - Lines 170-182 (`saveGeneratedContent`), 207-236 (`saveBidAnalysis`), 137-165 (`saveWinThemes`), 242-276 (`saveCombinedGeneration`)
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/app/api/work-packages/[id]/generate-strategy/route.ts` - Calls separate save functions (lines 56-57)

### Batch Generation
- `/Users/varunprasad/code/prjs/tendercreator/tendercreator/app/api/projects/[id]/generate-batch/route.ts` - May not properly initialize content records before save

## Step by Step Tasks

### Step 1: Add missing start_date column to projects table

- Create migration file `migrations/phase_2/002_add_start_date_to_projects.sql`
- Add `start_date TIMESTAMPTZ` column to projects table
- Add comment documenting the field
- Run migration against Supabase database

### Step 2: Verify bid_analysis column exists and is accessible

- Check if migration `phase_2/001_add_bid_analysis.sql` was applied
- If not applied, run it against database
- Verify column type is `JSONB DEFAULT NULL`
- Test query: `SELECT bid_analysis FROM work_package_content LIMIT 1;`

### Step 3: Fix generate-content route HTTP method handling

- Review `/app/api/work-packages/[id]/generate-content/route.ts`
- Confirm only POST method exported (line 14)
- Check if client makes GET request before POST
- Add explicit error response for non-POST methods if needed
- Verify `Accept: text/event-stream` header handling (line 36)

### Step 4: Fix content record initialization in generate-strategy endpoint

- Update `/app/api/work-packages/[id]/generate-strategy/route.ts`
- Replace separate `saveBidAnalysis()` and `saveWinThemes()` calls (lines 56-57)
- Use single `saveCombinedGeneration()` call with both data fields
- This ensures atomic content record creation with all fields

### Step 5: Fix saveGeneratedContent to handle missing content record

- Update `/libs/repositories/work-package-content.ts` line 170-182
- Change `saveGeneratedContent()` to use upsert pattern like other save functions
- If content record doesn't exist, create it with content field
- If exists, update content field
- This prevents "must be generated first" errors

### Step 6: Verify batch generation uses proper save flow

- Review `/app/api/projects/[id]/generate-batch/route.ts`
- Ensure it uses `saveCombinedGeneration()` for atomic saves
- Check that content records initialized before content save
- Verify error handling for partial batch failures

### Step 7: Run validation commands

- Start dev server: `npm run dev`
- Run E2E Test 1: Single document strategy auto-generation
- Run E2E Test 2: Streaming content generation
- Run E2E Test 3: Bulk batch generation
- Verify all tests pass without errors
- Check Network tab for correct status codes (200, not 400/405)
- Verify database has all expected data saved

## Validation Commands

Execute every command to validate bug is fixed:

```bash
# 1. Check if migrations applied
ls -la migrations/phase_2/
cat migrations/phase_2/002_add_start_date_to_projects.sql

# 2. Start dev server
npm run dev

# 3. Create test project (via UI or API)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","client_name":"Test Client"}'
# Expected: 200 OK (not 500 "start_date" error)

# 4. Test strategy generation endpoint
curl -X POST http://localhost:3000/api/work-packages/[TEST_WP_ID]/generate-strategy
# Expected: 200 OK with bidAnalysis and winThemes

# 5. Test content generation endpoint
curl -X POST http://localhost:3000/api/work-packages/[TEST_WP_ID]/generate-content \
  -H "Accept: text/event-stream"
# Expected: Streaming response (not 400/405)

# 6. Verify database has content record with all fields
# (Use Supabase dashboard or SQL)
# SELECT * FROM work_package_content WHERE work_package_id = '[TEST_WP_ID]';
# Expected: Row with bid_analysis, win_themes, and content populated

# 7. Run full E2E test suite
# Follow test plan in .claude/commands/e2e/test_ai_generation.md
# Expected: All 6 tests pass
```

## Notes

**Schema Drift Prevention:**
- Always create migration when adding DB columns
- Don't reference columns in code before migration applied
- Use TypeScript types that match DB schema exactly

**Content Record Lifecycle:**
- Strategy generation creates record with bid_analysis + win_themes
- Content generation updates existing record with content field
- Batch generation uses atomic `saveCombinedGeneration()` to avoid race conditions
- All save functions use upsert pattern (check exists, create or update)

**Edge Runtime Considerations:**
- `/generate-content/route.ts` uses `export const runtime = 'edge'`
- This bypasses Vercel 10s timeout for streaming
- Ensure streaming endpoint properly configured for SSE

**Migration Order:**
- Phase 1: Core schema
- Phase 2: Status enums, bid_analysis column, start_date column (this fix)
- Always apply migrations in order

**Known Limitations After Fix:**
- Rate limiting still applies (429 errors expected under heavy load)
- Token limits still enforced (64K context limit)
- These are expected behaviors, not bugs
