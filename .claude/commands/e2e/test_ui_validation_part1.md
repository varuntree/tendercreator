# E2E Test: UI Validation Part 1 - Design Tokens & Loading States

Test that Phase 6 design token application matches TenderCreator UI and loading states work correctly.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## User Story

As a user
I want consistent TenderCreator design applied across dashboard
And clear loading feedback during async operations
So that the app feels professional and I understand what's happening

## Test Steps

### Landing Page Validation

1. Navigate to `http://localhost:3000`
2. Take screenshot: `01_landing_page.png`
3. Inspect styles in browser DevTools:
   - Check primary color (should NOT be TenderCreator green if different)
   - Check typography (should be landing page fonts)
   - Check button styles (should be landing page buttons)
4. Click any landing page link/button
5. **Verify** navigation works
6. **Verify** no visual glitches
7. Take screenshot: `02_landing_page_interaction.png`

### Layout Routing Validation

8. Sign in with test@tendercreator.dev / TestPass123!
9. After sign in, navigate to `/projects`
10. Take screenshot: `03_projects_page_layout.png`
11. **Verify** marketing nav bar NOT visible
12. **Verify** marketing footer NOT visible
13. **Verify** dashboard sidebar IS visible (if implemented)
14. **Verify** dashboard header IS visible (if implemented)
15. Navigate to landing page (click logo or `/`)
16. **Verify** marketing nav bar reappears
17. Take screenshot: `04_back_to_landing_layout.png`

### Design Tokens - Colors

18. Navigate to `/projects`
19. Take screenshot: `05_projects_page_colors.png`
20. Inspect primary button or active element:
    - Use browser color picker on primary button
    - **Verify** green color matches TenderCreator (`#10B981` or close)
21. Inspect text colors:
    - Heading text should be dark gray (`#1F2937` or close)
    - Body text should be medium gray (`#6B7280` or close)
    - Muted text should be light gray (`#9CA3AF` or close)
22. Inspect card backgrounds:
    - Should be white or light gray
    - Borders should be light gray (`#E5E7EB` or close)
23. Take screenshot: `06_color_validation_devtools.png` (with DevTools open showing colors)

### Design Tokens - Typography

24. On `/projects` page, inspect typography:
    - Page title font size (should be large, ~24-36px)
    - Card title font size (should be medium, ~18px)
    - Body text font size (should be ~14-16px)
    - Font family (should be Inter or similar sans-serif)
25. **Verify** font weights:
    - Headings bold (700) or semibold (600)
    - Body text regular (400)
26. Take screenshot: `07_typography_validation.png`

### Design Tokens - Spacing & Components

27. Inspect card padding (should be ~24px)
28. Inspect section spacing (should be ~32px between sections)
29. Inspect border radius (should be ~8px on cards/buttons)
30. **Verify** card hover effects work (if implemented):
    - Hover over project card or work package card
    - **Verify** subtle scale or shadow effect
31. Take screenshot: `08_spacing_and_hover.png`

### Loading State - Project Creation

32. Navigate to `/projects`
33. Open browser console (watch for errors)
34. Click "Create Project" button
35. Fill minimal required fields: "Test Project UI Validation"
36. Click "Create" or "Save"
37. **Verify** loading spinner appears immediately
38. **Verify** loading text displayed: "Creating project..." (or similar)
39. **Verify** button disabled during loading
40. Wait for project creation to complete
41. **Verify** loading spinner disappears
42. **Verify** success message or navigation to project page
43. Take screenshot: `09_project_creation_loading.png` (capture while loading if possible)

### Loading State - RFT Upload

44. Navigate to newly created project
45. Locate file upload area for RFT documents
46. Upload file: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
47. **Verify** loading state during upload (spinner or progress indicator)
48. Wait for upload to complete
49. **Verify** file appears in list
50. **Verify** success toast or message
51. Take screenshot: `10_file_upload_loading.png`

### Loading State - RFT Analysis

52. On project details page with uploaded RFT
53. Click "Analyze RFT" button
54. **Verify** loading state appears immediately
55. **Verify** loading message: "Analyzing RFT..." or similar
56. **Verify** button disabled during analysis
57. **Verify** loading overlay or prominent spinner (this is 30-60s operation)
58. Wait for analysis to complete (30-60 seconds)
59. Take screenshot during loading: `11_rft_analysis_loading.png`
60. **Verify** loading dismisses when complete
61. **Verify** work packages appear
62. Take screenshot after completion: `12_rft_analysis_complete.png`

### Loading State - Win Themes Generation

63. Open any work package (navigate to `/work-packages/[id]`)
64. Navigate to Strategy tab
65. Click "Generate Win Themes" button
66. **Verify** loading spinner appears
67. **Verify** button disabled
68. Wait for generation (~10-15 seconds)
69. Take screenshot: `13_win_themes_loading.png`
70. **Verify** themes appear when complete
71. **Verify** loading state dismisses

### Loading State - Content Generation

72. In same work package, navigate to Generation tab
73. Click "Generate Content" button
74. **Verify** loading state appears
75. **Verify** loading message: "Generating content... This may take 1-2 minutes." or similar
76. **Verify** button disabled
77. Wait for generation (30-90 seconds)
78. Take screenshot during loading: `14_content_generation_loading.png`
79. **Verify** content appears in editor
80. **Verify** loading dismisses
81. Take screenshot: `15_content_generation_complete.png`

### Loading State - Export Operations

82. In work package, navigate to Export tab
83. Click "Export as Word" button
84. **Verify** loading spinner appears
85. **Verify** button disabled
86. Wait for export (~5 seconds)
87. **Verify** file downloads
88. **Verify** loading dismisses
89. **Verify** success message
90. Take screenshot: `16_export_loading.png`

### Loading State - Bulk Export

91. Return to project dashboard
92. If multiple work packages completed, click "Export All Completed" button
93. **Verify** progress modal appears: "Exporting X documents..."
94. Wait for bulk export
95. **Verify** ZIP downloads
96. **Verify** modal dismisses
97. Take screenshot: `17_bulk_export_loading.png`

## Success Criteria

- Landing page unaffected by dashboard styling
- Dashboard pages use TenderCreator design tokens
- Color palette matches reference (`#10B981` primary green)
- Typography matches reference (Inter font, proper hierarchy)
- Spacing and component styles match reference (~8px radius, ~24px padding)
- Layout routing correct (no nav/footer in dashboard)
- All loading states appear immediately on action trigger
- All loading states show descriptive messages
- All buttons disabled during loading
- All loading states dismiss on completion
- No console errors during testing
- All screenshots captured (17 total)
- Smooth transitions between states
- Page load: <2s initial, <500ms navigation
- Loading state appears: <100ms after button click
- Animations smooth (no jank)
- No layout shifts during loading/completion
