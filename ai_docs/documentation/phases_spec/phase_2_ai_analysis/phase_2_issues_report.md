# Phase 2 RFT Analysis - Issues Report

## Executive Summary

This report documents all issues encountered during Phase 2 E2E testing, analyzing root causes and patterns to prevent recurrence in future phases. Total issues identified: **7 major issues** requiring code fixes.

## Issue Categories

### 1. Database Schema Mismatches (3 issues)
### 2. API Framework Compatibility (2 issues)
### 3. External Service Integration (2 issues)

---

## Detailed Issue Analysis

### Issue #1: Project Status Enum Mismatch

**Severity:** Critical
**Component:** Database Schema / Repository Layer
**Files Affected:**
- `libs/repositories/projects.ts:33`
- `app/api/projects/route.ts:77`
- Database enum `project_status`

**Problem:**
Code used outdated status values (`'draft'`, `'active'`) while Phase 2 spec required new values (`'setup'`, `'analysis'`, `'in_progress'`).

**Root Cause:**
- Database schema migration was not created when Phase 2 spec changed status enum values
- Repository functions and API routes were updated but database enum was not
- No validation between TypeScript types and actual database enum values

**Error Message:**
```
Error creating project: invalid input syntax for enum project_status: "draft"
```

**Fix Applied:**
1. Created migration `migrations/phase_2/001_update_project_status.sql`:
   - Added new enum values: `'setup'`, `'analysis'`, `'in_progress'`
   - Migrated existing data: `'draft'` → `'setup'`, `'active'` → `'in_progress'`
2. Updated default status in `libs/repositories/projects.ts:33` from `'draft'` to `'setup'`
3. Updated `app/api/projects/route.ts:77` to use `'setup'`

**Pattern Identified:**
- **Schema-Code Drift**: When specifications change enum values, both code AND database must be updated atomically
- **Missing Migration Process**: No systematic process for creating database migrations when enums change

**Prevention Strategy:**
1. When changing enum types in TypeScript, immediately create corresponding database migration
2. Use database-first approach: update schema first, then update code
3. Add automated tests that validate TypeScript enum types match database enum values
4. Create checklist: "Enum change → Database migration → Code update → Test"

---

### Issue #2: Work Package Status Enum - Incomplete Fix

**Severity:** Critical
**Component:** Repository Layer
**Files Affected:**
- `libs/repositories/work-packages.ts:56`
- `app/api/projects/[id]/analyze/route.ts:117`

**Problem:**
Status enum had inconsistent values. Interface defined `'pending' | 'in_progress' | 'review' | 'completed'` but code used `'not_started'`.

**Root Cause:**
- Initial fix changed analyze route (line 117) from `'not_started'` to `'pending'`
- Missed the DEFAULT value in `createWorkPackage` function (line 56)
- Search-and-replace was incomplete - only fixed explicit usage, not default values

**Error Message:**
```
invalid input value for enum work_package_status: "not_started"
```

**Timeline:**
- First fix: Updated analyze route line 117
- Missed: Default value in createWorkPackage line 56
- Second fix required after E2E test triggered the manual document creation path

**Pattern Identified:**
- **Incomplete Refactoring**: Changed enum value in some places but not all
- **Hidden Defaults**: Default values in function parameters are easy to miss during refactoring
- **Code Path Coverage**: Different execution paths (analysis vs manual creation) hit different code

**Prevention Strategy:**
1. When changing enum values, use global search for ALL occurrences (not just in current file)
2. Search patterns should include:
   - String literals: `'not_started'`
   - Default parameters: `status || 'not_started'`
   - Comments mentioning the old value
3. Add TypeScript exhaustiveness checking for enum values
4. Run E2E tests that exercise ALL code paths (auto-analysis AND manual creation)

---

### Issue #3: Database Column Name Mismatch

**Severity:** High
**Component:** Repository Layer / Database Query
**Files Affected:**
- `app/api/projects/[id]/analyze/route.ts:42`
- `libs/repositories/work-packages.ts:79`

**Problem:**
Code queried wrong column names that didn't exist in database schema.

**Instances:**
1. **Project Documents**: Queried `file_name` but column is `name`
   - Location: `app/api/projects/[id]/analyze/route.ts:42`
   - Query: `.select('id, file_name, content_text')`

