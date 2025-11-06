# E2E Test: Editor Scroll and Table Rendering

Validate that (1) page scrolling works naturally with accessible buttons and navigation, and (2) tables from AI-generated content render as proper HTML tables instead of raw markdown.

## User Story

As a proposal writer
I want to scroll the page naturally and see tables rendered properly
So that I can navigate the editor, click buttons, and work with structured data without wrestling with raw markdown or frozen UI

## Pre-configured Test User

Use credentials defined in `.claude/commands/test_e2e.md` (test@tendercreator.dev / TestPass123!).

## Prerequisites

- Dev server running at http://localhost:3000
- Test project with at least one work package that has generated content containing tables
- Work package ID recorded or accessible from dashboard

## Test Steps

### 1. Sign In and Open Work Package

- Navigate to http://localhost:3000 and sign in with test@tendercreator.dev / TestPass123!
- From the dashboard, open any project that contains work packages
- Click the "Open" action on a work package with generated content
- **Verify** URL pattern `/work-packages/[id]` is loaded
- Take Screenshot 1: Work package page initial state

### 2. Verify Page Scroll Works

- Scroll the page down using mouse/trackpad or keyboard (Page Down)
- **Verify** the page scrolls naturally (not frozen/locked)
- **Verify** you can scroll to see all content on the page
- Scroll back to top
- Take Screenshot 2: Page scrolled down showing scrollable behavior

### 3. Verify Buttons Are Clickable and Accessible

- Navigate to the Edit tab
- **Verify** "Continue to Export" button is visible at the top
- **Verify** "Back to Generate" button is visible at the bottom
- Scroll down to bottom of page if needed
- **Verify** both buttons are clickable (hover shows pointer cursor)
- Click "Continue to Export" button to verify it works
- Go back to Edit tab
- Take Screenshot 3: Edit tab with visible and accessible buttons

### 4. Verify Table Rendering

- In the Edit tab, look for tables in the generated content
- **Verify** tables render as proper HTML `<table>` elements (not raw markdown with pipes)
- **Verify** table headers have distinct styling (background color, borders)
- **Verify** table cells are properly separated with borders
- **Verify** table content is readable and properly formatted
- Right-click on a table and "Inspect Element" to confirm it's an HTML table
- Take Screenshot 4: Rendered table showing proper HTML structure

### 5. Verify Table Toolbar Controls

- Click inside a table cell
- Look at the editor toolbar
- **Verify** table control buttons are visible (Insert Table icon, Row+, Row-, Col+, Col-)
- Click "Row+" to add a new row
- **Verify** a new row is added to the table
- Click "Col+" to add a new column
- **Verify** a new column is added to the table
- **Verify** the table maintains proper formatting after modifications
- Take Screenshot 5: Table with added row/column from toolbar

### 6. Verify Editor Content Scrolling

- Scroll within the editor content area (if content is long enough)
- **Verify** editor content scrolls while toolbar and buttons remain visible
- **Verify** no double scrollbars or layout issues
- Take Screenshot 6: Editor scrolled showing content while UI chrome remains visible

### 7. Regression Checks - Non-Table Content

- Verify headings render properly (no literal `#` symbols)
- Verify bold/italic text renders with proper emphasis (no raw `**` or `_`)
- Verify bullet and numbered lists render as list items
- Type a short sentence to verify editing still works
- Wait for auto-save status: "Saving..." → "Saved"
- Take Screenshot 7: Editor showing mixed content (headings, lists, tables, text)

### 8. Navigation and Interaction Test

- Scroll page to various positions
- Click different tabs (Strategy, Generate, Edit)
- **Verify** tab navigation works smoothly
- Return to Edit tab
- **Verify** content persists and tables still render correctly
- Take Screenshot 8: Final state after navigation test

## Success Criteria

1. ✅ Page scrolling works naturally without being frozen/locked
2. ✅ All buttons (Continue to Export, Back to Generate) are clickable and accessible
3. ✅ Navigation and tabs function properly
4. ✅ Tables render as proper HTML `<table>` elements with proper structure
5. ✅ Table headers display with background color and borders
6. ✅ Table cells are properly separated with borders and readable content
7. ✅ Table toolbar controls work (insert table, add row, add column)
8. ✅ Non-table content still renders correctly (headings, lists, emphasis)
9. ✅ Editor content scrolls independently when needed
10. ✅ Auto-save still works after editing
11. ✅ No regressions in layout or functionality
12. ✅ All 8 screenshots captured successfully

## Expected Screenshots

1. `01_work_package_initial.png` - Work package page loaded
2. `02_page_scrollable.png` - Page scrolled demonstrating scroll works
3. `03_buttons_accessible.png` - Edit tab with visible buttons
4. `04_table_rendered.png` - Table showing proper HTML structure
5. `05_table_toolbar_actions.png` - Table with added row/column
6. `06_editor_content_scroll.png` - Editor scrolled with UI chrome visible
7. `07_mixed_content.png` - Editor showing all content types
8. `08_navigation_final.png` - Final state after navigation

## Console Checks

During the test, check browser console for:
- `[parseTable]` log messages indicating table detection and parsing
- `[convertMarkdownToHtml]` log messages for table processing
- No JavaScript errors related to scrolling or table rendering

## Notes

- If no tables exist in generated content, trigger content generation first or use a work package known to have tables
- Test with various table sizes (2x2, 5x10) if possible
- Verify inline formatting works inside table cells (bold, italic, code)
