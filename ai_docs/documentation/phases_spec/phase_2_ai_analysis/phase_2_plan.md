# Phase: AI Analysis & Document Decomposition

## Phase Description

Phase 2 implements AI-powered RFT analysis that automatically identifies all required submission documents from uploaded tender files. When a user clicks "Analyze RFT", Gemini 2.5 Flash analyzes all project documents to extract document types and their associated requirements. The system streams progress in real-time, showing each identified document as it's discovered. Results are immediately written to the work_packages table and displayed in an interactive Document Requirements Matrix UI where users can review, validate, edit requirements, and manually add additional documents. This phase transforms raw RFT uploads into structured work packages ready for team assignment in Phase 3.

## Phase Objectives

- Implement "Analyze RFT" trigger button on project detail page with streaming progress UI
- Create Gemini prompt for document identification that returns structured JSON with document types and requirements
- Build streaming API endpoint that progressively returns identified documents
- Parse AI response and create work_packages records with requirements JSONB
- Build Document Requirements Matrix UI showing all identified documents in table format
- Enable requirement expansion/editing per document type
- Implement manual document addition with AI-assisted requirement extraction
- Handle analysis errors with auto-retry and manual fallback
- Create E2E test with sample RFT fixture validating full analysis flow

## Problem Statement

After Phase 1, users can upload RFT documents but have no way to understand what deliverables are required. The RFT content sits as extracted text in the database, unused. Users need:
- **Automated document discovery** - AI should identify all 5-15+ submission documents from RFT
- **Requirements extraction** - Each document needs specific requirements pulled from RFT with page references
- **User validation** - AI may miss documents or hallucinate, needs human review before proceeding
- **Manual additions** - Users must be able to add custom documents not found by AI
- **Real-time feedback** - Analysis takes time, users need progress visibility

Without this phase, users cannot proceed to content generation - they don't know WHAT documents to create.

## Solution Statement

Build a streaming AI analysis system using Gemini 2.5 Flash that processes all project RFT documents and returns a structured list of required submission documents with extracted requirements. Create an API endpoint (`/api/projects/[id]/analyze`) that streams responses using Server-Sent Events, allowing real-time progress updates in the UI. Parse the JSON response to create work_package records immediately, enabling users to see results progressively. Build an interactive Document Requirements Matrix using shadcn/ui Table component where users can expand rows to view/edit requirements, delete incorrect documents, and add new ones. For manual additions, trigger a focused AI search of the RFT to find relevant requirements. Implement comprehensive error handling with automatic retry on JSON parse failures and manual fallback UI. Create realistic test fixture (sample construction RFT) in test_fixtures/ and E2E test validating the complete analysis workflow.

## Dependencies

### Previous Phases
**Phase 1 (Core Schema & Project Structure)** - Required completed features:
- `projects` table with status field
- `project_documents` table with content_text extracted
- Project detail page (`/projects/[id]`) where analysis triggers
- Gemini client configured in `libs/ai/client.ts`
- Repository pattern established in `libs/repositories/`
- API utilities for standard responses

### External Dependencies
- **Gemini 2.5 Flash API** - Already configured in Phase 1
- **Supabase** - work_packages table from Phase 1 schema
- **npm packages** - All installed in Phase 1 (no new dependencies)

## Relevant Files

**Existing files from Phase 1:**
- `libs/ai/client.ts` - Gemini client (use for analysis)
- `libs/repositories/projects.ts` - Project repository (add updateProjectStatus)
- `libs/api-utils/index.ts` - API wrappers (extend for streaming)
- `app/(dashboard)/projects/[id]/page.tsx` - Project detail page (add analysis trigger)
- `ai_docs/documentation/standards/system-architecture.md` - Streaming patterns
- `ai_docs/documentation/standards/integration-contracts.md` - AI prompt patterns
- `ai_docs/documentation/standards/data-schema.sql` - work_packages structure

### New Files

**Repositories** (`libs/repositories/`):
- `libs/repositories/work-packages.ts` - Work package CRUD operations
  - `createWorkPackage(supabase, data)` - Insert work package with requirements
  - `listWorkPackages(supabase, projectId)` - Get all packages for project
  - `getWorkPackage(supabase, id)` - Single work package
  - `updateWorkPackage(supabase, id, data)` - Edit requirements, document type
  - `deleteWorkPackage(supabase, id)` - Remove work package