2. **Users Table**: Queried `full_name` but column is `name`
   - Location: `libs/repositories/work-packages.ts:79`
   - Query: `users!work_packages_assigned_to_fkey(id, email, full_name)`

**Root Cause:**
- Schema changed but queries weren't updated
- No type safety between Supabase queries and actual database schema
- Manual string-based queries prone to typos

**Pattern Identified:**
- **Schema Evolution Tracking**: Column renames not tracked across all queries
- **Weak Type Safety**: String-based query selects don't catch column name errors at compile time
- **Join Query Complexity**: Foreign key joins especially prone to errors (users.full_name vs users.name)

**Prevention Strategy:**
1. Use Supabase's generated TypeScript types for all queries
2. When renaming columns, grep for ALL occurrences of old column name
3. Add integration tests that validate actual query results
4. Consider using TypeScript's `satisfies` operator to validate query selects
5. Document schema changes in migration files with "BREAKING CHANGE" markers

---

### Issue #4: Next.js 15 Async Params - Framework Migration

**Severity:** High
**Component:** API Routes / Framework Compatibility
**Files Affected:**
- `app/api/projects/[id]/route.ts`
- `app/api/projects/[id]/documents/route.ts`
- `app/api/projects/[id]/analyze/route.ts`
- `app/api/projects/[id]/documents/[docId]/route.ts`
- Multiple other dynamic route files

**Problem:**
Next.js 15 changed `params` from synchronous object to async Promise, breaking all dynamic routes.

**Error Message:**
```
Route "/api/projects/[id]" used `params.id`. `params` should be awaited before using its properties
```

**Root Cause:**
- Next.js 15 breaking change: Dynamic route params are now async
- Upgraded framework version without reviewing breaking changes
- Old pattern: `params: { id: string }`
- New pattern: `params: Promise<{ id: string }>`

**Code Changes Required:**
```typescript
// OLD (Next.js 14)
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id
}

// NEW (Next.js 15)
async function handleGET(
  request: NextRequest,
  routeContext: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await routeContext.params
}
```

**Pattern Identified:**
- **Framework Upgrade Impact**: Major version upgrades have breaking changes
- **Systematic Refactoring Needed**: Same pattern repeated across ~8 route files
- **Type System Help**: TypeScript caught this, but only at runtime

**Prevention Strategy:**
1. Review framework release notes BEFORE upgrading major versions
2. Search codebase for patterns that breaking changes affect
3. Create codemod scripts for systematic refactoring
4. Test at least one instance of each pattern before mass refactoring
5. Use incremental adoption: update one file, test, then update others

---

### Issue #5: Gemini API Model Version Incompatibility

**Severity:** Critical
**Component:** External Service Integration
**Files Affected:**
- `libs/ai/client.ts:6`

**Problem:**
Google Gemini API model name `gemini-1.5-flash` not available in API version v1beta.

**Error Message:**
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent:
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

**Root Cause:**
- Model naming conventions changed in Gemini API
- Using outdated model name from examples/documentation
- No API version pinning or model availability validation

**Fix Applied:**
Changed from `gemini-1.5-flash` to `gemini-2.0-flash-exp`

**Impact:**
- Initial RFT analysis completely failed (returned 200 but no work packages created)
- Took debugging through SSE stream logs to identify issue
- Error was caught in try-catch and returned as SSE event, making it less visible

**Pattern Identified:**
- **External API Dependency**: No validation that model exists before making calls
- **Silent Failures**: Error handling pattern masked the real issue (200 response despite failure)
- **API Version Coupling**: Model availability depends on API version endpoint

**Prevention Strategy:**
1. Validate external service dependencies during application startup
2. Add health check endpoint that tests Gemini API connectivity
3. Log external API errors prominently (not just in catch blocks)
4. Pin API versions explicitly in configuration
5. Add fallback models in case primary model unavailable
6. Monitor external API status pages and deprecation notices

---

### Issue #6: Text Extraction File Upload Compatibility

**Severity:** Medium
**Component:** External Service Integration
**Files Affected:**
- `libs/ai/extraction.ts:20`

**Problem:**
Gemini file upload API had compatibility issues with certain file types, causing 404 errors for text/plain files.

