# E2E Test: Project UI/UX Redesign

Test the redesigned project UI with table-based work packages and simplified document lists.

## User Story

As a tender response manager
I want streamlined, table-based work package views and efficient document management
So that I can quickly see all work packages in a structured format and manage documents without visual clutter

## Test Steps

### Setup
1. Navigate to `http://localhost:3000`
2. Sign in with test credentials:
   - Email: test@tendercreator.dev
   - Password: TestPass123!
3. Wait for dashboard to load

### Test Document List Simplification
4. Click on "Projects" in sidebar navigation
5. Find and click on an existing project (or create a new one named "UI Redesign Test Project")
6. **Verify** "Uploaded Documents" card is visible
7. Take screenshot: `01_document_list_view.png`
8. **Verify** document list shows only file names (no size, type, date columns)
9. **Verify** documents display with file icon and name only
10. **Verify** empty state shows when no documents ("No documents uploaded yet")

### Test Work Package Table View
11. Scroll down to work packages section
12. **Verify** work packages are displayed in a table format (not cards)
13. Take screenshot: `02_work_package_table.png`
14. **Verify** table has columns: Document Type, Requirements, Assigned To, Status, Actions
15. **Verify** "Requirements" column shows badge with count (e.g., "5 requirements")
16. **Verify** "Status" column shows badge with status (pending/in progress/completed)
17. **Verify** "Assigned To" column shows dropdown selector
18. **Verify** "Actions" column has "Open" button for each row

### Test Work Package Interactions
19. Click on "Assigned To" dropdown for first work package
20. **Verify** dropdown shows options: Unassigned, Admin, Writer A, Writer B
21. Select "Admin" from dropdown
22. **Verify** assignment updates successfully (toast notification appears)
23. Click "Open" button for first work package
24. **Verify** navigation to work package detail page works
25. Take screenshot: `03_work_package_detail.png`
26. Click browser back button to return to project page

### Test Upload Screen Layout
27. Navigate back to project page
28. If project is in setup status, verify upload screen
29. **Verify** upload UI shows two-column layout (left: uploader, right: document list)
30. **Verify** left panel has "Upload RFT Documents" card with file uploader
31. **Verify** right panel has "Uploaded Documents" card with simple document list
32. Take screenshot: `04_upload_layout.png`

### Test Responsive Behavior
33. **Verify** table scrolls horizontally if needed on smaller viewports
34. **Verify** no layout breaks or overlapping content
35. Take screenshot: `05_final_state.png`

## Success Criteria
- Document list displays only file names (simplified)
- Work packages shown in table format (not card grid)
- Table has 5 columns: Document Type, Requirements, Assigned To, Status, Actions
- Requirements shown as badge with count
- Status shown as badge (outline for pending, secondary for in_progress, default for completed)
- Assignment dropdown functional
- Open button navigates correctly
- Upload screen has split-panel layout (left: upload, right: documents)
- All interactions work without errors
- 5 screenshots captured successfully