**AI Prompts** (`libs/ai/prompts/`):
- `libs/ai/prompts/analyze-rft.ts` - Main analysis prompt template
- `libs/ai/prompts/extract-requirements.ts` - Manual document requirement extraction

**AI Services** (`libs/ai/`):
- `libs/ai/analysis.ts` - Core analysis functions
  - `analyzeRFTDocuments(projectId, rftTexts, instructions?)` - Main analysis
  - `extractRequirementsForDocument(rftTexts, documentType)` - Manual extraction
  - `parseAnalysisResponse(text)` - JSON parsing with validation

**API Routes** (`app/api/`):
- `app/api/projects/[id]/analyze/route.ts` - POST streaming analysis endpoint
- `app/api/work-packages/route.ts` - POST create manual work package
- `app/api/work-packages/[id]/route.ts` - GET, PUT, DELETE work package
- `app/api/work-packages/[id]/extract-requirements/route.ts` - POST AI-assisted requirements

**UI Components** (`components/`):
- `components/analysis-trigger.tsx` - "Analyze RFT" button with streaming progress
- `components/document-requirements-matrix.tsx` - Main table showing all work packages
- `components/requirement-row.tsx` - Expandable row with requirements list
- `components/requirement-editor.tsx` - Edit individual requirements
- `components/add-document-dialog.tsx` - Modal for manual document addition
- `components/streaming-progress.tsx` - Animated progress display during analysis

**Test Fixtures** (`test_fixtures/`):
- `test_fixtures/sample_rft_construction.pdf` - Sample construction RFT (5-10 pages)
- `test_fixtures/sample_rft_construction.txt` - Plain text version for testing
- `test_fixtures/README.md` - Fixture documentation

**E2E Test Commands** (`.claude/commands/e2e/`):
- `.claude/commands/e2e/test_phase_2_analysis.md` - Complete analysis workflow test

**Phase Documentation**:
- `ai_docs/documentation/phases_spec/phase_2_ai_analysis/phase_2_implementation.log` - Implementation tracking

## Acceptance Criteria

✓ "Analyze RFT" button appears on project detail page (only when status = 'setup')
✓ Clicking analyze changes project status to 'analysis' and shows streaming progress UI
✓ Progress displays real-time updates as documents are identified (e.g., "Found: Technical Specification")
✓ Gemini identifies 5-15 documents from RFT with document types and descriptions
✓ Each identified document has 5-8 extracted requirements with priority and source reference
✓ Work packages are created in database immediately as analysis progresses
✓ After analysis completes, project status changes to 'in_progress'
✓ Document Requirements Matrix displays all identified work packages in table format
✓ Table shows: Document Type, Requirements Count, Assigned To (empty), Status (not_started)
✓ Clicking expand icon on row shows full requirements list for that document
✓ Each requirement displays: text, priority badge (mandatory/optional), source reference
✓ User can edit requirement text inline
✓ User can delete individual requirements
✓ User can delete entire work package (row)
✓ User can add new requirement to existing work package
✓ "Add Custom Document" button opens dialog for manual document addition
✓ Manual addition dialog: enter document type → AI searches RFT → shows found requirements → user confirms
✓ If AI finds no requirements for manual document, allows empty creation
✓ Analysis handles errors: invalid JSON → auto-retry once → manual fallback if fails again
✓ Analysis handles zero documents found → shows error message with manual add option
✓ All API responses follow standard format from api-utils
✓ Streaming uses Server-Sent Events (SSE) format
✓ E2E test validates: upload sample RFT → analyze → verify work packages created → edit requirements → add manual document
✓ No TypeScript errors, build succeeds

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create Work Package Repository

**File:** `libs/repositories/work-packages.ts`

- `createWorkPackage(supabase, data: CreateWorkPackageData): Promise<WorkPackage>`
  - Insert work package with document_type, project_id, requirements JSONB, order
  - Return created record with id
- `listWorkPackages(supabase, projectId: string): Promise<WorkPackage[]>`
  - Fetch all work packages for project ordered by `order` field
  - Include assigned user info if assigned_to is set
