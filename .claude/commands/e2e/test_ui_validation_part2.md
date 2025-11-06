# E2E Test: UI Validation Part 2 - Error Handling & Empty States

Test error handling, empty states, and animations work correctly.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue, then restart from step 1. Iterate until ALL steps pass.

## User Story

As a user
I want helpful empty states when no data exists
And clear error messages when something goes wrong
And smooth animations that feel professional
So that I understand the app state and have confidence in the product

## Test Steps

### Empty State - No Projects

1. Sign in as test@tendercreator.dev / TestPass123!
2. Navigate to `/projects`
3. If projects exist, note them (we'll test with fresh user or verify in code)
4. Take screenshot: `01_projects_list.png`

### Empty State Code Verification - Projects

5. Read `app/(dashboard)/projects/page.tsx`
6. **Verify** empty state component exists for zero projects
7. **Verify** empty state includes:
   - Icon (FolderOpen or similar)
   - Heading: "No projects yet" or similar
   - Description explaining next steps
   - CTA button: "Create Project"
8. Take screenshot of code: `02_empty_state_code_verification.png`

### Empty State - No Work Packages

9. Create new project: "Empty State Test Project"
10. Do NOT upload RFT or analyze
11. Navigate to project details page
12. **Verify** empty state displays for work packages
13. **Verify** empty state includes:
    - Icon
    - Message: "Analysis pending" or "No work packages yet"
    - Description explaining what to do
    - CTA: "Analyze RFT" or "Upload RFT" guidance
14. Take screenshot: `03_empty_work_packages.png`

### Empty State - No Organization Documents

15. Navigate to organization/company documents page
16. If documents exist, note them
17. **Verify** empty state exists in code (read component file)
18. **Verify** empty state includes:
    - Upload icon
    - Message: "No company documents" or similar
    - Description explaining purpose of org documents
    - CTA: "Upload Documents"
19. Take screenshot: `04_empty_org_documents.png` (or code screenshot)

### Error Handling - File Upload Invalid File

20. Navigate to project document upload
21. Create temporary text file: `echo "invalid" > /tmp/test_invalid.txt`
22. Attempt to upload `/tmp/test_invalid.txt` as RFT (if .txt not allowed)
23. **Verify** error toast/message appears
24. **Verify** error message user-friendly:
    - "Invalid file type. Please upload PDF or Word document." (or similar)
25. **Verify** error dismisses (auto or manual close)
26. Take screenshot: `05_file_upload_error.png`

### Error Handling Code Verification - Network Errors

27. Read error handling utility: `lib/error-handler.ts`
28. **Verify** handleError function exists
29. **Verify** error messages are user-friendly
30. Read API call sites (e.g., content generation, RFT analysis)
31. **Verify** try-catch blocks with error handling
32. Take screenshot of code: `06_error_handling_code.png`

### Error Handling Code Verification - AI Generation

33. Read content generation component
34. **Verify** error handling on API failure
35. **Verify** user sees error toast
36. **Verify** user can retry generation
37. Take screenshot of code: `07_ai_error_handling_code.png`

### Animations - Page Transitions

38. Navigate between pages:
    - `/projects` → click project → project details page
    - Project details → click work package → work package page
    - Use browser back button
39. **Verify** page transitions smooth (fade in effect)
40. **Verify** no jarring jumps or layout shifts
41. **Verify** animations fast (<300ms)
42. Take screenshot: `08_page_transition.png`

### Animations - Card Hover Effects

43. Navigate to project dashboard with multiple work packages
44. Hover mouse over work package cards
45. **Verify** hover effect triggers (scale or shadow)
46. **Verify** animation smooth
47. **Verify** hover state reverts when mouse leaves
48. Hover over project cards (if on project list)
49. **Verify** consistent hover behavior
50. Take screenshot with hover active: `09_card_hover_effect.png`

### Animations - Button Interactions

51. Click various buttons:
    - Primary action buttons (Create Project, Generate Content)
    - Secondary buttons (Cancel, Back)
52. **Verify** button press effect (scale down on click)
53. **Verify** animation feedback immediate
54. Take screenshot: `10_button_interactions.png`

### Visual Polish - Overall Consistency

55. Navigate through entire application:
    - Projects list
    - Project details
    - Work package workflow (all tabs)
    - Organization settings (if accessible)
56. **Verify** consistent styling across all pages:
    - Same green primary color everywhere
    - Same typography hierarchy
    - Same card styles
    - Same button styles
    - Same spacing rhythm
57. Look for visual inconsistencies:
    - Misaligned elements
    - Inconsistent spacing
    - Color variations
    - Font size mismatches
58. Take screenshots of key pages: `11_projects_consistency.png`, `12_workflow_consistency.png`, `13_dashboard_consistency.png`

### Responsive Behavior Desktop

59. Resize browser window to common desktop sizes:
    - 1920x1080 (full HD)
    - 1366x768 (common laptop)
    - 1440x900 (MacBook)
60. **Verify** layout adapts gracefully
61. **Verify** no horizontal scrollbars (unless intentional)
62. **Verify** content readable at all sizes
63. Take screenshots at different sizes: `14_responsive_1920.png`, `15_responsive_1366.png`

### Console Error Check

64. Open browser DevTools console
65. Navigate through entire app flow:
    - Sign in
    - Create project
    - Upload RFT
    - Analyze RFT
    - Open work package
    - Generate win themes
    - Generate content
    - Edit content
    - Export
    - Return to dashboard
    - Bulk export
66. **Verify** zero console errors (red messages)
67. Warnings acceptable if minor
68. Take screenshot of clean console: `16_console_clean.png`

### Performance Check

69. Open browser DevTools Performance tab
70. Record performance during:
    - Page navigation (projects → project details)
    - Card hover interactions
    - Button clicks
71. Stop recording
72. **Verify** no long tasks (>50ms)
73. **Verify** smooth 60fps animations
74. **Verify** no layout thrashing
75. Take screenshot: `17_performance_metrics.png`

### Cross-Browser - Chrome

76. Open app in Chrome (if not already testing in Chrome)
77. Complete basic flow:
    - Sign in
    - Navigate to project
    - Click through work package
    - Generate content
78. **Verify** all features work
79. Take screenshot: `18_chrome_compatibility.png`

### Cross-Browser - Edge

80. Open app in Microsoft Edge
81. Complete same basic flow
82. **Verify** all features work
83. **Verify** styling consistent
84. Take screenshot: `19_edge_compatibility.png`

## Success Criteria

- Empty states implemented for key pages (projects, work packages, org docs)
- Empty states have helpful messaging and CTAs
- Error handling implemented for critical paths
- File upload errors show clear messages
- Error toasts display and dismiss correctly
- AI generation errors handled gracefully (verified in code)
- Page transitions smooth with fade-in effect
- Card hover effects work consistently
- Button press animations provide feedback
- Visual consistency across all pages
- Styling matches TenderCreator reference
- Responsive at desktop sizes (1280px+)
- Zero console errors during normal operation
- Performance smooth (60fps animations)
- Chrome and Edge compatibility validated
- All screenshots captured (19 total)
- Overall polish: professional, not rushed

## Notes

- Mobile responsive NOT required for MVP (desktop demo only)
- Network error simulation optional (verify in code instead)
- AI generation error simulation optional (verify in code instead)
