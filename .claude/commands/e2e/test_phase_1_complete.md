# Phase 1 E2E Test: Core Schema & Project Structure

## User Story

As a user completing Phase 1 implementation testing, I want to verify that the foundational features work correctly: authentication, organization setup, document uploads with text extraction, project CRUD operations, and UI components matching TenderCreator design.

## Test Configuration

- **Test Name:** phase_1_complete
- **Application URL:** http://localhost:3000
- **Test User:** test@tendercreator.dev / TestPass123!
- **Test Fixtures:**
  - RFT Document: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
  - Company Document: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_company_doc.pdf`

## Test Steps

### Step 1: Authentication & Landing
1. Navigate to http://localhost:3000
2. Click "Sign In" or navigate to /signin
3. Sign in using email/password authentication
   - Email: test@tendercreator.dev
   - Password: TestPass123!
4. **Verify:** Successfully redirected to /projects dashboard
5. **Verify:** Header shows organization name "Test Organization"
6. **Verify:** User avatar/menu visible in header
7. Take screenshot: `01_authenticated_dashboard.png`

### Step 2: Organization Document Upload
1. Navigate to /settings/documents (via sidebar or direct URL)
2. **Verify:** Page title shows "Organization Documents" or similar
3. **Verify:** File upload component visible with drag-drop zone
4. Upload company document using absolute path: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_company_doc.pdf`
5. Wait for upload progress indicator to complete (may take 10-20 seconds for text extraction)
6. **Verify:** Document appears in document list table
7. **Verify:** Document shows: name, file type (PDF), file size, uploaded date
8. **Verify:** Delete button visible for the uploaded document
9. Take screenshot: `02_org_document_uploaded.png`

### Step 3: View Organization Documents List
1. Still on /settings/documents page
2. **Verify:** At least one document visible in the list (uploaded in Step 2)
3. **Verify:** Document list table has columns: Name, Type, Size, Uploaded Date, Actions
4. **Verify:** UI matches clean table design (proper spacing, borders, readable text)
5. Take screenshot: `03_org_documents_list.png`

### Step 4: Create New Project
1. Navigate to /projects (via sidebar or direct URL)
2. **Verify:** Projects page shows "Create Project" button or similar
3. Click "Create Project" button or navigate to /projects/new
4. **Verify:** Form visible with fields: Project Name, Client Name, Deadline
5. Fill in form:
   - Project Name: "NSW Infrastructure RFT Test"
   - Client Name: "NSW Government"
   - Deadline: (select a future date, e.g., 30 days from today)
6. Click Submit/Create button
7. **Verify:** Redirected to project detail page or projects list
8. **Verify:** New project "NSW Infrastructure RFT Test" appears in project list
9. Take screenshot: `04_project_created.png`

### Step 5: View Projects List
1. Navigate to /projects page (if not already there)
2. **Verify:** Projects displayed in card grid layout (3 columns)
3. **Verify:** Project card shows: project name, client name, status indicator
4. **Verify:** Card design matches TenderCreator style (rounded corners, shadow, padding)
5. **Verify:** At least the newly created project "NSW Infrastructure RFT Test" is visible
6. Take screenshot: `05_projects_list_view.png`

### Step 6: Open Project Detail Page
1. Click on the "NSW Infrastructure RFT Test" project card
2. **Verify:** Navigated to /projects/{id} page
3. **Verify:** Page shows project metadata: name, client, deadline, status
4. **Verify:** File upload component visible for RFT documents
5. **Verify:** "Analyze RFT" button visible (may be disabled - Phase 2 feature)
6. **Verify:** Document list section visible (empty initially)
7. Take screenshot: `06_project_detail_empty.png`

### Step 7: Upload Primary RFT Document
1. Still on project detail page
2. Upload RFT document using absolute path: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
3. Wait for upload progress and text extraction to complete (10-20 seconds)
4. **Verify:** Document appears in project documents list
5. **Verify:** Document shows: name, type (PDF), size, uploaded date
6. **Verify:** "Primary RFT" badge or checkbox visible and can be toggled
7. Mark document as "Primary RFT" (if not automatically marked)
8. **Verify:** Primary RFT indicator visible (badge, checkmark, or highlighted)
9. Take screenshot: `07_rft_document_uploaded.png`

