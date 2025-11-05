# E2E Test: Phase 2 RFT Analysis

## User Story

As a tender manager, I need to analyze uploaded RFT documents to automatically identify all required submission documents with their specific requirements, so I can quickly understand what deliverables my team needs to create and assign work packages accordingly.

## Test Steps

### 1. Authentication & Navigation
- **Navigate** to `http://localhost:3000`
- **Sign in** using test credentials:
  - Email: `test@tendercreator.dev`
  - Password: `TestPass123!`
- **Verify** dashboard page loads
- **Screenshot:** `01_dashboard.png`

### 2. Create Test Project
- **Click** "New Project" button
- **Fill** project form:
  - Name: "Phase 2 RFT Analysis Test"
  - Client: "NSW Government"
- **Click** "Create Project"
- **Verify** redirected to project detail page
- **Screenshot:** `02_project_created.png`

### 3. Upload RFT Document
- **Locate** file upload component
- **Upload** file: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft_construction.txt`
- **Wait** for upload to complete (check for success message or document appears in list)
- **Verify** document appears in documents list with extracted text indicator
- **Screenshot:** `03_document_uploaded.png`

### 4. Trigger RFT Analysis
- **Verify** "Analyze RFT" button is visible and enabled
- **Click** "Analyze RFT" button
- **Verify** streaming progress UI appears with animated loader
- **Screenshot:** `04_analysis_started.png`

### 5. Monitor Analysis Progress
- **Wait** for documents to appear progressively in streaming UI
- **Verify** each document shows:
  - Document type name
  - Requirements count badge
- **Count** total documents identified (should be 8-10)
- **Wait** for "Analysis Complete" or similar completion message
- **Screenshot:** `05_analysis_progress.png`

### 6. Validate Document Requirements Matrix
- **Verify** Document Requirements Matrix component appears
- **Count** table rows (should match number of documents from analysis)
- **Verify** table headers: "Document Type", "Requirements", "Assigned To", "Status"
- **Verify** each row displays:
  - Document type (e.g., "Technical Specification", "Bill of Quantities")
  - Requirements count badge (e.g., "5 requirements", "8 requirements")
  - Status badge showing "not started"
  - Empty "Assigned To" field
- **Screenshot:** `06_requirements_matrix.png`

### 7. Expand and View Requirements
- **Click** expand icon (chevron) on first table row
- **Verify** row expands to show requirements list
- **Verify** each requirement displays:
  - Requirement text (e.g., "Must describe construction methodology")
  - Priority badge ("mandatory" or "optional")
  - Source reference (e.g., "Section 3.1, Page 5")
- **Count** requirements in expanded row (should be 5-8)
- **Screenshot:** `07_requirements_expanded.png`

### 8. Edit Requirement
- **Locate** edit icon/button on first requirement in expanded row
- **Click** edit button
- **Modify** requirement text to: "Updated: Must describe construction methodology with timeline"
- **Save** changes
- **Verify** updated text appears in requirement list
- **Screenshot:** `08_requirement_edited.png`

### 9. Verify Edit Persistence
- **Refresh** browser page
- **Wait** for page to reload
- **Click** expand icon on same document row
- **Verify** edited requirement text persists (shows updated text)
- **Screenshot:** `09_edit_persisted.png`

### 10. Delete Requirement
- **In expanded row**, locate delete icon on a different requirement
- **Click** delete icon
- **Verify** requirement is removed from list
- **Verify** requirements count badge decrements
- **Screenshot:** `10_requirement_deleted.png`

### 11. Delete Work Package
- **Collapse** expanded row
- **Locate** delete icon on a work package row
- **Click** delete icon
- **Verify** confirmation dialog appears
- **Click** "Delete" or "Confirm" in dialog
- **Verify** row is removed from table
- **Screenshot:** `11_work_package_deleted.png`

### 12. Test Manual Document Addition
- **Locate** "Add Custom Document" button below matrix
- **Click** "Add Custom Document"
- **Verify** dialog/modal opens
- **Fill** document type field: "Insurance Certificates"
- **Fill** description field (optional): "Required insurance documentation"
- **Click** "Search for Requirements" button
- **Wait** for AI processing (loading indicator)
- **Verify** found requirements appear in dialog (may be 0-5)
- **Screenshot:** `12_manual_document_search.png`

### 13. Save Manual Document
- **Review** found requirements in dialog
- **Click** "Add Document" or "Save" button
- **Verify** dialog closes
- **Verify** new row appears in Document Requirements Matrix
- **Verify** new document shows in table with:
  - Document type: "Insurance Certificates"
  - Requirements count matching found requirements
- **Screenshot:** `13_manual_document_added.png`

### 14. Test Error Handling - Empty Project
- **Navigate** back to dashboard
- **Create** new project: "Empty Project Test"
- **Navigate** to project detail page (without uploading documents)
- **Verify** "Analyze RFT" button is disabled OR shows warning message
- **Screenshot:** `14_empty_project_error.png`

### 15. Final State Verification
- **Navigate** back to first test project
- **Verify** all work packages are still present
- **Count** total work packages (original count - deleted + manually added)
- **Verify** project status shows "in_progress" or similar
- **Screenshot:** `15_final_state.png`

## Success Criteria

✓ **Authentication successful** - User logged in without errors
✓ **Document upload successful** - File uploaded and text extracted
✓ **Analysis triggers correctly** - Button click starts streaming analysis
✓ **Streaming progress visible** - Documents appear progressively during analysis
✓ **8-10 documents identified** - Gemini finds expected document types from RFT
✓ **Requirements Matrix displays** - All work packages shown in table
✓ **Requirements have proper structure** - Each requirement has text, priority, source reference
✓ **Requirements count accurate** - Each document has 5-8 requirements
✓ **Expand/collapse works** - Row expansion shows/hides requirements
✓ **Edit functionality works** - Requirement text can be modified inline
✓ **Edit persists** - Changes survive page refresh
✓ **Delete requirement works** - Individual requirements can be removed
✓ **Delete work package works** - Entire document can be removed with confirmation
✓ **Manual document addition works** - User can add custom documents with AI assistance
✓ **AI requirement extraction works** - Gemini finds relevant requirements for manual documents
✓ **Error handling works** - Empty project shows appropriate error/warning
✓ **No console errors** - Browser console shows no critical errors
✓ **UI responsive** - All components render correctly and are interactive

## Expected Results

- **Project created** with name "Phase 2 RFT Analysis Test"
- **Document uploaded**: sample_rft_construction.txt
- **Analysis completes** in <30 seconds
- **Work packages created**: 8-10 documents
- **Sample documents identified**:
  - Technical Specification
  - Bill of Quantities
  - Project Plan
  - Risk Register
  - Work Health & Safety Plan
  - Quality Assurance Plan
  - Environmental Management Plan
  - Subcontractor List
  - Company Profile
  - Insurance Certificates
- **Each document has**: 5-8 requirements with mandatory/optional priorities
- **Source references included**: Section numbers and page references from RFT
- **Manual document added**: "Insurance Certificates" with found requirements
- **Edit persists** across page refresh
- **Delete operations** successfully remove data

## Notes

- Test uses pre-configured test user (DO NOT create new user)
- RFT fixture is realistic NSW Government construction tender
- Analysis uses Gemini 2.5 Flash (requires valid API key)
- Streaming uses Server-Sent Events (SSE)
- All operations should complete without TypeScript or runtime errors
