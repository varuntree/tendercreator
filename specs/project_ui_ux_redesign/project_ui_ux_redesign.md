# Plan: Project UI/UX Redesign

## Plan Description
Redesign project UI/UX across two key pages: (1) Project detail page (showing uploaded documents + work packages) and (2) Document upload screen. Transform work packages from card-based layout to table structure per reference design. Simplify document list to show only file names. Create split-panel upload UI (left: uploader, right: document list). Maintain existing design system and functionality - UI/UX improvements only.

## User Story
As a tender response manager
I want streamlined, table-based work package views and efficient document management
So that I can quickly see all work packages in a structured format and manage documents without visual clutter

## Problem Statement
Current UI has three main issues:
1. **Work packages as cards** - Takes excessive space, makes scanning difficult when 5-15+ packages exist
2. **Verbose document display** - Shows full metadata (size, type, date, actions) when only name needed
3. **Stacked upload UI** - Document uploader and list vertically stacked instead of side-by-side for better workflow

## Solution Statement
Transform UI to match reference design (specs/desing.png):
1. **Table-based work packages** - Replace card grid with sortable table showing document type, requirements count, assignment, status in compact rows
2. **Minimal document list** - Show only document names with simple, clean display
3. **Split-panel upload** - Left panel for uploader, right panel for document list following existing design system

## Dependencies
### Previous Plans
- None (pure UI/UX refactor, no functionality changes)

### External Dependencies
- Existing shadcn/ui table component
- Current design system (Tailwind CSS variables)
- Reference image: specs/desing.png

## Relevant Files
Use these files to implement the task:

### Existing Files

**app/(dashboard)/projects/[id]/page.tsx** (112 lines)
- Main project detail page
- Currently renders DocumentList and WorkPackageDashboard
- Need to update document display to minimal format
- Need to integrate new table-based work package display

**components/document-list.tsx** (75 lines)
- Current implementation shows full table with type, size, date, actions
- Need to simplify to show only document names
- Should maintain existing document data structure

**components/work-package-dashboard.tsx** (147 lines)
- Currently renders work packages as card grid (line 133: `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`)
- Shows WorkPackageCard components
- Need to replace with table structure showing all packages in compact rows

**components/project-document-uploader.tsx** (91 lines)
- Already has split-panel layout (line 34: `grid grid-cols-1 gap-6 lg:grid-cols-2`)
- Already shows upload left, documents right
- May need minor adjustments to match reference design exactly

**components/document-requirements-matrix.tsx** (342 lines)
- Uses table structure for document requirements
- Good reference for table implementation patterns
- Shows expandable rows pattern to potentially reuse

### New Files

**components/work-package-table.tsx**
- New table component for work packages
- Replace card-based WorkPackageDashboard implementation
- Columns: Document Type, Requirements, Assigned To, Status, Actions
- Based on reference design specs/desing.png

**components/simple-document-list.tsx**
- Minimal document name display component
- Replace verbose DocumentList for project documents
- Show only names in clean list format

## Acceptance Criteria
1. Work packages displayed in table format matching reference design (specs/desing.png)
2. Table shows: Document Type, Requirements count, Assignment, Status, Open action
3. Document list shows only file names (no size, type, date, delete buttons unless needed)
4. Upload screen maintains left (uploader) / right (documents) split panel
5. Existing design system colors and spacing maintained
6. Zero functionality changes - all features work identically
7. Existing WorkPackage card actions (assign, status, open) work in table format
8. Responsive design maintained for desktop

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Analyze Reference Design

- Read and visually analyze specs/desing.png
- Identify exact table structure (columns, spacing, styling)
- Document table column headers, data shown per row
- Note any interactive elements (buttons, badges, hover states)
- Identify design system elements used (colors, spacing, typography)

### 2. Create Simple Document List Component

- Create `components/simple-document-list.tsx`
- Accept `documents[]` array prop
- Display only `document.name` per item
- Use minimal styling - simple list or compact table
- Follow existing design system (CSS variables)
- No delete, no metadata display
- Add empty state when no documents

### 3. Create Work Package Table Component

- Create `components/work-package-table.tsx`
- Implement shadcn/ui Table component structure
- Table columns:
  - Document Type (string)
  - Requirements (badge showing count)
  - Assigned To (text or dropdown for mock users)
  - Status (badge: pending/in_progress/completed)
  - Actions (Open button)
- Use existing WorkPackage interface
- Wire up `onOpen`, `onAssignmentChange`, `onStatusChange` callbacks
- Match reference design styling from specs/desing.png
- Use existing Badge, Button components from shadcn/ui

### 4. Update Work Package Dashboard Component

- Open `components/work-package-dashboard.tsx`
- Replace card grid implementation (lines 133-143) with WorkPackageTable
- Import new `WorkPackageTable` component
- Pass workPackages array and all callback handlers
- Maintain header section (title, progress, buttons)
- Keep AddDocumentDialog and BulkExportButton in same positions
- Test that all callbacks (assign, status, open) still fire correctly

