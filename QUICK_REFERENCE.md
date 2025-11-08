# TenderCreator Quick Reference Guide

## Key Files At A Glance

### Main Project Page
```
/app/(dashboard)/projects/[id]/page.tsx  (460 lines, client component)
```
**What it does**: Displays project details, documents list, and work packages table
**Key functions**: loadData(), handleUpload(), handleProjectUpdate()
**State vars**: project, documents, workPackages, loading

### Related Components (Imported)
```
ProjectDocumentsTable      /components/project-documents-table.tsx
WorkPackageDashboard       /components/work-package-dashboard.tsx
WorkPackageTable           /components/work-package-table.tsx
EditProjectDetailsDialog   /components/edit-project-details-dialog.tsx
DeleteProjectDialog        /components/delete-project-dialog.tsx
FileUpload                 /components/file-upload.tsx
AnalysisTrigger            /components/analysis-trigger.tsx
LoadingSpinner             /components/ui/loading-spinner.tsx
```

### Navigation & Layout
```
/app/(dashboard)/layout.tsx          Dashboard wrapper (Sidebar + Navbar)
/components/sidebar.tsx              Left navigation menu
/components/navbar.tsx               Top bar with breadcrumbs
/components/breadcrumbs.tsx          Breadcrumb navigation
```

### Styling
```
/app/globals.css                     Global Tailwind base
/app/(dashboard)/globals-dashboard.css  Dashboard design tokens & overrides
```

### API Routes
```
/app/api/projects/[id]/route.ts           GET/PUT/DELETE project
/app/api/projects/[id]/documents/route.ts GET/POST documents
/app/api/projects/[id]/work-packages/route.ts GET work packages
```

### Data Access Layer
```
/libs/repositories/projects.ts            getProject(), updateProject(), etc.
/libs/repositories/work-packages.ts        listWorkPackages(), etc.
/libs/repositories/project-documents.ts    listProjectDocuments(), etc.
```

---

## Common Modifications

### Change Primary Color
**File**: `/app/(dashboard)/globals-dashboard.css`
**Variable**: `--dashboard-primary: #10B981` → change to new color
**Affects**: All dashboard buttons, links, badges, active states

### Add New Project Detail Field
1. Add to Project model in `/types/database.ts`
2. Add to page state: `const [project, setProject] = useState(...)`
3. Display in JSX with proper formatting
4. Update `/libs/repositories/projects.ts` if needed
5. Update `/components/edit-project-details-dialog.tsx` form if editable

### Add New Work Package Column
1. Update `WorkPackageTable` component: `/components/work-package-table.tsx`
2. Add `<TableHead>` in header
3. Add `<TableCell>` in row mapping

### Change Status Badges Appearance
**File**: `/app/(dashboard)/projects/[id]/page.tsx`
**Lines**: 345-355 (status badge styling)
**Variables**: Change className conditions or add new tone values

### Add New Navigation Item
**File**: `/components/sidebar.tsx`
**Lines**: 32-73 (navItems array)
Add object: `{ id, name, href, icon, match? }`

### Modify API Response Format
**File**: `/app/api/projects/[id]/route.ts`
**Pattern**: Change what `getProject()` returns via `/libs/repositories/projects.ts`

---

## Data Flow Patterns

### Fetching Data
```typescript
// Pattern used throughout
const loadData = useCallback(async () => {
  setLoading(true)
  try {
    const response = await fetch(`/api/projects/${projectId}`)
    const result = await response.json()
    if (result.success) {
      setState(result.data)
    }
  } catch (error) {
    toast.error('Error message')
  } finally {
    setLoading(false)
  }
}, [projectId])

useEffect(() => {
  loadData()
}, [loadData])
```

