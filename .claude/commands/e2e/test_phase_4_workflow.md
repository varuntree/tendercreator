# E2E Test: Phase 4 Single Document Workflow

Test complete work package workflow from requirements to export.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## User Story

As a tender response team member
I want to complete a full document workflow
So that I can generate, edit, and export professional tender documents

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Prerequisites

- Dev server running at http://localhost:3000
- Test project exists with analyzed work packages (from Phase 2/3 tests)
- Test organization with uploaded documents
- At least one work package with extracted requirements

## Test Steps

### 1. Navigate to Work Package

**Steps:**
- Open browser to http://localhost:3000
- Sign in as test user (test@tendercreator.dev / TestPass123!)
- Navigate to Projects page
- Click on existing test project
- Find work package card with status "Not Started" or "In Progress"
- Click "Open" button on work package card
- **Verify** URL is `/work-packages/[id]`

**Expected:**
- Work package detail page loads
- 5 tabs visible: Requirements, Strategy, Generate, Edit, Export
- Requirements tab is active (default)
- No console errors

### 2. Review Requirements

**Steps:**
- **Verify** Requirements tab shows:
  - Document type heading (e.g., "Technical Specification")
  - Document description (if present)
  - Total requirement count badge
  - Mandatory requirements section with red badges
  - Optional requirements section with blue badges (if present)
  - Each requirement shows: text, priority badge, source reference
- Count total requirements displayed
- **Verify** "Back to Dashboard" button present
- **Verify** "Continue to Strategy →" button present
- Click "Continue to Strategy →" button

**Expected:**
- All requirements from Phase 2 analysis displayed correctly
- Priority badges correct (mandatory=red, optional=blue)
- Source references shown
- Navigation to Strategy tab works

### 3. Generate Win Themes

**Steps:**
- **Verify** Strategy tab is now active
- **Verify** page shows "Strategy & Planning" heading
- **Verify** "Generate Win Themes" button visible (or themes already exist)
- If themes don't exist:
  - Click "Generate Win Themes" button
  - **Verify** loading state appears (spinner + "Generating..." text)
  - Wait for generation to complete (10-30 seconds)
  - **Verify** 3-5 win themes displayed
- If themes already exist:
  - **Verify** themes displayed in editable list
- **Verify** each theme has edit and delete buttons
- **Verify** "Add Win Theme" button present
- **Verify** "Continue to Generation →" button enabled

**Expected:**
- API call to `/api/work-packages/[id]/win-themes` succeeds (check Network tab)
- Win themes are contextually relevant to document type
- Themes reference organization capabilities or RFT requirements
- No generic/boilerplate themes
- Toast notification shows "Win themes generated successfully"

### 4. Edit Win Theme (Optional Validation)

**Steps:**
- Click edit icon on first win theme
- Input field appears with theme text
- Modify text slightly (e.g., add "enhanced" or "improved")
- Click check/save button
- **Verify** change persists (text updates in display)
- Click "Continue to Generation →" button

**Expected:**
- Inline editing works smoothly
- Changes saved without API call (local state only until next screen)
- Navigation to Generate tab works

### 5. Generate Document Content

**Steps:**
- **Verify** Generate tab is active
- **Verify** summary card shows:
  - Document type name
  - Requirement count badge
  - Win themes count badge
  - "Estimated generation time: 2-3 minutes" message
- Click "Generate Content" button
- **Verify** loading animation appears
- **Verify** loading message shows "Generating [document_type]..."
- Wait for generation to complete (30-120 seconds - this is the long one!)
- **Verify** success message appears with green checkmark
- **Verify** auto-redirect message "Redirecting to editor..."
- Wait for auto-navigation to Edit tab (2 seconds)

**Expected:**
- API call to `/api/work-packages/[id]/generate-content` succeeds (check Network tab)
- Work package status updates to 'in_progress' (check database or dashboard)
- Generated content is comprehensive (>500 words expected)
- Content addresses requirements
- Content incorporates win themes
- Auto-navigation to Edit tab works after 2 seconds

### 6. Test Editor Functionality

**Steps:**
- **Verify** Edit tab is active
- **Verify** "Edit Document" heading visible
- **Verify** TipTap editor displays generated content
- **Verify** content rendered with proper formatting:
  - Headings displayed as headings
  - Bold text is bold
  - Lists show as bullet/numbered lists
  - Paragraphs properly spaced
- **Verify** editor toolbar visible with buttons:
  - Undo / Redo
  - Heading dropdown
  - Bold, Italic
  - Bullet list, Numbered list
  - Remove formatting