- `getWorkPackage(supabase, id: string): Promise<WorkPackage>`
  - Get single work package by id
- `updateWorkPackage(supabase, id: string, data: UpdateWorkPackageData): Promise<WorkPackage>`
  - Update document_type, document_description, requirements, or status
  - Return updated record
- `deleteWorkPackage(supabase, id: string): Promise<void>`
  - Delete work package (cascades to work_package_content via FK)
- Add TypeScript interfaces matching data schema:
  ```typescript
  interface Requirement {
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }

  interface WorkPackage {
    id: string
    project_id: string
    document_type: string
    document_description: string | null
    requirements: Requirement[]
    assigned_to: string | null
    status: 'not_started' | 'in_progress' | 'completed'
    order: number
    created_at: string
    updated_at: string
  }
  ```

### 2. Update Project Repository

**File:** `libs/repositories/projects.ts`

- Add `updateProjectStatus(supabase, projectId: string, status: ProjectStatus): Promise<void>`
  - Update project status field ('setup' → 'analysis' → 'in_progress' → 'completed')
  - Update updated_at timestamp

### 3. Create RFT Analysis Prompt Template

**File:** `libs/ai/prompts/analyze-rft.ts`

- Export `buildAnalysisPrompt(rftTexts: string[], projectName: string, instructions?: string): string`
- Prompt structure:
  ```
  You are analyzing a Request for Tender (RFT) to identify ALL required submission documents.

  Project: {projectName}

  RFT Documents:
  {concatenated rftTexts with clear separators}

  {User Instructions if provided}

  Tasks:
  1. Identify ALL documents that must be submitted as part of the tender response
  2. Extract 5-8 key mandatory requirements for EACH document
  3. Classify each requirement as mandatory or optional
  4. Provide specific RFT page/section references for each requirement

  Output as valid JSON only (no markdown, no explanation):
  {
    "documents": [
      {
        "document_type": "Technical Specification",
        "description": "Detailed technical approach and methodology",
        "requirements": [
          {
            "id": "req_1",
            "text": "Must describe cloud architecture approach",
            "priority": "mandatory",
            "source": "Section 3.2, Page 12"
          }
        ]
      }
    ]
  }

  Focus on 5-8 KEY requirements per document (not exhaustive).
  Common document types: Technical Specification, Methodology, Bill of Quantities,
  Risk Register, Subcontractor List, Project Plan, Quality Plan, WHS Plan,
  Insurance Certificates, Company Profile, Case Studies.

  Return only valid JSON. No markdown formatting.
  ```

### 4. Create Manual Requirements Extraction Prompt

**File:** `libs/ai/prompts/extract-requirements.ts`

- Export `buildExtractionPrompt(rftTexts: string[], documentType: string): string`
- Prompt structure:
  ```
  You are extracting requirements from an RFT for a specific document type.

  Document Type: {documentType}

  RFT Documents:
  {concatenated rftTexts}

  Task: Find 5-8 key requirements in the RFT that relate to "{documentType}".

  Output as valid JSON only:
  {
    "requirements": [
      {
        "id": "req_1",
        "text": "Requirement text",
        "priority": "mandatory",
        "source": "Section X, Page Y"
      }
    ]
  }

  If no relevant requirements found, return: {"requirements": []}

  Return only valid JSON. No markdown formatting.
  ```

### 5. Create Analysis Service Functions

**File:** `libs/ai/analysis.ts`

- Import Gemini client from `libs/ai/client.ts`
- Import prompt builders from `libs/ai/prompts/`
- Import repositories

**Function 1: `analyzeRFTDocuments`**
```typescript
async function analyzeRFTDocuments(
  projectId: string,
  rftTexts: string[],
  projectName: string,
  instructions?: string
): Promise<{
  success: boolean
  documents?: Array<{
    document_type: string
    description: string
    requirements: Requirement[]
  }>
  error?: string
}>
```
- Build prompt using `buildAnalysisPrompt`
- Call Gemini with prompt
- Parse JSON response with `parseAnalysisResponse`
- Return parsed documents array
- Handle errors (return error object)

