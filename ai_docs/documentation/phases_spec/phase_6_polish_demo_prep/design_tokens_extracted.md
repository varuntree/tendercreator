# Extracted Design Tokens - TenderCreator UI

## Source Screenshots
- ui1.png: Team page (table layout, sidebar, badges)
- ui2.png: New Tender page (5-step progress, forms, upload zones)

## Color Palette

### Primary Brand Colors
- **Primary Green**: `#10B981` (teal/emerald green)
  - Used for: Primary buttons, active sidebar items, progress bars, badges
  - Extracted from: "Create new tender" button, progress indicator, "CREATOR ROLE" badge

### Text Colors
- **Heading/Primary Text**: `#1F2937` (dark gray, almost black)
- **Body Text**: `#4B5563` (medium gray)
- **Muted/Secondary Text**: `#6B7280` (light gray)
- **Placeholder Text**: `#9CA3AF` (very light gray)

### Background Colors
- **White**: `#FFFFFF` (cards, main content)
- **Gray 50**: `#F9FAFB` (page background, table headers, inactive progress steps)
- **Gray 100**: `#F3F4F6` (sidebar background, subtle dividers)

### Border Colors
- **Default Border**: `#E5E7EB` (standard borders)
- **Dashed Border**: `#D1D5DB` (upload zone borders)
- **Active Border**: `#10B981` (focused inputs, active elements)

### Status Colors
- **Success/Complete**: `#10B981` (green - matches primary)
- **Warning/In Progress**: `#F59E0B` (amber/yellow)
- **Muted/Not Started**: `#6B7280` (gray)

## Typography

### Font Family
- **Primary**: `Inter` (or system sans-serif fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)

### Font Sizes
- **Large Page Title**: `36px` (2.25rem) - "Team", "New Tender" headings
- **Section Heading**: `24px` (1.5rem) - "Team Members", "Organisation Roles"
- **Card Title**: `18px` (1.125rem) - Role cards ("Admin", "Company Admin")
- **Body Text**: `14px` (0.875rem) - Standard text, descriptions
- **Small Text**: `12px` (0.75rem) - Hints, captions, labels
- **Tiny Text**: `11px` (0.6875rem) - Breadcrumb text

### Font Weights
- **Bold**: `700` - Large headings
- **Semibold**: `600` - Section headings, table headers, labels
- **Medium**: `500` - Buttons, active nav items
- **Regular**: `400` - Body text, descriptions

### Line Heights
- **Tight**: `1.25` - Headings
- **Normal**: `1.5` - Body text
- **Relaxed**: `1.75` - Descriptions with breathing room

## Spacing Scale

### Padding
- **Card Padding**: `24px` (1.5rem) - Main content cards
- **Section Gap**: `32px` (2rem) - Between major sections
- **Input Padding**: `12px 16px` - Form inputs (vertical, horizontal)
- **Button Padding**: `10px 20px` - Standard buttons
- **Small Button**: `6px 12px` - Compact buttons
- **Upload Zone**: `32px` - Large clickable areas

### Margins/Gaps
- **Section Margin**: `32px` (2rem) - Between sections
- **Card Gap**: `16px` (1rem) - Between cards in grid
- **List Item Gap**: `12px` (0.75rem) - Between list items
- **Inline Gap**: `8px` (0.5rem) - Between inline elements

## Component Styles

### Cards
- **Border Radius**: `8px` (0.5rem)
- **Border**: `1px solid #E5E7EB`
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)` (subtle)
- **Background**: `#FFFFFF`
- **Hover Shadow** (for interactive cards): `0 4px 12px rgba(0, 0, 0, 0.15)`

### Buttons

#### Primary Button ("Create new tender", "Invite")
- **Background**: `#10B981`
- **Text Color**: `#FFFFFF`
- **Border**: None or `1px solid #10B981`
- **Border Radius**: `6px` (0.375rem)
- **Padding**: `10px 20px`
- **Font Weight**: `500`
- **Hover**: Slightly darker green `#059669`

#### Secondary/Outlined Button
- **Background**: `transparent` or `#FFFFFF`
- **Text Color**: `#10B981`
- **Border**: `1px solid #10B981`
- **Border Radius**: `6px`
- **Padding**: `10px 20px`
- **Hover**: Light green background `rgba(16, 185, 129, 0.1)`

