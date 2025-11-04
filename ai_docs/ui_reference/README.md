# UI Design Reference

## Purpose
This folder contains screenshots from TenderCreator's existing application (docs.tendercreator.ai) that serve as the **definitive design reference** for our implementation.

## Screenshots Required

### 01_new_tender_screen.png
**Source:** New Tender creation flow from TenderCreator app
**Shows:**
- 5-step progress indicator (1. New Tender → 2. Tender Planning → 3. Tender Outline → 4. Tender Content → 5. Tender Export)
- Form layout for "Tender Document Name"
- Upload sections with dashed borders:
  - Upload Request for Tender (RFT) Documents
  - Specifications / Statement of Work
  - Evaluation Criteria
- Clean, card-based design
- Green primary color scheme
- Typography and spacing patterns

### 02_team_management.png
**Source:** Team management page from TenderCreator app
**Shows:**
- Team Members section with table layout
  - Columns: User, Joined, Role, Actions
  - Search functionality
  - "Invite" button (dark)
  - Role dropdown (Admin)
- Organisation Roles section with three role cards:
  - Admin (CREATOR ROLE badge)
  - Company Admin
  - Company User
  - Permission details per role (Billing, Profile Types, etc.)
- Sidebar navigation visible
- Page header with icon and description

## Usage Instructions

**For ALL UI implementation:**

1. **Open these screenshots BEFORE writing any UI code**
2. **Study the design patterns:**
   - Colors (green primary, gray text/borders)
   - Spacing (padding, margins, gaps)
   - Typography (sizes, weights, line heights)
   - Component styles (buttons, inputs, cards, tables)
   - Icons (style, size, positioning)
   - Layouts (sidebar, content area, breadcrumbs)
3. **Match pixel-perfect:**
   - Rounded corners (appears ~8px)
   - Border colors and widths
   - Shadow styles (subtle)
   - Button styles (filled green, dark gray)
   - Form input styles (border, padding, placeholder)
   - Progress indicator style (numbers, connecting lines)
   - Table design (header row, borders, spacing)
4. **Extract design tokens:**
   - Use color picker to get exact hex values
   - Measure spacing with browser dev tools
   - Identify font families and sizes
5. **Implement with Tailwind CSS classes that replicate the design**

## Design Tokens (Initial Extraction)

### Colors
```css
/* Primary */
--primary-green: #10B981; /* or similar green from screenshots */

/* Text */
--text-primary: #1F2937; /* Dark gray headings/labels */
--text-secondary: #6B7280; /* Medium gray body text */
--text-muted: #9CA3AF; /* Light gray hints/placeholders */

/* Backgrounds */
--bg-white: #FFFFFF;
--bg-gray-50: #F9FAFB;

/* Borders */
--border-gray: #E5E7EB;
--border-dashed: #D1D5DB; /* Dashed upload zones */

/* Roles/Badges */
--badge-green: #10B981; /* CREATOR ROLE badge */
```

### Typography
```css
/* Headings */
--heading-xl: 36px bold; /* Page titles */
--heading-lg: 24px bold; /* Section titles */
--heading-md: 18px semibold; /* Card titles */

/* Body */
--body-base: 14px regular; /* Normal text */
--body-sm: 12px regular; /* Helper text */

/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif; /* or similar */
```

### Spacing
```css
/* Card padding */
--card-padding: 24px;

/* Section gaps */
--section-gap: 32px;

/* Form spacing */
--input-padding-x: 12px;
--input-padding-y: 8px;

/* Grid gaps */
--gap-2: 8px;
--gap-4: 16px;
--gap-6: 24px;
```

### Components
```css
/* Rounded corners */
--radius-sm: 4px; /* Badges, small elements */
--radius-md: 8px; /* Buttons, inputs, cards */
--radius-lg: 12px; /* Large cards */

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);

/* Borders */
--border-width: 1px;
```

## Validation Checklist

Before considering UI implementation complete, verify:

- [ ] Color scheme matches screenshots
- [ ] Spacing/padding matches visual rhythm
- [ ] Typography (sizes, weights) matches
- [ ] Component styles (buttons, inputs, cards) match
- [ ] Icons match style and size
- [ ] Layout (sidebar, header, content area) matches
- [ ] Progress indicators match design
- [ ] Tables match header/row styling
- [ ] Upload zones have dashed borders like reference
- [ ] Role badges match style
- [ ] No custom design elements introduced
- [ ] Overall feel: "This looks like TenderCreator"

## Adding New Screenshots

As you discover more screens from docs.tendercreator.ai:

1. Save screenshot as `03_[screen_name].png`
2. Update this README with description
3. Reference in relevant PRD sections

**Current count:** 2 screenshots (need to add actual image files)

---

**Remember:** The goal is seamless integration with TenderCreator's existing product. Our UI should be indistinguishable from theirs - same design language, same patterns, same polish.