**Function 2: `extractRequirementsForDocument`**
```typescript
async function extractRequirementsForDocument(
  rftTexts: string[],
  documentType: string
): Promise<Requirement[]>
```
- Build prompt using `buildExtractionPrompt`
- Call Gemini
- Parse response
- Return requirements array (empty if none found)

**Function 3: `parseAnalysisResponse`**
```typescript
function parseAnalysisResponse(responseText: string): {
  success: boolean
  documents?: any[]
  error?: string
}
```
- Strip markdown code fences if present (```json...```)
- Parse JSON
- Validate structure (has `documents` array)
- Validate each document has required fields
- Generate unique `id` for each requirement (uuid)
- Return validation result

### 6. Create Streaming Analysis API Route

**File:** `app/api/projects/[id]/analyze/route.ts`

- `POST` handler that returns Server-Sent Events stream
- Steps:
  1. Validate auth and get user
  2. Get project and verify ownership
  3. Fetch all project_documents with content_text
  4. Validate at least one document with extracted text exists
  5. Update project status to 'analysis'
  6. Call `analyzeRFTDocuments` (non-streaming first attempt)
  7. If JSON parse fails → retry once with modified prompt
  8. If retry fails → return error event
  9. For each document in response:
     - Create work_package record via repository
     - Send SSE event: `data: {"type":"document","data":{document details}}\n\n`
  10. After all documents processed, update project status to 'in_progress'
  11. Send SSE event: `data: {"type":"complete"}\n\n`
  12. Close stream
- SSE format:
  ```
  event: progress
  data: {"type":"start","message":"Analyzing RFT documents..."}

  event: progress
  data: {"type":"document","data":{"id":"uuid","document_type":"Technical Specification",...}}

  event: progress
  data: {"type":"complete","count":8}

  event: done
  data: {"success":true}
  ```
- Error handling:
  - No documents with text → return 400 error
  - Gemini API failure → send error event, close stream
  - Database errors → send error event

### 7. Create Work Package CRUD API Routes

**File:** `app/api/work-packages/route.ts`

- `POST` - Create manual work package
  - Body: `{ project_id, document_type, description?, requirements? }`
  - Create work package with empty or provided requirements
  - Return created work package

**File:** `app/api/work-packages/[id]/route.ts`

- `GET` - Get single work package
- `PUT` - Update work package
  - Body: `{ document_type?, requirements?, status? }`
  - Update fields
  - Return updated work package
- `DELETE` - Delete work package
  - Remove from database
  - Return success

### 8. Create Manual Requirements Extraction API Route

**File:** `app/api/work-packages/[id]/extract-requirements/route.ts`

- `POST` - AI-assisted requirement extraction for manually added document
- Body: `{ document_type: string }`
- Steps:
  1. Get work package by id, verify ownership
  2. Get project to fetch RFT documents
  3. Fetch all project document texts
  4. Call `extractRequirementsForDocument(rftTexts, documentType)`
  5. Return found requirements array
- User decides whether to apply or not (frontend)

---
✅ CHECKPOINT: Steps 1-8 complete (Backend/API layer). Continue to step 9.
---

### 9. Create Streaming Progress Component

**File:** `components/streaming-progress.tsx`

- Client Component (use 'use client')
- Props: `{ isAnalyzing: boolean, documents: Document[], onComplete: () => void }`
- UI structure:
  - Animated pulse/spinner icon (use lucide-react)
  - "Analyzing RFT documents..." heading
  - List of identified documents appearing progressively
  - Each document shows: document type, requirement count
  - Smooth fade-in animation as each document appears (framer-motion optional or CSS)
- Use shadcn Card component for container
- Match TenderCreator loading aesthetic

### 10. Create Analysis Trigger Component

**File:** `components/analysis-trigger.tsx`

- Client Component
- Props: `{ projectId: string, projectStatus: string, onAnalysisComplete: () => void }`
- Button labeled "Analyze RFT"
- Disabled if status != 'setup'
- On click:
  1. POST to `/api/projects/[id]/analyze`
  2. Create EventSource for SSE
  3. Listen for events, update local state with discovered documents
  4. Show StreamingProgress component
  5. On completion event, call onAnalysisComplete callback
  6. Handle errors, show toast notification
