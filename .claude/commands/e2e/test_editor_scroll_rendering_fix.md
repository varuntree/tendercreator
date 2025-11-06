# E2E Test: Editor Scroll and Markdown Rendering Fix

Validate that (1) workflow tabs remain visible while scrolling editor content, and (2) tables and text render without escape characters like `\$`.

## User Story

As a proposal writer
I want the workflow step tabs to stay visible while scrolling editor content and see prices/special characters render cleanly without backslashes
So that I can navigate between workflow steps easily and read tables without visual noise

## Pre-configured Test User

Use credentials defined in `.claude/commands/test_e2e.md` (test@tendercreator.dev / TestPass123!).

## Prerequisites

- Dev server running at http://localhost:3000
- Test project with at least one work package that has generated content
- Work package should contain tables with prices (dollar signs)
- If no suitable work package exists, create one and generate content

## Test Steps

### 1. Sign In and Navigate to Work Package

- Navigate to http://localhost:3000
- Sign in with test@tendercreator.dev / TestPass123!
- **Verify** redirected to dashboard at `/dashboard`
- Click on any project that contains work packages
- **Verify** project page loads with work packages list
- Click "Open" on a work package with generated content (or generate content if needed)
- **Verify** URL pattern `/work-packages/[id]` is loaded
- **Verify** 5 workflow tabs are visible at top: Requirements, Strategy, Generate, Edit, Export
- Take Screenshot 1: Work package page with visible workflow tabs

### 2. Navigate to Edit Tab

- Click on "Edit" tab in workflow steps
- **Verify** Edit tab is active (highlighted)
- **Verify** page shows "Edit Document" heading
- **Verify** "Continue to Export" button is visible at top right
- **Verify** Editor toolbar is visible (formatting buttons)
- **Verify** Editor content area is visible
- **Verify** "Back to Generate" button is visible at bottom
- Take Screenshot 2: Edit tab initial state showing all elements

### 3. Test Workflow Tabs Stay Visible When Scrolling

- If editor content is short (< 1 screen), skip to step 4
- Scroll down within the editor content area
- **Verify** workflow tabs (Requirements, Strategy, Generate, Edit, Export) remain visible at top
- **Verify** only the editor content scrolls, not the entire page
- Scroll to bottom of editor content
- **Verify** workflow tabs still visible at top of viewport
- **Verify** "Continue to Export" button is still visible without page scrolling
- Scroll back to top of editor content
- Take Screenshot 3: Editor scrolled down showing tabs still visible

### 4. Test Buttons Remain Accessible

- Without scrolling the page, verify both buttons are visible
- **Verify** "Continue to Export" button is clickable (visible and accessible)
- **Verify** "Back to Generate" button is clickable (visible and accessible)
- Hover over "Continue to Export" button
- **Verify** cursor changes to pointer
- Click anywhere in editor to keep focus on Edit tab
- Take Screenshot 4: Both navigation buttons visible and accessible

### 5. Verify Table Rendering Without Escape Characters

- Look for tables in the generated content (if no tables, this test requires content with tables)
- **Verify** tables render as proper HTML `<table>` elements (not raw markdown with pipes)
- **Verify** table headers have distinct styling (background, borders)
- **Verify** table cells are properly bordered and formatted
- Look for currency symbols or special characters in table cells
- **Verify** dollar signs render as `$` NOT as `\$`
- **Verify** no backslashes visible before special characters ($, €, £, ¥, &)
- Right-click on a table cell and inspect element
- **Verify** HTML shows `<td>$100</td>` NOT `<td>\$100</td>` or escaped entities for $
- Take Screenshot 5: Table showing clean currency rendering

### 6. Verify Other Special Characters Render Correctly

- Look for text containing special characters: `&`, `<`, `>`, `"`, `'`, `$`, `€`, `£`, `¥`
- **Verify** ampersands (&) render correctly in text (not as `\&`)
- **Verify** quotes render correctly (not escaped)
- **Verify** no unwanted backslashes visible in any text
- **Verify** HTML entities (`&amp;`, `&lt;`, `&gt;`) are used for HTML-unsafe chars only
- Take Screenshot 6: Content showing various special characters rendered correctly

### 7. Verify Inline Formatting in Tables Works

- Look for bold, italic, or code formatting in table cells
- **Verify** bold text renders with `<strong>` tags (not literal `**text**`)
- **Verify** italic text renders with `<em>` tags (not literal `_text_` or `*text*`)
- **Verify** inline code renders with `<code>` tags (not literal backticks)
- **Verify** formatting works both in table cells and regular paragraphs
- Take Screenshot 7: Formatted content in tables

