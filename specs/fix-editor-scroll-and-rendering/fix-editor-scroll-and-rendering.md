# Plan: Fix Editor Scroll and Markdown Rendering

## Plan Description
Fix two critical UX issues in the document editing workflow (step 4 of 5):
1. **Scrolling Issue**: Currently, entire page scrolls when content is long. The 5-step tabs at top should remain fixed, only editor content should scroll.
2. **Markdown Rendering Issue**: Tables display escape characters (backslashes) before dollar signs and symbols. Need to ensure proper markdown-to-HTML conversion without unwanted escaping.

## User Story
As a proposal writer
I want the step tabs to stay visible while scrolling editor content and tables to render cleanly
So that I can navigate between steps easily and read pricing tables without visual noise

## Problem Statement
**Issue 1 - Page Scroll**: In the work package workflow, the 5-step tabs scroll away when users scroll down to read long documents in the editor. Users lose context and can't easily navigate between steps.

**Issue 2 - Markdown Escaping**: Generated content with tables shows escape characters like `\$` instead of `$` in table cells. The markdown-to-HTML converter (`convertMarkdownToHtml` in `content-editor.tsx`) uses `escapeHtml()` which adds unwanted backslashes before special characters.

## Solution Statement
**Fix 1 - Constrain Editor Scroll**:
- Make workflow tabs/header sticky or fixed position
- Add `overflow-y: auto` to editor container only
- Set explicit heights using flex layout to contain scrolling to editor

**Fix 2 - Remove Unwanted Escaping**:
- Review `escapeHtml()` and `applyInlineFormatting()` in markdown parser
- Ensure HTML entity escaping doesn't double-escape or add backslashes
- Test with tables containing `$`, prices, and special symbols
- Verify turndown (HTML→MD) doesn't introduce escapes on save

## Dependencies
### Previous Plans
None - this is a bug fix for existing functionality

### External Dependencies
- TipTap editor (already installed: @tiptap/react v3.10.2)
- Turndown (already installed: turndown v7.2.2, turndown-plugin-gfm v1.0.2)

## Relevant Files
Use these files to implement the task:

### Core Editor Components
- `app/(dashboard)/work-packages/[id]/page.tsx` - Main workflow page, controls layout structure
  - Contains 5-step workflow with TabsContent for each step
  - Currently has `overflow-auto` on each TabsContent causing full-page scroll
  - Need to adjust flex layout and overflow handling

- `components/workflow-steps/editor-screen.tsx` - Edit step wrapper component
  - Wraps ContentEditor with header/footer buttons
  - Currently uses flex column without height constraints
  - Need to constrain to viewport height for internal scrolling

- `components/workflow-steps/content-editor.tsx` - TipTap editor implementation
  - Contains markdown→HTML conversion logic (`convertMarkdownToHtml`)
  - Has `escapeHtml()` and `applyInlineFormatting()` functions
  - Editor div has `overflow-y-auto` but parent doesn't constrain height
  - **Issue source**: escape logic may be adding unwanted backslashes

- `components/workflow-steps/workflow-tabs.tsx` - Step indicator tabs
  - Should remain visible when scrolling editor
  - Currently part of scrollable page

- `libs/utils/html-to-markdown.ts` - Turndown converter (HTML→MD)
  - Used when saving editor content back to database
  - Verify it doesn't introduce escape characters

### New Files
- `.claude/commands/e2e/test_editor_scroll_rendering_fix.md` - E2E test for both fixes

## Acceptance Criteria
1. ✅ 5-step workflow tabs remain visible (fixed/sticky) when scrolling editor content
2. ✅ Only editor content area scrolls, not entire page
3. ✅ "Continue to Export" and "Back to Generate" buttons remain accessible without scrolling
4. ✅ Tables render without escape characters (`$`, not `\$`)
5. ✅ Prices and currency symbols display cleanly
6. ✅ No regressions in markdown rendering (headings, lists, bold, italic still work)
7. ✅ Editor height adapts to viewport (no fixed pixel heights)
8. ✅ Auto-save continues working after fixes
9. ✅ All E2E tests pass (existing + new)

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Analyze Current Layout and Scrolling Behavior