- Use shadcn Button component
- Show loading state during analysis

### 11. Create Requirement Editor Component

**File:** `components/requirement-editor.tsx`

- Client Component
- Props: `{ requirement: Requirement, onUpdate: (req: Requirement) => void, onDelete: () => void }`
- Displays requirement in editable format:
  - Inline editable text (contentEditable or input)
  - Priority dropdown (mandatory/optional) using shadcn Select
  - Source text (editable)
  - Delete button (lucide X icon)
- Save changes on blur or Enter key
- Use shadcn Badge for priority display when not editing

### 12. Create Add Document Dialog Component

**File:** `components/add-document-dialog.tsx`

- Client Component
- Props: `{ projectId: string, onDocumentAdded: () => void }`
- shadcn Dialog component
- Form fields:
  - Document Type (text input) - required
  - Description (textarea) - optional
- Flow:
  1. User enters document type
  2. Click "Search for Requirements" button
  3. POST to `/api/work-packages/[id]/extract-requirements` (create empty WP first)
  4. Show loading state
  5. Display found requirements (if any)
  6. User can edit/remove requirements before saving
  7. Click "Add Document" → requirements already saved, just close dialog
  8. If no requirements found, allow adding with empty requirements
- Use React Hook Form + Zod validation
- Match TenderCreator modal styling

### 13. Create Document Requirements Matrix Component

**File:** `components/document-requirements-matrix.tsx`

- Client Component
- Props: `{ projectId: string, workPackages: WorkPackage[], onUpdate: () => void }`
- shadcn Table component with columns:
  - Document Type (with expand arrow icon)
  - Requirements (count badge)
  - Assigned To (empty dropdown - Phase 3)
  - Status (badge: not_started)
  - Actions (delete icon)
- Expandable rows:
  - Click row → expand to show requirements list
  - Each requirement uses RequirementEditor component
  - "Add Requirement" button in expanded section
- Delete work package:
  - Confirm dialog (shadcn AlertDialog)
  - DELETE to `/api/work-packages/[id]`
- "Add Custom Document" button below table opens AddDocumentDialog
- Empty state if no work packages
- Match TenderCreator table design

### 14. Update Project Detail Page

**File:** `app/(dashboard)/projects/[id]/page.tsx`