**Error Message:**
```
Text extraction error: Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent:
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

**Root Cause:**
- Uploading text/plain files to Gemini File API when direct reading would work
- Unnecessary API call for simple text files
- Same model version issue compounded the problem

**Fix Applied:**
Added early return for text/plain files:
```typescript
if (mimeType === 'text/plain') {
  return fileBuffer.toString('utf-8')
}
```

**Pattern Identified:**
- **Over-Engineering**: Using external API for tasks that can be done locally
- **Cost Optimization**: Unnecessary API calls waste resources and introduce failure points
- **Type-Specific Handling**: Different file types need different processing strategies

**Prevention Strategy:**
1. Handle simple cases locally before calling external APIs
2. Add type-based routing for file processing (text → local, PDF → API, etc.)
3. Implement graceful degradation: if API fails, fall back to basic extraction
4. Add unit tests for each file type handling path
5. Document which file types require external API vs local processing

---

### Issue #7: Timestamp Validation - Empty String Handling

**Severity:** Medium
**Component:** Data Validation / Type Coercion
**Files Affected:**
- `libs/repositories/projects.ts:51-53`
- `app/api/projects/route.ts`

**Problem:**
Frontend sent empty strings for optional date fields, but Postgres expected NULL for empty timestamps.

**Error Message:**
```
invalid input syntax for type timestamp with time zone: ""
```

**Root Cause:**
- Frontend form sends empty string `""` for unfilled date inputs
- Backend passed empty string directly to database
- Postgres timestamp type doesn't accept empty strings (only NULL or valid timestamp)
- Missing data normalization layer between frontend and database

**Fix Applied:**
```typescript
deadline: data.deadline || null,
instructions: data.instructions || null,
client_name: data.client_name || null,
```

**Pattern Identified:**
- **Frontend-Backend Contract**: Frontend sends `""` for empty, backend expects `null`
- **Type Coercion Boundary**: Need normalization layer for empty values
- **Optional Field Handling**: Every optional field needs empty string → null conversion

**Prevention Strategy:**
1. Create centralized data normalization utility:
   ```typescript
   function normalizeOptionalString(value: string | undefined): string | null {
     return value && value.trim() !== '' ? value : null
   }
   ```
2. Apply normalization in API layer before repository calls
3. Add validation middleware that enforces data contracts
4. Document frontend-backend data contract explicitly
5. Consider using Zod schemas to validate and transform input data
6. Add integration tests that test empty string handling

---

## Cross-Cutting Patterns

### Pattern 1: Enum Management
**Occurrences:** Issues #1, #2
**Root Problem:** No systematic process for enum changes
**Solution:**
1. Create enum change checklist:
   - [ ] Update TypeScript type definition
   - [ ] Create database migration
   - [ ] Update all default values
   - [ ] Update all switch statements
   - [ ] Search for string literals
   - [ ] Add test cases for new enum values
2. Consider code generation: TypeScript → SQL migration

### Pattern 2: Schema-Code Synchronization
**Occurrences:** Issues #1, #3
**Root Problem:** Manual synchronization between database schema and code
**Solution:**
1. Use Supabase CLI to generate types: `supabase gen types typescript`
2. Add pre-commit hook to regenerate types if migrations changed
3. Import generated types in all repository files
4. Use branded types to prevent raw strings in queries

### Pattern 3: External API Resilience
**Occurrences:** Issues #5, #6
**Root Problem:** Tight coupling to external service availability
**Solution:**
1. Add circuit breaker pattern for external API calls
2. Implement retry logic with exponential backoff
3. Add fallback strategies (e.g., skip extraction if API down)
4. Monitor external service health proactively
5. Add timeout configuration for all external calls

### Pattern 4: Framework Migration Preparedness
**Occurrences:** Issue #4
**Root Problem:** Reactive rather than proactive framework upgrades
**Solution:**
1. Read framework upgrade guides BEFORE upgrading
2. Test in staging environment first
3. Create migration plan with affected files list
4. Use codemods for systematic refactoring
5. Update one subsystem at a time, not entire codebase

### Pattern 5: Frontend-Backend Contract
**Occurrences:** Issue #7
**Root Problem:** Implicit data contracts between frontend and backend
**Solution:**
1. Use shared TypeScript types between frontend/backend
2. Add runtime validation with Zod or similar
3. Create explicit data transformation layer
4. Document expected data formats in API spec
5. Add contract tests that validate both sides

---

## Testing Gaps Identified

### 1. Missing Unit Tests
- Enum value handling in repository functions
- Empty string normalization
- Default value assignment

### 2. Missing Integration Tests
- Database query results validation
- Foreign key join correctness
- Column name existence

### 3. Missing E2E Test Coverage
- All code paths (not just happy path)
- Error scenarios (empty strings, missing data)
- External API failure scenarios

### 4. Missing Contract Tests
- Frontend-backend data contracts
- Database schema vs TypeScript types

---

## Recommendations for Future Phases

### Immediate Actions (Phase 3+)

1. **Create Type Safety Infrastructure**
   - Generate Supabase types before starting development
   - Use branded types for IDs and enums
   - Add Zod schemas for all API inputs/outputs

2. **Establish Migration Workflow**
   - Enum change → Migration first → Code second
   - Document breaking changes in migration files
   - Test migrations on copy of production data

3. **Add Validation Layers**
   - Input validation middleware for all API routes
   - Data normalization before database calls
   - Output validation before sending responses

4. **Improve Error Visibility**
   - Log all external API errors prominently
   - Add structured logging with context
   - Create error monitoring dashboard

5. **Framework Upgrade Process**
   - Review breaking changes before upgrade
   - Create upgrade plan with affected files
   - Test systematically (one subsystem at a time)

### Long-term Improvements

1. **Automated Testing**
   - Add pre-commit hooks for type generation
   - Add CI checks for schema-type sync
   - Add integration tests for all API routes

2. **Code Quality Tools**
   - Add ESLint rules for common pitfalls
   - Add database linting (sqlfluff)
   - Add architecture decision records (ADRs)

3. **Documentation**
   - Document data contracts explicitly
   - Create migration playbook
   - Document external service dependencies

4. **Monitoring & Observability**
   - Add health check endpoints
   - Monitor external service availability
   - Track error rates by category

---

## Metrics

- **Total Issues:** 7
- **Critical Severity:** 3 (enum mismatches, Gemini API)
- **High Severity:** 2 (column names, Next.js params)
- **Medium Severity:** 2 (text extraction, timestamp validation)
- **Time to Identify:** Varied (immediate for compile errors, delayed for runtime errors)
- **Time to Fix:** 5-30 minutes per issue
- **Total Debugging Time:** ~2 hours
- **Code Files Modified:** 12
- **Migration Files Created:** 1

---

## Conclusion

Phase 2 testing revealed **systemic patterns** rather than isolated bugs:

1. **Schema Evolution Management** - Need robust process for database changes
2. **Type Safety Gaps** - Manual synchronization between schema and code is error-prone
3. **External Service Resilience** - Tight coupling causes cascading failures
4. **Framework Migration Preparedness** - Reactive upgrades cause widespread issues
5. **Data Contract Enforcement** - Implicit contracts lead to validation errors

**Key Insight:** Most issues were **preventable** with:
- Better tooling (type generation, linting)
- Systematic processes (enum change checklist, migration workflow)
- Proactive validation (compile-time checks, runtime validation)

**Success Indicator:** If Phase 3 encounters significantly fewer schema/type/enum issues, the patterns have been successfully encoded.

---

## Appendix: Code Pattern Library

### Pattern: Safe Enum Change

```typescript
// 1. Update TypeScript type
export type ProjectStatus = 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'

// 2. Create migration FIRST
-- migrations/xxx_update_enum.sql
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'new_value';

// 3. Update all default values
status: data.status || 'setup', // Default value

// 4. Update all usages
const status: ProjectStatus = 'setup' // Explicit usage

// 5. Test both code paths
- Auto-creation path
- Manual creation path
```

### Pattern: Safe Database Query

```typescript
// Generate types
import { Database } from '@/types/supabase'

// Use generated types
const { data, error } = await supabase
  .from('projects')
  .select<'*', Database['public']['Tables']['projects']['Row']>('*')
```

### Pattern: Data Normalization

```typescript
function normalizeProjectInput(input: CreateProjectInput): CreateProjectData {
  return {
    ...input,
    deadline: input.deadline?.trim() || null,
    instructions: input.instructions?.trim() || null,
    client_name: input.client_name?.trim() || null,
  }
}
```

---

**Report Generated:** 2025-11-05
**Phase:** Phase 2 - AI-Powered RFT Analysis
**Test Duration:** ~3 hours (including fixes)
**Status:** ✅ All issues resolved, E2E test passing