- Read current CSS classes and layout structure in `page.tsx`
- Identify where `overflow-auto` is applied (currently on TabsContent)
- Review flex layout hierarchy: page → container → tabs → content
- Document current scrolling behavior: entire page scrolls vs desired (editor only)
- Check if workflow tabs use sticky positioning anywhere

### 2. Fix Page-Level Scrolling Architecture

**In `app/(dashboard)/work-packages/[id]/page.tsx`:**
- Change outer container from `flex-col` to use `flex-col h-screen` or `min-h-screen max-h-screen`
- Remove `overflow-auto` from individual TabsContent elements
- Add proper flex sizing: workflow tabs (flex-shrink-0), content area (flex-1 min-h-0)
- Ensure TabsContent receives `className="flex flex-col flex-1 min-h-0"` to enable child scrolling
- Test that layout doesn't break with short content

**In `components/workflow-steps/workflow-tabs.tsx`:**
- Verify TabsList is not inside scrollable area
- Add `flex-shrink-0` to keep tabs always visible
- Test tab switching still works

### 3. Fix Editor Screen Layout

**In `components/workflow-steps/editor-screen.tsx`:**
- Change root div to use `className="flex flex-col h-full"`
- Make header section `flex-shrink-0` so it doesn't scroll
- Ensure ContentEditor receives full remaining height
- Make footer buttons `flex-shrink-0` so they stay in place
- Add `overflow-hidden` to root to prevent outer scroll

### 4. Fix Content Editor Scrolling

**In `components/workflow-steps/content-editor.tsx`:**
- Root div already has `flex-1 min-h-0` - verify this is correct
- Editor toolbar div - add `flex-shrink-0` to prevent it from scrolling
- Editor container div - verify it has `flex-1 min-h-0 overflow-hidden`
- EditorContent component - ensure TipTap's editorProps.attributes.class includes proper overflow handling
- Test with long content (20+ paragraphs) to verify scroll works

### 5. Investigate Markdown Escaping Issue

**In `components/workflow-steps/content-editor.tsx`:**
- Review `escapeHtml()` function (lines 21-25)
  - Currently escapes `&`, `<`, `>` - this is correct for HTML safety
  - Check if it's incorrectly escaping other characters
- Review `applyInlineFormatting()` function (lines 27-33)
  - Applies formatting to already-escaped HTML
  - Ensure regex doesn't match escaped sequences
- Review `parseTable()` function (lines 35-85)
  - Uses `escapeHtml()` on cell content - verify this doesn't double-escape
  - Check table cell content with `$`, `€`, `£`, `¥` symbols
- Add console logs to trace escaping behavior with test input containing `$100`

### 6. Fix Markdown Escape Character Issue

