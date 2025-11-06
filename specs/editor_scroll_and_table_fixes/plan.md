# Plan: editor_scroll_and_table_fixes

## Plan Description
Fix two critical blockers in the work package editor: (1) entire page is locked with overflow:hidden on html/body/main making buttons and navigation inaccessible, and (2) tables from AI-generated content render as raw markdown pipe syntax instead of formatted HTML tables. The previous agent's single-page implementation broke page interaction, and table extensions are installed but not working properly.

## Plan Objectives
- Remove problematic overflow locks that prevent page interaction and button clicks
- Restore natural scrolling behavior for the page while keeping editor content scrollable
- Debug and fix table rendering so GFM pipe tables display as proper HTML tables
- Validate both fixes work together with E2E testing

## Problem Statement
Current state has two blockers:
1. **Scroll Lock**: Lines 87-92 in `work-packages/[id]/page.tsx` set `overflow: hidden` on html/body/main, locking the entire page. Users cannot scroll to buttons or click navigation - the page is completely frozen.
2. **Table Rendering**: Despite table extensions being installed (content-editor.tsx lines 5-8), tables still render as raw markdown with pipe characters instead of formatted HTML tables.

## Solution Statement
Remove the overflow locks from page.tsx that freeze the page, allowing natural document flow. Configure the editor container with proper height constraints and overflow-y-auto so only the editor content scrolls. Debug the table parsing logic in convertMarkdownToHtml to ensure GFM tables are properly detected and converted to HTML before TipTap initialization.

## Dependencies

### Previous Plans
- `specs/single_page_editor_layout/plan.md` - Added problematic overflow locks (need to revert)
- `specs/fix_table_rendering_in_editor/plan.md` - Added table extensions but rendering still broken

### External Dependencies
- `@tiptap/extension-table` (already installed)
- `@tiptap/extension-table-row` (already installed)
- `@tiptap/extension-table-header` (already installed)
- `@tiptap/extension-table-cell` (already installed)

## Relevant Files

### Core Files to Modify

- **app/(dashboard)/work-packages/[id]/page.tsx** (lines 77-101)
  - Remove useEffect that sets overflow:hidden on html/body/main
  - Remove height: 100vh lock on body
  - Allow natural page scrolling

- **components/workflow-steps/editor-screen.tsx** (lines 23-46)
  - Update container div to use proper flex layout
  - Remove overflow-hidden that prevents natural scroll
  - Keep editor content area scrollable with max-height constraint

- **components/workflow-steps/content-editor.tsx** (lines 33-88)
  - Debug parseTable function - verify it's being called
  - Check table detection logic in convertMarkdownToHtml main loop
  - Verify table HTML is properly constructed with thead/tbody/tr/th/td
  - Ensure Table extensions are configured correctly (lines 127-136)

- **components/workflow-steps/workflow-tabs.tsx**
  - Review container height/overflow settings
  - Ensure tabs content area allows scrolling

### Files to Read for Context

- **ai_docs/documentation/CONTEXT.md** - Editor UX expectations
- **ai_docs/documentation/PRD.md** - Editing phase requirements
- **.claude/commands/test_e2e.md** - E2E test framework
- **.claude/commands/e2e/test_editor_single_page.md** - Editor test reference

### New Files

- **.claude/commands/e2e/test_editor_scroll_and_tables.md** - E2E test for both fixes

## Acceptance Criteria

1. ✅ Page scrolling works naturally - can scroll entire page up/down
2. ✅ All buttons (Continue to Export, Back to Generate) are clickable and accessible
3. ✅ Navigation and breadcrumbs remain functional
4. ✅ Editor content area scrolls independently when content exceeds viewport
5. ✅ Tables in AI-generated content render as proper HTML `<table>` elements
6. ✅ Table headers display with proper styling (borders, background)
7. ✅ Table cells are properly separated with borders and padding
8. ✅ Table toolbar buttons work (insert table, add/remove rows/columns)
9. ✅ No regressions - non-table content still renders correctly
10. ✅ E2E test validates both scroll behavior and table rendering

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Read Current Implementation

- Read full `app/(dashboard)/work-packages/[id]/page.tsx` to understand current scroll locks
- Read full `components/workflow-steps/editor-screen.tsx` for layout structure
- Read full `components/workflow-steps/content-editor.tsx` to inspect table parsing logic
- Read `components/workflow-steps/workflow-tabs.tsx` for container structure

### 2. Fix Page Scroll Lock

- Open `app/(dashboard)/work-packages/[id]/page.tsx`
- Remove entire useEffect block (lines 77-101) that sets overflow:hidden on html/body/main
- This will restore natural page scrolling
- Verify no other code depends on this useEffect

### 3. Fix Editor Container Layout

