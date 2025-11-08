# TenderCreator Codebase Exploration - Index

This document serves as an entry point to the comprehensive codebase documentation.

## Documentation Files

### 1. **CODEBASE_EXPLORATION.md** (25 KB)
   Comprehensive deep-dive into the codebase structure and implementation.
   
   **Contents:**
   - Current /project/:id page implementation (routing, data fetching, models)
   - Header/navbar implementation & layout structure
   - Work packages/documents list implementation
   - Navigation & header component structure
   - Styling approach (Tailwind v4 + CSS variables)
   - State management patterns
   - UI versioning & theming systems
   - Key file locations & architecture
   - Technologies & dependencies
   - Design patterns & best practices
   - Architecture diagrams (ASCII)
   - File cross-references

   **Best For:** Understanding the full system architecture, building on existing patterns

### 2. **QUICK_REFERENCE.md** (8.2 KB)
   Fast lookup guide for common tasks and modifications.
   
   **Contents:**
   - Key files at a glance
   - Common modifications (color, fields, columns, etc.)
   - Data flow patterns (fetch, update, upload)
   - Component communication patterns
   - Styling quick reference
   - Testing & debugging tips
   - Performance optimization
   - Dependencies cheat sheet
   - 10 quick win improvements

   **Best For:** Day-to-day development, copy-paste patterns, quick fixes

## Quick Start

### Understanding the Project Page
1. Main file: `/app/(dashboard)/projects/[id]/page.tsx`
2. See CODEBASE_EXPLORATION.md → Section 1 for detailed explanation
3. See QUICK_REFERENCE.md for common modifications

### Making Changes
1. Identify what you want to change
2. Find it in QUICK_REFERENCE.md → "Common Modifications"
3. Use CODEBASE_EXPLORATION.md for deeper understanding if needed
4. Follow the patterns shown in "Data Flow Patterns" section

### Adding New Features
1. Check QUICK_REFERENCE.md → "Quick Wins" for ideas
2. Look at similar components in existing code
3. Reference CODEBASE_EXPLORATION.md → "Component Hierarchy"
4. Follow existing patterns for consistency

## Architecture Overview

### Three-Layer Architecture
```
Presentation Layer (Components)
    ↓
Business Logic Layer (Hooks + Utils)
    ↓
Data Access Layer (Repositories → Supabase)
```

### Key Directories
```
/app/(dashboard)/       Dashboard routes
/components/            React components
/libs/repositories/     Data access layer
/app/api/              Next.js API routes
/types/                TypeScript interfaces
```

## Technology Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.5.2 + React 19.1.1 |
| Styling | Tailwind CSS v4 + CSS Variables |
| UI Library | shadcn/ui (Radix UI primitives) |
| Database | Supabase (PostgreSQL) |
| Forms | react-hook-form + zod |
| Notifications | sonner |
| Icons | lucide-react |
| AI | Google Gemini API |

## Data Flow Summary

### Project Page Load
```
Page Component
  ↓ useEffect
  loadData() function
  ↓ Promise.all()
  3 parallel API calls
  ↓ setState()
  Render components with data
```

### Document Upload
```
FileUpload Component
  ↓ handleUpload()
  POST /api/projects/{id}/documents
  ↓ API Route
  Repository layer
  ↓ Supabase
  Success → loadData() → Re-render
```

## Current Design System