Based on investigation in step 5:
- If `escapeHtml()` is adding backslashes: Remove or fix the escaping logic
- If `applyInlineFormatting()` is the issue: Adjust regex to not match escaped chars
- If `parseTable()` is double-escaping: Apply escapeHtml only once
- Common fix: Ensure only HTML-unsafe chars (`<`, `>`, `&`) are escaped, not `$`, `\`, etc.
- Test fix with markdown input: `| Item | Price |\n|------|-------|\n| Widget | $100 |`
- Verify output HTML: `<td>$100</td>` (not `<td>\$100</td>` or `<td>$100</td>`)

### 7. Verify HTML-to-Markdown Conversion Doesn't Introduce Escapes

**In `libs/utils/html-to-markdown.ts`:**
- Review Turndown configuration (lines 16-23)
- Ensure `strongDelimiter: '**'` doesn't interfere with table cell content
- Test round-trip: MD → HTML → MD with tables containing special chars
- If turndown adds unwanted escapes, configure custom rules to prevent it
- Test auto-save flow: edit table in TipTap → HTML → markdown → saved correctly

---
✅ CHECKPOINT: Steps 1-7 complete (Investigation and Fixes). Continue to step 8.
---

### 8. Create E2E Test File

**Create `.claude/commands/e2e/test_editor_scroll_rendering_fix.md`:**
- Read `.claude/commands/test_e2e.md` for test format
- Read `.claude/commands/e2e/test_editor_scroll_and_tables.md` as template
- Create test steps for:
  1. Verify workflow tabs stay visible when scrolling editor
  2. Verify only editor scrolls, not page
  3. Verify buttons accessible without page scroll
  4. Verify tables render `$100` not `\$100`
  5. Verify other special chars (€, £, ¥, &) render correctly
  6. Verify inline formatting in table cells works
  7. Verify round-trip editing preserves content
- Include screenshot requirements (before/after scrolling, table rendering)
- Add acceptance criteria specific to both fixes

### 9. Test All Other Workflow Steps Don't Regress

- Navigate to Requirements step - verify scrolling if content is long
- Navigate to Strategy step - verify layout not broken
- Navigate to Generate step - verify layout not broken
- Navigate to Export step - verify layout not broken
- Test with short content (< 1 screen) - verify no layout issues
- Test with very long content (20+ screens) - verify scroll works smoothly

### 10. Run All Validation Commands

Execute validation commands per section below to ensure zero regressions

## Testing Strategy
### Unit Tests
No new unit tests required - this is UI/layout fix. E2E tests cover functionality.

### Edge Cases
1. **Short content** - Editor with 1 paragraph, verify layout doesn't break
2. **Very long content** - 50+ paragraphs, verify scroll performance
3. **Large tables** - 20 rows x 10 columns, verify rendering and scroll
4. **Special characters in tables** - `$`, `€`, `£`, `¥`, `&`, `<`, `>`, `"`, `'`
5. **Mixed content** - Headings + tables + lists, verify all render correctly
6. **Browser resize** - Verify layout adapts to different viewport heights
7. **Tab switching** - Scroll editor → switch tab → return, verify scroll position

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# 1. Start dev server
npm run dev

# 2. Run type checking
npm run type-check

# 3. Run linting
npm run lint

# 4. Run build to catch any production issues
npm run build
```

**Manual Testing:**
1. Sign in: test@tendercreator.dev / TestPass123!
2. Open project with generated work package content
3. Navigate to Edit step (step 4/5)
4. Scroll editor content - verify tabs stay visible
5. Verify buttons accessible without page scroll
6. Check table with prices - verify `$100` not `\$100`
7. Switch between all 5 tabs - verify layouts correct
8. Test short and long content edge cases

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!

Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_editor_scroll_rendering_fix.md` test file to validate this functionality works.

**Validation Checklist:**
- [ ] Workflow tabs remain visible when scrolling editor
- [ ] Only editor content scrolls (not page)
- [ ] Buttons accessible without page scroll
- [ ] Tables render `$` correctly (no backslashes)
- [ ] Other special chars render correctly
- [ ] All 5 workflow steps work without layout issues
- [ ] Short and long content both work
- [ ] No console errors
- [ ] Type check passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] E2E test passes

# Implementation log created at:
# specs/fix-editor-scroll-and-rendering/fix-editor-scroll-and-rendering_implementation.log

## Notes

### Root Cause Analysis
**Scrolling Issue**: Parent containers don't constrain height properly. Each TabsContent has `overflow-auto` making the entire page scrollable. Solution: Use flex with `min-h-0` trick and move overflow to editor only.

**Escaping Issue**: The `escapeHtml()` function is likely escaping more than needed, or there's double-escaping happening. HTML entities (`&amp;`, `&lt;`, `&gt;`) are correct, but backslash escaping is wrong. Need to verify exact escaping behavior with test cases.

### Browser Compatibility
- Flex `min-h-0` trick works in all modern browsers
- Sticky positioning has good support (IE excluded, which is fine)
- No new dependencies needed

### Performance Considerations
- Long documents (1000+ paragraphs) may have scroll performance issues with TipTap
- Tables with 100+ rows may render slowly
- Current implementation should be fine for typical tender documents (50-100 pages)

### Alternative Approaches Considered
1. ~~Use `position: sticky` on tabs~~ - Flex approach is cleaner
2. ~~Fixed pixel heights~~ - Doesn't adapt to viewport changes
3. ~~CSS Grid instead of Flexbox~~ - Flex is simpler for this use case

### Related Issues
- Existing E2E test: `.claude/commands/e2e/test_editor_scroll_and_tables.md` covers similar scenarios
- May need to update that test or mark as deprecated after new test is created

## Research Documentation
None required - standard CSS/React layout patterns