### Step 8: Upload Additional Project Document
1. Still on project detail page
2. Upload the company document again as an additional project document: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_company_doc.pdf`
3. Wait for upload to complete
4. **Verify:** Two documents now visible in project documents list
5. **Verify:** Only one marked as "Primary RFT"
6. **Verify:** Both documents show proper metadata
7. Take screenshot: `08_multiple_project_documents.png`

### Step 9: Test Document Deletion
1. Still on project detail page with 2 documents
2. Click delete button on the second document (sample_company_doc.pdf)
3. Confirm deletion if prompted
4. **Verify:** Document removed from list
5. **Verify:** Only primary RFT document remains
6. Take screenshot: `09_document_deleted.png`

### Step 10: Navigate to Organization Settings
1. Navigate to /settings (via sidebar)
2. **Verify:** Settings page displays organization name "Test Organization"
3. **Verify:** Settings form visible with fields like "Default Tone" or other org settings
4. **Verify:** Save button visible
5. **Verify:** Layout matches TenderCreator design (clean, professional)
6. Take screenshot: `10_organization_settings.png`

### Step 11: Test Navigation Sidebar
1. **Verify:** Sidebar navigation visible with links:
   - Projects
   - Settings (with submenu or sections: General, Documents, Team)
2. Click through each navigation item
3. **Verify:** Active state styling works (current page highlighted)
4. **Verify:** Each page loads correctly
5. Take screenshot: `11_navigation_sidebar.png`

### Step 12: UI Design Validation
1. Navigate back to /projects page
2. **Verify visual design matches TenderCreator style:**
   - Primary color: Green (#10B981 or similar)
   - Card design: Rounded corners (8px), subtle shadow
   - Typography: Clear hierarchy, readable
   - Spacing: Consistent padding and margins
   - Buttons: Green filled primary, outlined secondary
3. **Verify:** No obvious visual bugs (overlapping text, broken layouts, missing borders)
4. Take screenshot: `12_ui_design_validation.png`

### Step 13: Test Project Deletion (Cleanup)
1. Navigate to /projects page
2. Open project detail for "NSW Infrastructure RFT Test"
3. Find and click "Delete Project" button (may be in overflow menu or bottom of page)
4. Confirm deletion if prompted
5. **Verify:** Redirected to /projects list
6. **Verify:** Project "NSW Infrastructure RFT Test" no longer appears in list
7. Take screenshot: `13_project_deleted.png`

### Step 14: Test Org Document Deletion (Cleanup)
1. Navigate to /settings/documents
2. Click delete button on the uploaded company document
3. Confirm deletion if prompted
4. **Verify:** Document removed from list
5. Take screenshot: `14_org_document_cleanup.png`

### Step 15: Final State Verification
1. Navigate to /projects
2. **Verify:** Application in clean state (test project deleted)
3. **Verify:** No errors in browser console
4. **Verify:** All UI elements rendering correctly
5. Take screenshot: `15_final_clean_state.png`

## Success Criteria

All of the following MUST be true for the test to pass:

✅ **Authentication:**
- User can sign in with email/password
- Successfully redirected to dashboard after sign-in
- Organization name displayed in header

✅ **Organization Documents:**
- Can upload company document (PDF)
- Document appears in list with correct metadata
- Text extraction completes (content_extracted flag in DB)
- Can delete organization document

✅ **Projects:**
- Can create new project with name, client, deadline
- Project appears in card grid layout
- Can view project detail page
- Can delete project

✅ **Project Documents:**
- Can upload RFT document to project
- Can mark document as "Primary RFT"
- Can upload multiple documents to same project
- Can delete project document
- Text extraction works for project documents

✅ **UI/UX:**
- Navigation sidebar works with active states
- All pages load without errors
- Design matches TenderCreator style (green primary, card-based, clean)
- File upload component shows progress/feedback
- Forms validate and show appropriate messages

✅ **Data Integrity:**
- Documents stored in Supabase Storage
- Metadata stored in database
- RLS policies working (user only sees their org data)
- Cascade deletes work (deleting project removes documents)

## Error Scenarios

If ANY of the following occurs, mark the test as FAILED and document the specific error:

❌ Sign-in fails or redirects to wrong page
❌ File upload fails or doesn't show in list
❌ Text extraction fails (document shows but no extracted text)
❌ Project creation fails or validation errors not shown
❌ Navigation broken (404s, blank pages)
❌ UI significantly different from TenderCreator design
❌ Delete operations fail or leave orphaned data
❌ Console errors related to functionality (ignore non-critical warnings)
❌ RLS policy errors (user sees other org's data)
❌ TypeScript or build errors visible in UI

## Notes

- Text extraction may take 10-20 seconds per document (Gemini API call)
- If upload appears stuck, wait up to 30 seconds before marking as failure
- Verify database state if deletions fail (check Supabase dashboard)
- This test validates ALL Phase 1 acceptance criteria from phase_1_plan.md
- Screenshot naming: `{step_number}_{descriptive_name}.png`