- Open `components/workflow-steps/editor-screen.tsx`
- Update container div (line 23):
  - Change from `flex h-full flex-col gap-6 overflow-hidden`
  - To `flex flex-col gap-6` (remove h-full and overflow-hidden)
- This allows natural page flow while editor content remains scrollable

- Open `components/workflow-steps/workflow-tabs.tsx`
- Review TabsContent wrapper - ensure it doesn't force overflow-hidden
- Allow content to flow naturally

### 4. Debug Table Rendering

- Open `components/workflow-steps/content-editor.tsx`
- Add console logging to parseTable function (line 33) to verify it's being called
- Add console logging in main loop where table detection happens (around line 90-100)
- Check if table detection condition is working: `trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')`
- Verify table HTML output structure is correct

### 5. Test Table Parsing Logic

- Create test markdown content with sample table:
  ```markdown
  | Header 1 | Header 2 | Header 3 |
  |----------|----------|----------|
  | Cell 1   | Cell 2   | Cell 3   |
  | Cell 4   | Cell 5   | Cell 6   |
  ```
- Run through convertMarkdownToHtml manually to verify output
- Check that Table extensions are initialized in useEditor config (lines 127-136)
- Verify prose classes include table styling

---
✅ CHECKPOINT: Steps 1-5 complete (Analysis + scroll fixes + table debugging). Continue to step 6.
---

### 6. Fix Table Detection Logic

If tables still not rendering, investigate and fix:
- Ensure separator line detection handles various dash patterns (---, :--:, etc.)
- Check that empty leading/trailing pipes are handled correctly
- Verify escapeHtml and applyInlineFormatting don't break table structure
- Ensure parseTable returns valid HTML that TipTap can parse

### 7. Verify Table Extensions Configuration

- Check TipTap Table extension config in content-editor.tsx
- Ensure Table, TableRow, TableHeader, TableCell are all in extensions array
- Verify HTMLAttributes class for table styling matches Tailwind prose classes
- Check that editor prose classes include table-specific styles

### 8. Manual Testing

- Start dev server: `npm run dev`
- Navigate to work package editor with AI-generated content containing tables
- Verify page scrolls naturally (not frozen)
- Verify all buttons are clickable
- Verify tables render as formatted HTML tables (not raw markdown)
- Test table toolbar controls
- Test scrolling within editor content area

---
✅ CHECKPOINT: Steps 6-8 complete (Table fixes + manual testing). Continue to step 9.
---

### 9. Create E2E Test File

- Read `.claude/commands/test_e2e.md` for framework structure
- Read `.claude/commands/e2e/test_editor_single_page.md` and `.claude/commands/e2e/test_table_rendering.md` for reference
- Create `.claude/commands/e2e/test_editor_scroll_and_tables.md` covering:
  - Sign in with test credentials
  - Navigate to work package with table content
  - Verify page scrolling works (scroll up/down)
  - Verify buttons are clickable (Continue, Back)
  - Verify tables render as HTML tables
  - Verify table toolbar works
  - Take screenshots at each verification point

### 10. Run Validation Commands

Execute all validation commands listed below

## Validation Commands

Execute every command to validate the task works correctly.

```bash
# 1. Verify overflow locks removed from page.tsx
! grep -n "overflow.*hidden" app/\(dashboard\)/work-packages/\[id\]/page.tsx

# 2. Verify Table extensions still configured
grep -A 10 "Table\.configure" components/workflow-steps/content-editor.tsx

# 3. Check parseTable function exists and is used
grep -n "parseTable" components/workflow-steps/content-editor.tsx

# 4. Build check (no TypeScript errors)
npm run build

# 5. Lint check
npm run lint
```

**E2E Testing:**
- Read `.claude/commands/test_e2e.md`
- Execute `.claude/commands/e2e/test_editor_scroll_and_tables.md` test workflow
- Sign in with: test@tendercreator.dev / TestPass123!
- Capture screenshots for: page scroll, button clicks, table rendering, toolbar actions

# Implementation log created at:
# specs/editor_scroll_and_table_fixes/editor_scroll_and_table_fixes_implementation.log

## Notes

### Scroll Fix Strategy
Removing overflow:hidden from html/body/main allows natural document flow. Editor content area has its own overflow-y-auto for long documents. This is standard pattern - don't lock entire page, only scroll containers within page.

### Table Rendering Debug Checklist
- Table detection regex working?
- Separator line parsing correct?
- HTML structure valid (table > thead > tr > th)?
- TipTap extensions loaded?
- Prose classes include table styles?

### Testing Focus
Both fixes must work together:
- Can scroll page AND editor content
- Can click buttons while tables render properly
- No regressions to other markdown elements

## Research Documentation
None required - debugging existing implementation