- Server Component that fetches project + work packages
- Conditional rendering based on project status:
  - **status = 'setup'**: Show AnalysisTrigger component + uploaded documents list
  - **status = 'analysis'**: Show StreamingProgress (shouldn't see this - analysis redirects)
  - **status = 'in_progress'**: Show DocumentRequirementsMatrix component
- After successful analysis, revalidate page to show matrix
- Add "Continue to Workflow →" button (Phase 3) when work packages exist

### 15. Add Helper Function for Analysis Status Check

**File:** `libs/repositories/projects.ts`

- Add `getProjectWithDocumentsAndPackages(supabase, projectId: string)`
  - Fetch project
  - Include project_documents array
  - Include work_packages array with counts
  - Return combined object for project detail page

### 16. Create Sample RFT Test Fixture

**Files:** `test_fixtures/`

Create realistic construction tender RFT:

- **sample_rft_construction.txt** - Plain text version with structure:
  ```
  NSW GOVERNMENT CONSTRUCTION TENDER
  PROJECT: Community Centre Redevelopment

  1. SUBMISSION REQUIREMENTS
  [List 8-10 required documents]

  2. TECHNICAL SPECIFICATION REQUIREMENTS
  - Must describe construction methodology [MANDATORY]
  - Must include timeline (Section 2.3)
  [5-8 requirements]

  3. BILL OF QUANTITIES REQUIREMENTS
  - Itemized cost breakdown required [MANDATORY]
  [5-8 requirements]

  4. RISK REGISTER REQUIREMENTS
  [5-8 requirements]

  5. WHS PLAN REQUIREMENTS
  [5-8 requirements]

  [Continue for 8-10 document types]
  ```

- **README.md** - Document fixture purpose and usage

### 17. Create E2E Test Command

**File:** `.claude/commands/e2e/test_phase_2_analysis.md`

```markdown
# E2E Test: Phase 2 RFT Analysis

Test the complete RFT analysis workflow from upload to work package creation.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## Pre-configured Test User
Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Test Steps

### 1. Setup
- Sign in as test user
- Create new project: "Test Construction Tender"
- Upload `test_fixtures/sample_rft_construction.txt` as RFT document
- Verify file uploaded and text extracted (check project detail page)

### 2. Trigger Analysis
- Click "Analyze RFT" button on project detail page
- Verify loading animation appears
- Verify streaming progress shows documents appearing one by one
- Wait for analysis to complete (should show 8-10 documents)

### 3. Validate Work Packages Created
- Verify Document Requirements Matrix appears
- Count rows - should match number of documents found
- Verify each row shows:
  - Document type name
  - Requirements count (5-8 per document)
  - Status: "Not Started"
  - Empty "Assigned To" field

### 4. Test Requirement Viewing/Editing
- Click expand icon on first document row
- Verify requirements list displays with:
  - Requirement text
  - Priority badge (mandatory/optional)
  - Source reference (section/page)
- Edit one requirement text inline
- Verify change saves
- Refresh page, verify edit persisted

### 5. Test Requirement Deletion
- Delete one requirement from expanded row
- Verify requirement removed from list
- Verify count badge updates

### 6. Test Work Package Deletion
- Click delete icon on one document row
- Confirm in dialog
- Verify row removed from table
- Refresh page, verify deletion persisted

### 7. Test Manual Document Addition
- Click "Add Custom Document" button
- Enter document type: "Insurance Certificates"
- Click "Search for Requirements"
- Verify AI searches RFT and shows found requirements (may be 0-3)
- Edit/accept requirements
- Click "Add Document"
- Verify new row appears in matrix

### 8. Test Error Handling
- Create another project with NO documents uploaded
- Click "Analyze RFT" (if button appears)
- Verify error message appears
- Verify can manually add documents as fallback

## Success Criteria
✓ All steps complete without errors
✓ Work packages created match RFT content
✓ Requirements have proper source references
✓ Edit/delete operations persist
✓ Manual document addition works with AI assistance
✓ UI matches TenderCreator design aesthetic
```

---
✅ CHECKPOINT: Steps 9-17 complete (Frontend/UI + Testing). Continue to step 18.
---

### 18. Run Validation Commands

Execute every validation command below to ensure Phase 2 works correctly.

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Build check (no TypeScript errors)
npm run build

# 2. Start dev server
npm run dev

# 3. Check work_packages table structure
# (Manual: Supabase dashboard > Table Editor > work_packages, verify requirements JSONB column)

# 4. Test analysis API endpoint
# (Manual: Use Bruno/Postman to POST /api/projects/[id]/analyze, verify SSE stream)

# 5. Run E2E test
# Read .claude/commands/test_e2e.md for test credentials
# Execute .claude/commands/e2e/test_phase_2_analysis.md
# Complete all 8 test steps
# Verify all acceptance criteria met

# 6. Validate streaming progress
# (Manual: Watch network tab during analysis, verify SSE events arriving progressively)

# 7. Test with sample fixture
# Upload test_fixtures/sample_rft_construction.txt
# Analyze, verify 8-10 documents identified
# Verify requirements have proper structure

# 8. Test error scenarios
# Trigger analysis on project with no documents
# Verify error handling works
# Manually add document to recover

# 9. Test manual document flow
# Add custom document "Safety Plan"
# Verify AI-assisted requirement extraction
# Verify can save with 0 requirements if none found

# 10. Verify UI matches design
# Compare to TenderCreator reference screenshots
# Check table styling, buttons, badges, animations
# Verify loading states look professional

# 11. Test edit persistence
# Edit requirements, refresh page
# Delete work package, refresh page
# Verify all changes persisted correctly

# 12. Check logs
# Review browser console for errors
# Check Network tab for failed requests
# Verify API responses use standard format
```

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_2_ai_analysis/phase_2_implementation.log

## Notes

### Streaming Implementation Details

**Server-Sent Events (SSE):**
- Use `ReadableStream` with text encoder
- Format: `event: progress\ndata: {json}\n\n`
- Client uses `EventSource` API
- Close stream on completion or error

**Progressive Work Package Creation:**
- Create work_package records IMMEDIATELY as documents identified
- Don't wait for full analysis to complete
- Allows user to see results in real-time
- If analysis fails mid-stream, already-created packages remain

### Prompt Engineering Tips

**JSON Formatting:**
- Explicitly request NO markdown code fences
- Gemini sometimes wraps JSON in ```json...```
- Parsing function strips these if present
- Validate structure before returning

**Requirement Quality:**
- Ask for 5-8 KEY requirements (not exhaustive)
- Focus on mandatory items
- Request page/section references
- Generic requirements ok if RFT vague

**Error Recovery:**
- Auto-retry with stronger JSON instructions on first failure
- Modified prompt adds: "CRITICAL: Return ONLY valid JSON. No text before or after."
- Manual fallback if retry fails

### UI/UX Flow

**Analysis Journey:**
1. User on project detail, sees "Analyze RFT" button
2. Click → Button changes to loading state
3. StreamingProgress component slides in
4. Documents appear one by one with smooth animation
5. Progress counter updates (e.g., "Found 8 documents")
6. On completion, smooth transition to DocumentRequirementsMatrix
7. Matrix fades in showing all work packages

**Matrix Interaction:**
- Hover on row highlights (subtle background change)
- Click anywhere on row to expand (not just arrow icon)
- Expanded state shows requirements with edit controls
- Delete requires confirmation (don't accidentally remove)
- Add button is prominent but not overwhelming

### Data Structure

**Requirements JSONB Example:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Must describe cloud architecture approach with multi-region redundancy",
    "priority": "mandatory",
    "source": "Section 3.2, Page 12"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "text": "Include disaster recovery procedures",
    "priority": "optional",
    "source": "Section 3.5, Page 15"
  }
]
```

**Work Package Order:**
- `order` field determines display sequence
- Set during analysis based on AI response order
- User can manually reorder (future enhancement)
- For now, order by created_at if order same

### Error Scenarios to Handle

1. **No documents uploaded** → Show error, disable analyze button
2. **No text extracted** → Show warning, suggest re-upload
3. **Zero documents identified** → Show message, offer manual add
4. **Invalid JSON response** → Auto-retry, then manual fallback
5. **Gemini API timeout** → Show retry button
6. **Network failure mid-stream** → Show partial results + error
7. **Database constraint violation** → Log error, show user message

### Testing Strategy

**Unit Tests (Optional for MVP):**
- Test `parseAnalysisResponse` with various JSON formats
- Test requirement validation logic

**Manual Testing Required:**
- Various RFT formats (construction, IT, consulting)
- Different document counts (5, 10, 15+)
- Edge cases (single document, 20+ documents)
- Error scenarios (no docs, bad JSON)

**E2E Test Coverage:**
- Happy path (upload → analyze → edit → delete)
- Manual document addition with AI assist
- Error recovery flows
- Persistence across page refreshes

### Performance Considerations

**Analysis Speed:**
- Gemini 2.5 Flash typically <10s for analysis
- Streaming shows progress immediately
- User perceives speed due to progressive display

**Database Load:**
- Creating 10 work packages = 10 INSERT queries
- Acceptable for MVP (no optimization needed)
- RLS policies automatically enforce org isolation

**Token Usage:**
- Typical RFT: 20-50K tokens
- Analysis prompt: ~1K tokens
- Total context: ~50K tokens (well under 1M limit)
- Manual extraction: ~25K tokens per document

### Future Enhancements (Post-MVP)

- Bulk edit requirements across multiple documents
- Drag-drop reordering of work packages
- Requirement templates for common document types
- AI confidence scores per requirement
- Export requirements matrix as Excel/PDF
- Compare multiple RFT versions (detect changes)

### Integration with Phase 3

Phase 2 output enables Phase 3 (Work Package Assignment):
- work_packages table populated with all documents
- assigned_to field ready for user assignment
- status field ready for tracking (not_started → in_progress → completed)
- Document Requirements Matrix becomes project dashboard in Phase 3

## Research Documentation

No research sub-agents deployed for Phase 2. Implementation follows:
- Gemini API documentation (streaming, File API)
- Next.js streaming documentation (ReadableStream, SSE)
- Server-Sent Events specification
- shadcn/ui Table component documentation