---
✅ CHECKPOINT: Steps 1-4 complete (Core components). Continue to step 5.
---

### 5. Update Project Detail Page - Document Display

- Open `app/(dashboard)/projects/[id]/page.tsx`
- Locate DocumentList usage (line 130)
- Replace with SimpleDocumentList component
- Import new component
- Pass only necessary props (documents array)
- Maintain card structure around it
- Keep "No documents uploaded" empty state

### 6. Verify Upload Screen Layout

- Open `components/project-document-uploader.tsx`
- Verify split-panel layout exists (line 34: grid-cols-2)
- Compare with reference design
- Adjust spacing/styling if needed to match reference
- Ensure left panel: uploader, right panel: document list
- Verify responsive behavior maintained

### 7. Polish Table Styling

- Review created WorkPackageTable component
- Match table styling to reference design exactly:
  - Header background color
  - Row borders and spacing
  - Badge styles for status (completed: green, in_progress: yellow, pending: gray)
  - Badge styles for requirements count
  - Button styling for Open action
  - Hover states for rows
- Use CSS variables from design system
- No hard-coded colors or spacing

### 8. Test All User Flows

- Start dev server if not running
- Navigate to project detail page
- Verify documents show only names
- Verify work packages display in table format
- Click each work package Open button → verify navigation works
- Test assignment dropdown (if interactive)
- Test status changes (if interactive)
- Verify bulk export button appears when packages completed
- Test document upload flow
- Verify split-panel upload layout works

### 9. Responsive Design Check

- Test on desktop viewport (primary target)
- Verify table scrolls horizontally if needed on smaller screens
- Ensure no layout breaks
- Maintain minimum usability on tablet (secondary)
- Note: Mobile not in scope per MVP requirements

### 10. Cross-Component Integration Test

- Verify project page → work package navigation
- Test document upload → document list updates
- Verify RFT analysis → work package table populates
- Test all status transitions reflect in table
- Verify assignment changes persist and display
- Test completed work packages → bulk export appears

### 11. Create E2E Test File

- Create `.claude/commands/e2e/test_project_ui_redesign.md`
- Follow format from test_basic_query.md and test_e2e.md
- Test steps:
  1. Sign in with test credentials
  2. Navigate to test project
  3. Verify document list shows only names
  4. Screenshot document list
  5. Verify work packages in table format
  6. Screenshot work package table
  7. Verify table columns match reference
  8. Click Open on work package
  9. Verify navigation works
  10. Return to project
  11. Screenshot final state
- Success criteria:
  - Document list minimal (names only)
  - Work packages in table (not cards)
  - All navigation functional
  - Matches reference design
- Use pre-configured test credentials from test_e2e.md
- Use absolute paths for test fixtures

---
✅ CHECKPOINT: Steps 5-11 complete (Integration). Continue to step 12.
---

### 12. Run Validation Commands

- Execute all commands in Validation Commands section
- Fix any errors found
- Re-run until all pass
- Document any issues in implementation log

## Testing Strategy
### Unit Tests
- Not required for pure UI refactor
- Visual regression testing via E2E screenshots sufficient

### Edge Cases
- Zero documents uploaded (empty state)
- Zero work packages (empty state)
- Single work package (table with one row)
- 15+ work packages (table scrolling/pagination)
- Long document names (text truncation)
- Unassigned work packages (show "Unassigned")
- All statuses (pending, in_progress, completed badges)

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# Verify all new components created
ls -la components/work-package-table.tsx
ls -la components/simple-document-list.tsx
ls -la .claude/commands/e2e/test_project_ui_redesign.md

# Verify no TypeScript errors
npx tsc --noEmit

# Start dev server (if not running)
npm run dev

# Run E2E test
# Read test_e2e.md, then execute test_project_ui_redesign.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Use test fixtures: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
- Take screenshots comparing before/after states
- Verify table structure matches specs/desing.png reference
- Test all work package interactions (open, assign, status)

# Implementation log created at:
# specs/project_ui_ux_redesign/project_ui_ux_redesign_implementation.log

## Notes

### Design System Compliance
- Use existing CSS variables from globals.css
- Use existing shadcn/ui components (Table, Badge, Button)
- Follow coding_patterns.md - no hard-coded values
- Match TenderCreator design aesthetic (clean, professional)

### Functionality Preservation
- Zero changes to:
  - Work package creation/deletion
  - Document upload/deletion
  - Assignment logic
  - Status transitions
  - Navigation flows
  - API calls
- Only UI presentation layer changes

### Reference Design (specs/desing.png)
- Table structure with clean rows
- Compact information density
- Clear visual hierarchy
- Professional SaaS aesthetic
- Use as primary visual reference

### Implementation Approach
- Component-based refactor (create new, swap old)
- Incremental testing per component
- Maintain backward compatibility
- Reuse existing UI primitives (Badge, Button, Table)
- Follow established patterns from document-requirements-matrix.tsx

### Future Enhancements (Out of Scope)
- Sortable table columns
- Filterable work packages
- Bulk status updates
- Inline editing of document types
- These are UI improvements, defer post-MVP
