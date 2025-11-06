# Plan: Simplify Project Documents UI

## Plan Description
Redesign the project documents view to remove download functionality and completely reimagine the empty state UI. When a project has no documents or work packages, show a split-layout interface with uploader on left, document list on right, and Generate button at bottom - following the reference design system.

## User Story
As a project manager
I want to see a clean document list without download clutter
So that I can focus on uploading and organizing documents before analysis

## Problem Statement
Current UI has two issues:
1. Download buttons add unnecessary clutter when users only need to view the document list
2. Empty state (no documents/no work packages) is poorly designed and doesn't guide users effectively through the upload workflow

## Solution Statement
1. Remove download button from DocumentList component - keep only document name, type, size, upload date, and delete action
2. Create new split-layout component matching reference images:
   - Left panel: File uploader with dashed border styling
   - Right panel: Document list display
   - Bottom: Generate/Analyze button
3. Follow existing design system colors, spacing, and component patterns

## Dependencies

### Previous Plans
- None - standalone UI improvement

### External Dependencies
- Existing shadcn/ui components (Card, Button, Table)
- Existing FileUpload component
- Existing DocumentList component

## Relevant Files

### Files to Modify

**`/Users/varunprasad/code/prjs/tendercreator/tendercreator/components/document-list.tsx`**
- Remove download button functionality
- Simplify table to show: name, type, size, uploaded date, delete action only
- Keep Primary badge for is_primary_rft documents

**`/Users/varunprasad/code/prjs/tendercreator/tendercreator/app/(dashboard)/projects/[id]/page.tsx`**
- Replace current empty state and separated upload/list cards with new split-layout component
- Integrate new component when project.status === 'setup' and documents.length === 0

### New Files

**`/Users/varunprasad/code/prjs/tendercreator/tendercreator/components/project-document-uploader.tsx`**
- New split-layout component with left uploader, right document list
- Bottom-aligned Generate button
- Matches reference design system from ui1.png and ui2.png

**`/Users/varunprasad/code/prjs/tendercreator/tendercreator/.claude/commands/e2e/test_simplified_project_documents_ui.md`**
- E2E test to validate simplified UI works correctly
- Test upload flow, document display, and Generate button visibility

## Acceptance Criteria

1. DocumentList component no longer shows download button
2. DocumentList shows only: name (with Primary badge), type, size, uploaded date, delete action
3. When project in 'setup' status with no documents: split-layout UI displayed
4. Split-layout: left panel has file uploader with dashed border
5. Split-layout: right panel shows "No documents uploaded yet" or document list
6. Generate button appears at bottom when documents exist
7. Design matches reference images (colors, spacing, dashed borders)
8. All existing upload/delete functionality still works
9. E2E test passes validating new UI

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Simplify DocumentList Component

- Remove download_url prop requirement from Document interface
- Remove download button from Actions column
- Keep only Delete button in Actions column
- Maintain Primary badge for is_primary_rft
- Keep formatFileSize utility
- Test component renders correctly with simplified interface

### 2. Create ProjectDocumentUploader Component

- Create new file: `components/project-document-uploader.tsx`
- Implement split-layout: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Left panel: Card with FileUpload component inside
  - Title: "Upload RFT Documents"
  - Dashed border styling matching reference
- Right panel: Card with document list or empty state
  - Title: "Uploaded Documents"
  - If no documents: centered empty state message
  - If documents exist: DocumentList component
- Props: documents, onUpload, onDelete, showAnalyzeButton
- Bottom section: Analyze button (conditional on documents.length > 0)
- Follow design system: use existing Card, CardHeader, CardTitle, CardContent
- Match spacing and layout from reference images

### 3. Update Project Detail Page

- Import new ProjectDocumentUploader component
- Replace separate upload and list Cards when status === 'setup'
- Use ProjectDocumentUploader when documents.length === 0 OR always in setup mode
- Keep existing DocumentList in separate Card when status !== 'setup' (read-only view)
- Pass all necessary props: documents, handleUpload, handleDelete
- Move AnalysisTrigger into ProjectDocumentUploader bottom section

---
✅ CHECKPOINT: Steps 1-3 complete (Component refactoring). Continue to step 4.
---

### 4. Verify Design System Alignment

- Review colors: use primary (black), muted-foreground (gray), border colors
- Verify dashed borders match reference: `border-2 border-dashed border-gray-300`
- Check spacing: consistent padding (p-6, p-8), gaps (gap-4, gap-6)
- Ensure Card styling matches: rounded-lg with subtle borders
- Test responsive behavior: split on lg breakpoint, stack on mobile

### 5. Create E2E Test File

- Create file: `.claude/commands/e2e/test_simplified_project_documents_ui.md`
- Test user story: Upload documents and verify simplified UI
- Test steps:
  1. Sign in with test credentials
  2. Create new project
  3. Verify split-layout UI appears
  4. Verify left panel has uploader
  5. Verify right panel shows "No documents uploaded yet"
  6. Upload document via test fixture
  7. Verify document appears in right panel list
  8. Verify NO download button exists
  9. Verify Delete button exists
  10. Verify Generate button appears at bottom
  11. Take screenshots at each stage
- Success criteria: All UI elements present, no download button, upload/delete work

### 6. Run Validation Commands

- Execute all validation commands listed below
- Fix any issues discovered
- Confirm zero regressions

## Testing Strategy

### Unit Tests
- DocumentList renders without download button
- ProjectDocumentUploader renders split-layout correctly
- Empty state displays when no documents
- Generate button conditional on documents.length > 0

### Edge Cases
- Single document uploaded (should show list, not empty state)
- Multiple documents (list scrolls properly)
- Very long document names (ellipsis or wrap)
- Delete last document (should return to empty state)
- Project status changes (read-only view vs upload view)

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

```bash
# 1. Build check - ensure no TypeScript errors
npm run build

# 2. Start dev server (if not running)
npm run dev

# 3. Read E2E test instructions
# Read .claude/commands/test_e2e.md

# 4. Execute E2E test
# Read and execute .claude/commands/e2e/test_simplified_project_documents_ui.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Follow workflow format from test_e2e.md
- Capture screenshots proving:
  - Split-layout UI with left uploader, right document list
  - No download button in document list
  - Generate button at bottom when documents exist
  - Upload and delete functionality working

# Implementation log created at:
# specs/simplify_project_documents_ui/simplify_project_documents_ui_implementation.log

## Notes

**Design System Reference:**
- Colors: Black primary, gray muted text, light gray borders
- Spacing: 24px (p-6), 32px (p-8) for cards
- Dashed borders: `border-2 border-dashed border-gray-300`
- Card hover: card-hover class for subtle lift effect
- Reference images: ai_docs/ui_reference/ui1.png, ui2.png

**Key Design Decisions:**
1. Split-layout only shown during 'setup' status (editing mode)
2. After analysis/in_progress: traditional list view (read-only)
3. Download button removed entirely (users don't need to re-download their own uploads)
4. Generate button integrated into uploader component for cohesive UX
5. Responsive: split on lg breakpoint (1024px+), stack on smaller screens

**Future Enhancements (out of scope):**
- Drag-and-drop reordering of documents
- Bulk upload multiple files
- Document preview/thumbnail
- Primary RFT selection via radio button

## Research Documentation
No additional research required - using existing design system and components.