### Colors
- Primary: Emerald Green (#10B981)
- Text: Gray scale (#1F2937 → #9CA3AF)
- Status: Green (success), Amber (warning), Red (error)

### Layout
- Sidebar width: 288px (expanded) / 80px (collapsed)
- Navbar height: 64px
- Main content: Scrollable with 32px padding

### Typography
- Primary font: Inter system font
- Sizes: sm (12px) → 2xl (28px)
- Font weights: 400 (normal), 600 (semibold), 700 (bold)

## Common Patterns

### Fetching Data
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

const loadData = useCallback(async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/endpoint')
    const result = await res.json()
    if (result.success) setData(result.data)
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => { loadData() }, [loadData])
```

### Styling Components
```typescript
// Option 1: Tailwind classes
<div className="flex items-center gap-4">

// Option 2: Dynamic classes with cn()
<div className={cn('base', isActive && 'active')}>

// Option 3: CSS variables
<span className="text-[var(--dashboard-primary)]">
```

### Dialog Pattern
```typescript
<DialogComponent
  trigger={<Button>Open</Button>}
  onSubmit={handleSubmit}
/>
```

## Performance Characteristics

### Current Implementation
- Client-side data fetching (no caching)
- Full list rendering (no pagination)
- useState for state (no persistence)
- Direct Fetch API calls

### Bottlenecks
- Re-fetches on every page load
- Large lists may slow down table rendering
- No skeleton loaders (full spinner while loading)
- All work packages load at once

### Optimization Opportunities
- React Query for caching
- Pagination for large lists
- Virtual scrolling for long tables
- Code splitting at route level
- Image optimization

## Security Notes

### Current Implementation
- Supabase Auth middleware on API routes
- withAuth() wrapper on route handlers
- No client-side token handling (secure)
- Environment variables for API keys

### Best Practices
- Don't commit .env.local
- Validate all user input on server
- Use row-level security (RLS) in Supabase
- Keep API keys in environment variables

## Testing Strategy

### Manual Testing Checklist
- [ ] Project loads with correct data
- [ ] Breadcrumbs display correct path
- [ ] Document upload works
- [ ] Work packages table displays
- [ ] Sidebar toggle works
- [ ] Status updates reflect in UI
- [ ] Error states show correctly
- [ ] Mobile responsive (< 768px)

## Development Tips

### Debug Mode
```typescript
// Add to component
console.log('Data:', data)
console.log('API Response:', response)
console.log('Component State:', { project, documents })
```

### Network Inspection
1. Open DevTools → Network tab
2. Filter: XHR/Fetch
3. Check request/response for each API call
4. Verify status codes (200, 400, 500)

### Styling Debug
```typescript
// Add temporary background to find layout issues
<div className="bg-red-200">Content</div>

// Toggle Tailwind class visibility
className={DEBUG ? "border-2 border-red-500" : ""}
```

## Adding New Features

### Steps Template
1. **Define data model** → Update /types/database.ts
2. **Create API route** → /app/api/{resource}/route.ts
3. **Add repository function** → /libs/repositories/{resource}.ts
4. **Fetch in component** → Add useEffect + useState
5. **Create UI component** → /components/{feature}.tsx
6. **Style** → Use Tailwind + CSS variables
7. **Test** → Manual testing + console logs

### Example: Adding a Status Filter
1. Add filter state: `const [statusFilter, setStatusFilter] = useState('all')`
2. Filter data: `const filtered = workPackages.filter(...)`
3. Add UI control: `<Select value={statusFilter} onChange={...}>`
4. Update display: `{filtered.map(...)}`

## Known Limitations

- No dark mode toggle (infrastructure exists)
- No pagination (loads all records)
- No search/filter UI (manual implementation required)
- No error boundaries (will crash on errors)
- No loading skeletons (full-page spinner)
- No offline support
- No export to multiple formats (DOCX only)

## Future Improvements

See QUICK_REFERENCE.md → "Quick Wins" for actionable improvements.

### Priority 1 (High Value, Low Effort)
- Dark mode toggle
- Add search/filter
- Loading skeletons
- Keyboard shortcuts

### Priority 2 (Medium Value, Medium Effort)
- Pagination
- Error boundaries
- Export multiple formats
- Auto-save drafts

### Priority 3 (Nice to Have)
- Drag-and-drop reordering
- Infinite scroll
- Advanced filtering
- Batch operations

## Questions?

Refer to:
1. **CODEBASE_EXPLORATION.md** for "why" and "how"
2. **QUICK_REFERENCE.md** for "what" and "where"
3. **Existing components** for code examples
4. **Repository pattern** for data access examples

---

**Last Updated:** November 8, 2024
**Framework:** Next.js 15.5.2, React 19.1.1
**Status:** Documentation Complete