### 8. Test Round-trip Editing

- Click in a table cell containing a price like "$100"
- Type " USD" after the price to make it "$100 USD"
- Wait for auto-save status to show "Saving..." then "Saved"
- **Verify** save status shows "Saved" in green
- Refresh the page (F5 or reload button)
- Sign in again if prompted
- Navigate back to same work package Edit tab
- **Verify** edited content persists: "$100 USD" (not "\$100 USD")
- **Verify** no escape characters introduced during save/load cycle
- Take Screenshot 8: Content after round-trip showing clean rendering

### 9. Test All Workflow Tabs Layout

- Click "Requirements" tab
- **Verify** layout looks correct (no overflow issues)
- **Verify** content scrolls within tab if needed
- Click "Strategy" tab
- **Verify** layout looks correct
- Click "Generate" tab
- **Verify** layout looks correct
- Click "Edit" tab again
- **Verify** editor renders correctly after tab switching
- **Verify** workflow tabs remain visible throughout
- Take Screenshot 9: Different workflow tabs showing consistent layout

### 10. Test Edge Cases

- Resize browser window to smaller height (simulate laptop screen)
- **Verify** tabs remain visible at top
- **Verify** editor content still scrolls within available space
- Resize back to normal
- If possible, test with very long content (20+ paragraphs)
- **Verify** scrolling performance is smooth
- **Verify** no layout breaks with long content
- Take Screenshot 10: Edge case testing (small window, long content)

## Success Criteria

1. ✅ Workflow tabs (Requirements, Strategy, Generate, Edit, Export) remain visible at top when scrolling
2. ✅ Only editor content area scrolls, NOT entire page
3. ✅ "Continue to Export" button accessible without page scrolling
4. ✅ "Back to Generate" button accessible without page scrolling
5. ✅ Tables render as proper HTML `<table>` elements
6. ✅ Dollar signs render as `$` NOT `\$`
7. ✅ Other special chars (€, £, ¥, &) render without escape backslashes
8. ✅ No `\` visible before any special characters in rendered content
9. ✅ Inline formatting (bold, italic, code) works in tables and paragraphs
10. ✅ HTML inspection shows clean content: `<td>$100</td>` not `<td>\$100</td>`
11. ✅ Round-trip editing preserves special characters without introducing escapes
12. ✅ Auto-save works correctly after edits
13. ✅ All 5 workflow tabs render correctly without layout issues
14. ✅ Tab switching works smoothly
15. ✅ Layout adapts to browser resize
16. ✅ All 10 screenshots captured successfully

## Expected Screenshots

1. `01_work_package_with_tabs.png` - Work package page showing 5 workflow tabs
2. `02_edit_tab_initial.png` - Edit tab showing all elements (heading, toolbar, editor, buttons)
3. `03_tabs_visible_when_scrolled.png` - Editor scrolled showing tabs remain at top
4. `04_buttons_accessible.png` - Both navigation buttons visible without page scroll
5. `05_table_clean_currency.png` - Table with $ rendering correctly (no backslashes)
6. `06_special_chars_clean.png` - Special characters (€, £, ¥, &) rendering correctly
7. `07_table_formatting.png` - Bold/italic/code formatting in table cells
8. `08_roundtrip_clean.png` - Content after save/reload showing clean rendering
9. `09_all_tabs_layout.png` - Different workflow tabs with consistent layout
10. `10_edge_cases.png` - Edge case testing (window resize, long content)

## Console Checks

During the test, check browser console for:
- `[parseTable]` log messages indicating table detection
- `[convertMarkdownToHtml]` log messages for content processing
- No JavaScript errors related to scrolling or rendering
- No warnings about overflow or layout issues

## Notes

- If work package has no tables, generate content first or use a different work package
- Test with real AI-generated content that may contain escaped characters
- Pay special attention to pricing tables as they commonly use $ symbols
- Verify both markdown-to-HTML (display) and HTML-to-markdown (save) work correctly
- If any escape characters still appear, test failed - investigate the specific location

## Troubleshooting

If tables don't exist in content:
1. Go to Generate tab
2. Click "Generate Content" and wait for completion
3. Return to Edit tab
4. If generated content has no tables, manually add a test table:
   ```
   | Item | Price |
   |------|-------|
   | Widget | $100 |
   | Gadget | €50 |
   ```
5. Save and verify rendering
