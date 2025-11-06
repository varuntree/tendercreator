# E2E Test: UI Foundation - Navbar & Sidebar

Test navbar and sidebar navigation components match reference design exactly.

## User Story

As a user
I want a professional navigation interface
So that I can easily access all sections of the application

## Test Steps

1. Navigate to `http://localhost:3000/signin`
2. Sign in with test credentials (test@tendercreator.dev / TestPass123!)
3. Wait for redirect to `/projects`
4. Take screenshot: `01_initial_dashboard.png`

### Navbar Verification

5. **Verify** navbar is present at top
6. **Verify** navbar height approximately 64px
7. **Verify** navbar has white background with bottom border
8. **Verify** home icon present on left side (house icon)
9. **Verify** user avatar present on right side with first letter "T"
10. Click user avatar
11. Take screenshot: `02_user_dropdown.png`
12. **Verify** dropdown menu shows "Sign out" option
13. Press Escape to close dropdown

### Sidebar Verification

14. **Verify** sidebar present on left side
15. **Verify** sidebar width approximately 256px
16. **Verify** "Tender Creator" logo at top with green icon
17. **Verify** "Create new tender" button below logo (green background, white text)
18. **Verify** all navigation items present:
    - Home
    - Company
    - Tenders
    - Team
    - Billing
    - Settings
    - Useful Resources
    - Documentation
19. **Verify** each nav item has an icon (20px size)
20. **Verify** current page (Tenders/Projects) has active state:
    - Light green background (emerald-50)
    - Green text (emerald-600)
    - Left border (3-4px green)
21. Take screenshot: `03_sidebar_tenders_active.png`

### Navigation Testing

22. Click "Home" nav item
23. **Verify** URL changes or page updates
24. **Verify** Home item now has active state styling
25. Take screenshot: `04_sidebar_home_active.png`

26. Click "Settings" nav item
27. **Verify** navigation to `/settings`
28. **Verify** Settings item now has active state styling
29. Take screenshot: `05_sidebar_settings_active.png`

30. Click "Documents" nav item (if present) or navigate to `/settings/documents`
31. **Verify** navigation successful
32. **Verify** Settings still shows active (parent route)
33. Take screenshot: `06_settings_documents_active.png`

### Hover Testing

34. Hover over "Team" nav item
35. **Verify** hover effect appears (light gray background)
36. Take screenshot: `07_nav_item_hover.png`

### Collapse Functionality

37. Scroll to bottom of sidebar
38. **Verify** collapse button present (ChevronLeft icon)
39. Click collapse button
40. Wait 300ms for animation
41. **Verify** sidebar width reduced to approximately 80px
42. **Verify** text labels hidden
43. **Verify** icons still visible
44. **Verify** "Create new tender" button shows only icon
45. Take screenshot: `08_sidebar_collapsed.png`

46. Hover over collapsed nav item
47. **Verify** tooltip or title appears with label text
48. Take screenshot: `09_sidebar_collapsed_hover.png`

49. Click collapse button again (now expand button, ChevronRight icon rotated)
50. Wait 300ms for animation
51. **Verify** sidebar expands back to 256px
52. **Verify** text labels visible again
53. Take screenshot: `10_sidebar_expanded.png`

### Create Button Testing

54. Click "Create new tender" button
55. **Verify** navigation to `/projects/new`
56. Take screenshot: `11_create_tender_page.png`

### Logo Testing

57. Click "Tender Creator" logo at top of sidebar
58. **Verify** navigation to `/projects`
59. Take screenshot: `12_back_to_projects.png`

### State Persistence

60. Collapse sidebar (if expanded)
61. Refresh page (F5 or reload)
62. Wait for page load
63. **Verify** sidebar remains collapsed after refresh
64. Take screenshot: `13_collapsed_persisted.png`

65. Expand sidebar
66. Refresh page again
67. **Verify** sidebar remains expanded after refresh
68. Take screenshot: `14_expanded_persisted.png`

### Responsive Checks

69. Resize browser window to 1280px width
70. **Verify** layout still intact
71. Take screenshot: `15_responsive_1280.png`

72. Resize browser window to 1024px width
73. **Verify** no horizontal scroll
74. **Verify** sidebar still functional
75. Take screenshot: `16_responsive_1024.png`

### Color Verification

76. Navigate back to `/projects`
77. Open browser DevTools
78. Inspect "Create new tender" button
79. **Verify** background color is #10B981 or rgb(16, 185, 129)
80. Take screenshot: `17_button_color_inspect.png`

81. Inspect active nav item (should be Tenders/Home)
82. **Verify** active background is emerald-50 or similar light green
83. **Verify** active text color is emerald-600 or #10B981
84. **Verify** left border is 3-4px solid emerald-600
85. Take screenshot: `18_active_state_inspect.png`

## Success Criteria

- Navbar present with correct height, home icon, user avatar
- Sidebar present with correct width (256px expanded, 80px collapsed)
- Logo and "Create new tender" button styled correctly (green #10B981)
- All 8+ nav items present with icons
- Active state shows green highlight + left border
- Hover state shows gray background
- Collapse/expand functionality works smoothly
- State persists after page refresh (localStorage)
- All routing works (clicking nav items navigates correctly)
- User dropdown functional
- No console errors
- 18+ screenshots captured
