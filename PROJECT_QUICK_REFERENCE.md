# Project /:id - Quick Reference

## Core Files

| File | Lines | Purpose |
|------|-------|---------|
| `/app/(dashboard)/projects/[id]/page.tsx` | 431 | Main project detail page (client component) |
| `/components/project-documents-table.tsx` | 129 | Documents list with download/delete/set-primary actions |
| `/components/work-package-dashboard.tsx` | 143 | Work packages overview + progress tracking |
| `/components/work-package-table.tsx` | 140+ | Work package rows with generation + assignment |
| `/components/edit-project-details-dialog.tsx` | 223 | Modal form for editing project metadata |
| `/components/file-upload.tsx` | 120+ | Upload/paste file component |
| `/components/analysis-trigger.tsx` | 113 | RFT analysis trigger with SSE streaming |
| `/libs/repositories/projects.ts` | - | Data access layer (CRUD operations) |
| `/libs/utils/breadcrumbs.ts` | 22 | Custom event-based breadcrumb system |

## Page Structure

```
Project Detail Page
├── Top Navigation (Back link + Edit/Delete buttons)
├── Main Card (Name + Description + Stats + Avatar)
│   ├── Quick Stats Grid (5 items: client, dates, status, time left)
│   ├── Status Badge (tone-colored)
│   └── Project Initials Avatar
├── Documents Section
│   ├── Section header + "Add document" button
│   └── ProjectDocumentsTable
├── Upload Area (shown when workPackages.length === 0)
├── Analysis Trigger (shown when status === 'setup' && documents.length > 0)
└── Work Package Dashboard (shown when status === 'in_progress')
    ├── Header + Progress counter
    ├── Add document + Bulk export buttons
    └── WorkPackageTable
```

## State Variables (Project Page)

```typescript
project                 // ProjectDetails | null
documents              // Document[]
workPackages           // WorkPackage[]
loading                // boolean
```

## Key Functions

### Data Loading
- `loadData()` - Parallel fetch: project, documents, work-packages
- Triggers: initial load, after mutations

### Event Handlers
- `handleUpload(file)` - POST to `/api/projects/[id]/documents`
- `handlePasteText(name, content)` - POST text as document
- `handleDeleteDocument(docId)` - DELETE document with confirmation
- `handleSetPrimaryDocument(docId)` - POST to set primary RFT
- `handleProjectUpdate(updates)` - PUT to update project metadata

### Computed Values (useMemo)
- `statusDisplay` - Map status to label + tone
- `projectInitials` - First 2 letters of project name
- `uploadInputId` - Unique ID for file input reference
- `timeLeft` - "X days" or "Due today" or "X days past due"
- `quickStats` - Array of 5 stat objects

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects/[id]` | Fetch project |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| GET | `/api/projects/[id]/documents` | List documents |
| POST | `/api/projects/[id]/documents` | Upload document |
| DELETE | `/api/projects/[id]/documents/[docId]` | Delete document |
| POST | `/api/projects/[id]/documents/[docId]/primary` | Set primary RFT |
| GET | `/api/projects/[id]/work-packages` | List work packages |
| POST | `/api/projects/[id]/analyze` | Analyze RFT (streaming) |

## Conditional Rendering

```
workPackages.length === 0 && documents.length === 0
  → Show FileUpload component

project.status === 'setup' && documents.length > 0
  → Show AnalysisTrigger

project.status === 'in_progress'
  → Show WorkPackageDashboard (or empty state)
```

## Key Props Patterns

### ProjectDocumentsTable
```typescript
{
  documents: Document[]
  onDelete?: (id: string) => void
  onSetPrimary?: (id: string) => void
}
```

### WorkPackageDashboard
```typescript
{
  projectId: string
  workPackages: WorkPackage[]
  onUpdate: () => void
  showBulkExport?: boolean
}
```

### EditProjectDetailsDialog
```typescript
{
  project: ProjectDetails
  onSubmit: (updates: ProjectUpdatePayload) => Promise<void>
  trigger?: ReactNode
}
```

### FileUpload
```typescript
{
  onUpload: (file: File) => Promise<void>
  onPasteText?: (payload: { name: string; content: string }) => Promise<void>
  accept?: string
  inputId?: string
}
```

## Styling Classes Quick Lookup

| Element | Classes |
|---------|---------|
| Main card | `rounded-3xl border bg-card shadow-sm` |
| Stat box | `rounded-2xl border border-muted bg-muted/40 px-4 py-4 shadow-inner` |
| Status badge | Conditional: `border-primary/30 bg-primary/10` (preparing) or amber/emerald/slate variants |
| Initials avatar | `grid size-16 place-content-center rounded-full bg-primary/10 text-base font-semibold uppercase text-primary` |
| Empty container | `border-dashed border-muted` |
| Grid (responsive) | `grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5` |

## Type Definitions

```typescript
// Project Details
interface ProjectDetails {
  id: string
  name: string
  client_name?: string | null
  start_date?: string | null
  deadline?: string | null
  instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
  status?: string
}

// Document
interface Document {
  id: string
  name: string
  file_type: string
  file_size: number
  uploaded_at: string
  is_primary_rft?: boolean
  download_url?: string | null
}

// Work Package
interface WorkPackage {
  id: string
  document_type: string
  document_description: string | null
  project_id: string
  requirements: Array<{
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string
  }>
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'review' | 'completed'
}
```

## Navigation

- Back to projects: `<Link href="/projects">` (line 291)
- To work package: `router.push('/work-packages/[id]')` (line 93)
- Breadcrumb update: `setBreadcrumbs([...])` with useEffect cleanup

## Error Handling

- Try/catch blocks around all async operations
- Toast notifications for user feedback
- Form validation in EditProjectDetailsDialog
- Confirmation dialog for destructive actions (delete)

## Memoization Points

- `statusDisplay` - Changes only when status changes
- `projectInitials` - Changes only when project name changes
- `uploadInputId` - Never changes (stable reference)
- `timeLeft` - Changes only when deadline changes (doesn't auto-refresh)
- `quickStats` - Changes when any stat dependency changes

## Performance Considerations

1. **Parallel loading**: All 3 data fetches in Promise.all()
2. **Memoized values**: Computed values prevent unnecessary recalculations
3. **useCallback**: `loadData` wrapped to prevent infinite dependency chains
4. **Conditional rendering**: Only show heavy components when needed (WorkPackageDashboard)
5. **Hidden file input**: File upload button clicks document.getElementById()

## Testing Considerations

- Mock fetch responses for API calls
- Test conditional rendering with different project statuses
- Verify error toast notifications
- Test form validation in dialog
- Mock useRouter for navigation tests