### Form Inputs
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `6px`
- **Padding**: `12px 16px`
- **Background**: `#FFFFFF`
- **Focus Border**: `2px solid #10B981`
- **Placeholder Color**: `#9CA3AF`
- **Text Color**: `#1F2937`

### Sidebar Navigation

#### Default Nav Item
- **Background**: `transparent`
- **Text Color**: `#6B7280`
- **Icon Color**: `#6B7280`
- **Padding**: `12px 16px`
- **Border Radius**: `6px`

#### Active Nav Item ("Team" in ui1.png)
- **Background**: `rgba(16, 185, 129, 0.1)` (light green tint)
- **Text Color**: `#10B981`
- **Icon Color**: `#10B981`
- **Border Left**: `3px solid #10B981`
- **Font Weight**: `500`

### Progress Indicator (5-step from ui2.png)

#### Active Step
- **Number Background**: `#10B981`
- **Number Text**: `#FFFFFF`
- **Label Color**: `#1F2937`
- **Font Weight**: `600`
- **Progress Bar**: `#10B981` fill

#### Inactive Step
- **Number Background**: `#F3F4F6` (light gray)
- **Number Text**: `#9CA3AF`
- **Label Color**: `#9CA3AF`
- **Font Weight**: `400`
- **Progress Bar**: `#E5E7EB` (gray)

### Upload Zones (from ui2.png)
- **Border**: `2px dashed #D1D5DB`
- **Border Radius**: `8px`
- **Padding**: `32px`
- **Background**: `#F9FAFB`
- **Text Color**: `#6B7280`
- **Icon Color**: `#9CA3AF`
- **Hover Border**: `2px dashed #10B981`
- **Hover Background**: `rgba(16, 185, 129, 0.05)`

### Tables (from ui1.png)

#### Table Container
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `8px`
- **Overflow**: `hidden`

#### Table Header
- **Background**: `#F9FAFB`
- **Border Bottom**: `1px solid #E5E7EB`
- **Text Color**: `#6B7280`
- **Font Weight**: `600`
- **Font Size**: `12px`
- **Padding**: `12px 16px`
- **Text Transform**: `uppercase` (optional)

#### Table Row
- **Background**: `#FFFFFF`
- **Border Bottom**: `1px solid #E5E7EB`
- **Padding**: `12px 16px`
- **Hover Background**: `#F9FAFB`

### Badges ("CREATOR ROLE" from ui1.png)
- **Background**: `#10B981`
- **Text Color**: `#FFFFFF`
- **Border Radius**: `4px` (0.25rem)
- **Padding**: `4px 10px`
- **Font Size**: `11px`
- **Font Weight**: `600`
- **Text Transform**: `uppercase`

### Search Input (from ui1.png)
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `6px`
- **Padding**: `8px 12px 8px 36px` (left padding for icon)
- **Background**: `#FFFFFF`
- **Icon Position**: `12px` from left, vertically centered
- **Icon Color**: `#9CA3AF`

## Iconography
- **Icon Library**: Appears to use Lucide React or similar
- **Icon Size**: `20px` (1.25rem) standard, `16px` for small contexts
- **Icon Color**: Matches text color of context
- **Sidebar Icons**: `20px`, gray when inactive, green when active

## Responsive Breakpoints (Inferred)
- **Desktop**: `1024px+` (primary view in screenshots)
- **Tablet**: `768px - 1023px`
- **Mobile**: `< 768px`

## Shadows

### Card Shadow (Default)
- `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`

### Card Shadow (Hover)
- `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`

### Dropdown Shadow
- `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);`

## Animations (Inferred from modern UI best practices)
- **Transition Duration**: `200-300ms`
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` or `ease-out`
- **Properties to Animate**: `background-color`, `border-color`, `transform`, `box-shadow`, `opacity`

## Key Design Principles
1. **Clean & Minimal**: Lots of white space, subtle borders
2. **Consistent Spacing**: 8px base unit (multiples: 8, 12, 16, 24, 32)
3. **Green Accent**: Used sparingly for actions, active states, success
4. **Gray Scale**: Hierarchical text colors for visual hierarchy
5. **Rounded Corners**: Consistent 6-8px border radius
6. **Subtle Shadows**: Light shadows for depth without heaviness