- **Verify** word count displayed at top right
- **Verify** save status shows "Saved"
- Click into editor, scroll to end of document
- Type new paragraph: "This is a test addition to verify editing works."
- **Verify** text appears in editor
- Click Bold button on toolbar
- Type "bold text"
- **Verify** text is bolded
- Wait 5 seconds (for auto-save)
- **Verify** save status changes to "Saving..." then "Saved"
- Check Network tab for PUT request to `/api/work-packages/[id]/content`

**Expected:**
- Editor renders markdown correctly
- All formatting preserved from generation
- Typing works smoothly (no lag)
- Toolbar buttons work
- Bold formatting applies correctly
- Auto-save executes after 500ms debounce
- No console errors
- Save status indicator updates correctly

### 7. Navigate to Export

**Steps:**
- **Verify** "Continue to Export →" button visible in top-right
- Click "Continue to Export →" button
- **Verify** Export tab is active
- **Verify** export screen shows:
  - "Export Document" heading
  - Document type display
  - Word count badge (if available)
  - Last updated timestamp
  - "Export Format: Microsoft Word (.docx)" indicator
  - Large "Export as Word Document" button

**Expected:**
- Navigation to export tab works
- Export screen displays metadata correctly
- Export button is enabled
- UI looks professional

### 8. Export to Word Document

**Steps:**
- Click "Export as Word Document" button
- **Verify** loading state appears (button shows spinner)
- Wait for export to complete (5-15 seconds)
- **Verify** success screen appears with:
  - Green checkmark icon
  - "Document Exported Successfully!" message
  - "Download Again" button (optional)
  - "Back to Dashboard" button
- **Verify** file download initiated automatically
- Check Downloads folder for .docx file
- **Verify** filename format: `[Document_Type]_[Project_Name].docx`
- Open .docx file in Microsoft Word or Preview
- **Verify** content is present
- **Verify** formatting preserved:
  - Headings are styled as Heading 1, 2, 3
  - Bold text is bold
  - Lists render as lists
  - Paragraphs have proper spacing

**Expected:**
- API call to `/api/work-packages/[id]/export` succeeds (check Network tab)
- Work package status updates to 'completed' (verify in database or dashboard later)
- Word file downloads automatically
- File opens without errors in Word/Preview
- All content present (no truncation)
- Formatting matches editor preview
- Document looks professional and suitable for tender submission

### 9. Return to Dashboard

**Steps:**
- Click "Back to Dashboard" button on export success screen
- **Verify** navigation to project detail page
- Locate the work package card we just completed
- **Verify** work package card shows:
  - Status badge = "Completed" (green)
  - Status has changed from previous state

**Expected:**
- Navigation works correctly
- Status updated in UI
- Dashboard reflects completion accurately

### 10. Verify End-to-End Status Changes

**Steps:**
- Review the workflow we just completed
- Check console logs for any errors
- Review Network tab for failed requests
- Count screenshots captured (if taking screenshots)

**Expected:**
- Initial status: not_started
- After content generation: in_progress
- After export: completed
- No console errors throughout workflow
- All API calls returned 200 status
- Complete workflow executed successfully

## Success Criteria

✓ All workflow tabs accessible and functional
✓ Win themes generation works with relevant output
✓ Content generation produces comprehensive document
✓ Editor renders content correctly with formatting
✓ Editor toolbar functional (tested bold)
✓ Auto-save persists changes (verified via network request)
✓ Export generates valid Word document
✓ Word document preserves formatting
✓ Status transitions correct (not_started → in_progress → completed)
✓ No console errors during workflow
✓ All API calls succeed
✓ User can complete full workflow without issues

## Known Issues / Limitations

- AI action menu not implemented in MVP (expand, shorten, add evidence, etc.)
- Custom instruction action not available
- Compliance check not available
- Manual save button not present (auto-save only)
- No warning on navigate with unsaved changes
- No collaborative editing
- Export format limited to Word only (no PDF)

## Troubleshooting

**If win themes generation fails:**
- Check Gemini API key is configured
- Check organization has uploaded documents
- Check project has RFT documents uploaded
- Check console for API errors

**If content generation fails:**
- Verify win themes exist
- Check context size estimate in console logs
- Verify all documents have content_extracted = true
- Check Gemini API rate limits

**If editor doesn't load:**
- Check TipTap dependencies installed
- Check browser console for errors
- Try hard refresh (Cmd+Shift+R)

**If export fails:**
- Check content exists in work_package_content table
- Check Supabase Storage 'documents' bucket exists
- Check file permissions

**If status doesn't update:**
- Check work_packages table in database
- Refresh dashboard page
- Check API responses in Network tab