### Updating Data
```typescript
// Pattern for PUT/POST requests
const handleUpdate = async (updates) => {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const result = await response.json()
    if (result.success) {
      setProject(result.data)
      toast.success('Updated')
    }
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Form Data Upload
```typescript
// Pattern for file uploads
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`/api/projects/${projectId}/documents`, {
    method: 'POST',
    body: formData, // NOT headers: Content-Type!
  })
}
```

---

## Component Communication

### Breadcrumbs → Setting Navigation Context
```typescript
// In page component
useEffect(() => {
  setBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: project.name || 'Untitled' }
  ])
  return () => clearBreadcrumbs()
}, [project])
```

### Parent → Child Props Pattern
```typescript
// Common pattern for dashboard components
<WorkPackageTable
  workPackages={workPackages}
  onAssignmentChange={handleAssignmentChange}
  onStatusChange={handleStatusChange}
  onOpen={handleOpen}
/>
```

---

## Styling Quick Reference

### Adding Styles
```typescript
// Option 1: Tailwind utility classes
<div className="flex items-center gap-4 rounded-lg border p-4">

// Option 2: Dynamic classes with cn()
import { cn } from '@/lib/utils'
<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  isDark && 'dark-styles'
)}>

// Option 3: CSS variables (dashboard)
<span className="text-[var(--dashboard-primary)]">
```

### Common Tailwind Utilities Used
```
Spacing: p-4 | m-4 | gap-4 | px-8 | py-6
Layout: flex | flex-col | items-center | justify-between
Sizing: w-full | h-screen | min-h-[400px]
Colors: text-primary | bg-muted | border-gray-200
Rounded: rounded-lg | rounded-2xl | rounded-full
Shadows: shadow-sm | shadow-md
Responsive: sm: | md: | lg: | xl:
```

---

## Testing/Debugging

### Check Page Status
1. Open DevTools → Network tab
2. Check `/api/projects/{id}` response
3. Verify `success: true` in JSON
4. Check breadcrumbs: should say project name

### Common Issues & Fixes

**Project not loading**
- Check network request to `/api/projects/{id}`
- Verify project ID in URL
- Check Supabase connection

**Work packages not showing**
- Check if project status is 'in_progress'
- Verify documents exist and analysis was run
- Check `/api/projects/{id}/work-packages` response

**Styling looks off**
- Clear browser cache
- Check if globals-dashboard.css is imported
- Verify no conflicting CSS variables

**Breadcrumbs not updating**
- Call `setBreadcrumbs()` in useEffect
- Check console for event dispatch
- Verify breadcrumbs component mounted

---

## Performance Tips

### Reduce Re-renders
- Wrap callbacks: `const func = useCallback(..., [deps])`
- Memoize values: `const data = useMemo(..., [deps])`
- Move state closer to where it's used

### Optimize Data Fetching
- Use `Promise.all()` for parallel requests (already done)
- Avoid re-fetching on every navigation
- Consider caching with React Query (not currently used)

### Bundle Size
- No large libraries imported unnecessarily
- shadcn/ui tree-shakes unused components
- Tailwind purges unused classes in production

---

## Git/Workflow

### File Permissions
- Use `git add -A` to track new files
- Commit components with their related changes
- Keep commits focused on single features

### Import Aliases
- `@/components/...` → `/components/...`
- `@/libs/...` → `/libs/...`
- `@/types/...` → `/types/...`
- Defined in `tsconfig.json` paths

---

## Dependencies Cheat Sheet

| Package | Usage |
|---------|-------|
| next | Framework & routing |
| react | Component library |
| tailwindcss | Styling |
| shadcn/ui + radix-ui | UI components |
| react-hook-form | Form state |
| zod | Form validation |
| supabase-js | Database & auth |
| sonner | Toast notifications |
| lucide-react | Icons |
| @google/generative-ai | AI integration |
| framer-motion | Animations |

---

## Quick Wins (Easy Improvements)

1. **Add loading skeleton** → Replace LoadingSpinner with table skeleton
2. **Optimize images** → Add next/image for document preview
3. **Add search** → Filter work packages by document_type
4. **Keyboard shortcuts** → Add CMD+K for quick actions
5. **Dark mode** → Leverage next-themes (provider exists)
6. **Error boundaries** → Wrap components in error boundary
7. **Pagination** → Add to work packages table (long lists)
8. **Infinite scroll** → For documents list
9. **Drag reorder** → Reorder work packages
10. **Bulk actions** → Select multiple work packages

