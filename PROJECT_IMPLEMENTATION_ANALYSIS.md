# Project /:id Implementation Analysis

## Overview
The project detail page implements a comprehensive project workspace with document management, work package tracking, and analysis capabilities. Uses Next.js 13+ app router with Supabase backend and client-side state management via React hooks.

---

## 1. Main Route & Page Component

**Route File**: `/app/(dashboard)/projects/[id]/page.tsx`
- **Type**: Client component (`'use client'`)
- **Route Pattern**: `/projects/[id]` - Dynamic route for individual projects
- **Key Features**:
  - Project metadata display (name, client, dates, status)
  - Documents management section
  - Work packages dashboard
  - Project details editor
  - File upload interface

**Lines**: 1-431

---

## 2. Project Metadata Display

### Current Display Structure (lines 312-367)
```
- Main project card (rounded-3xl border bg-card)
  ├─ Project name (h1, text-3xl font-bold) - line 316
  ├─ Description (max-w-2xl) - line 317
  ├─ Quick Stats Grid (5 columns on lg, 2 on sm)
  │  ├─ Client Name - line 269
  │  ├─ Start Date (formatted) - line 270
  │  ├─ Deadline (formatted) - line 271
  │  ├─ Time Left (calculated) - line 272
  │  └─ Project Status (tone-based badge) - line 273
  ├─ Status Badge (responsive tone color) - lines 344-358
  ├─ Project Initials Avatar (bg-primary/10) - line 363
  └─ Updated Date (formatted) - line 360
```

### Quick Stats Memoization (lines 267-276)
```typescript
const quickStats = useMemo(() => [
  { label: 'Client Name', value: project?.client_name || 'N/A' },
  { label: 'Start Date', value: formatDate(project?.start_date ?? project?.created_at) },
  { label: 'Deadline', value: formatDate(project?.deadline) },
  { label: 'Time Left', value: timeLeft },
  { label: 'Project Status', value: statusDisplay.label },
], [dependencies])
```

### Status Display Map (lines 35-41)
Maps project status to label + tone:
- `setup` → "Preparing" (tone: preparing)
- `analysis` → "Analyzing" (tone: analysis)
- `in_progress` → "In Progress" (tone: active)
- `completed` → "Completed" (tone: default)
- `archived` → "Archived" (tone: archived)

### Styling Classes
- Card container: `rounded-3xl border bg-card shadow-sm`
- Stats container: `grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5`
- Stat boxes: `rounded-2xl border border-muted bg-muted/40 px-4 py-4 shadow-inner`
- Status badge: Conditional className based on tone (lines 345-355)

---

## 3. Documents Management

### ProjectDocumentsTable Component
**File**: `/components/project-documents-table.tsx` (lines 1-129)

#### Props
```typescript
interface ProjectDocumentsTableProps {
  documents: ProjectDocument[]
  onDelete?: (id: string) => Promise<void> | void
  onSetPrimary?: (id: string) => Promise<void> | void
}

interface ProjectDocument {
  id: string
  name: string
  file_type: string
  file_size: number
  uploaded_at: string
  is_primary_rft?: boolean
  download_url?: string | null
}
```

#### Features (in ProjectDocumentsTable)
- **Empty state**: Dashed border container when no documents (line 48)
- **Table structure**: Overflow-hidden rounded-2xl border (line 59)
- **Columns**: Name, Type, Size, Uploaded, Actions (lines 62-68)
- **File size formatting**: Converts bytes to B/KB/MB (lines 25-29)
- **Date formatting**: Month/Day/Year Hour:Minute format (lines 31-43)
- **Actions per document**:
  - Download (if `download_url` exists) - line 86-95
  - Make Primary (if not already primary) - line 98-107
  - Delete (if `onDelete` provided) - line 109-120
- **Primary RFT badge**: Secondary variant badge on row - line 77

#### Integration in Project Page (lines 369-393)
```typescript
<div className="space-y-6 border-t border-muted/60 px-8 py-6">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <h2>Uploaded Documents</h2>
    <Button variant="outline" size="sm" onClick={() => document.getElementById(uploadInputId)?.click()}>
      <Plus className="mr-2 size-4" />
      Add document
    </Button>
  </div>
  <ProjectDocumentsTable {...props} />
</div>
```

### File Upload Component
**File**: `/components/file-upload.tsx` (lines 1-120+)

#### Props
```typescript
interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  onPasteText?: (payload: { name: string; content: string }) => Promise<void>
  accept?: string
  inputId?: string
}
```

#### Features
- Tab switching: "File Upload" and "Paste Text" (lines 32-37)
- Drag & drop support (lines 62-87)
- File input handling (line 49-60)
- Error messaging (line 27)
- Loading state during upload (line 23)

#### Usage on Project Page (line 399)
```typescript
{workPackages.length === 0 && (
  <FileUpload onUpload={handleUpload} onPasteText={handlePasteText} inputId={uploadInputId} />
)}
```

---

## 4. Work Packages/Documents List

### WorkPackageDashboard Component
**File**: `/components/work-package-dashboard.tsx` (lines 1-143)

#### Props
```typescript
interface WorkPackageDashboardProps {
  projectId: string
  workPackages: WorkPackage[]
  onUpdate: () => void
  showBulkExport?: boolean
}

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

#### Features
- **Empty state**: Alert with FileQuestion icon, AddDocumentDialog CTA (lines 96-111)
- **Progress counter**: "X of Y completed" (lines 42-45, 119-120)
- **Header section**: Title + completion status + action buttons (lines 116-131)
  - Add document button (AddDocumentDialog)
  - Bulk export button (conditional, when showBulkExport && completedCount > 0)
- **Work package table**: WorkPackageTable component (lines 134-140)

### WorkPackageTable Component
**File**: `/components/work-package-table.tsx` (lines 1-140+)

#### Key Functionality
- **Table columns**: Document type, description, requirements, assignee, status, actions
- **Status management**: Visual indicators (Circle icons) for different statuses (lines 98-130)
- **Assignment dropdown**: Select from mock users (admin, writer_a, writer_b) - lines 51-55
- **Generate documents button**: Parallel generation with progress tracking
- **Loading messages**: Rotating messages during generation (lines 57-64)
- **Actions per row**:
  - Open work package (navigate to detail page) - line 92
  - Assign to team member - lines 47-69
  - Change status - lines 71-90
  - Generate documents - implemented via GenerateDocumentsDialog

#### Integration (lines 410-426)
```typescript
{project.status === 'in_progress' && (
  <>
    {workPackages.length === 0 ? (
      <EmptyState {...} />
    ) : (
      <WorkPackageDashboard
        projectId={projectId}
        workPackages={workPackages}
        onUpdate={loadData}
        showBulkExport
      />
    )}
  </>
)}
```

---

## 5. Styling Patterns & Component Structure

### Design System
**UI Component Library**: Radix UI + Tailwind CSS (custom shadcn/ui components)

**Component Structure**:
- `/components/ui/` - Base UI components (button, dialog, input, table, badge, etc.)
- `/components/` - Feature components (project-documents-table, work-package-dashboard, etc.)

### Key Styling Patterns

#### Cards & Containers
```
rounded-3xl border bg-card shadow-sm     // Main card
rounded-2xl border border-muted          // Secondary container
rounded-full border px-3 py-1            // Badge/pill
grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5  // Responsive grid
```

#### Typography
```
h1: text-3xl font-bold leading-tight
h2: text-lg font-semibold
p: text-sm text-muted-foreground (default secondary)
dt: text-xs font-semibold uppercase tracking-wide
```

#### Color System
- Primary: `bg-primary/10 text-primary`
- Muted: `text-muted-foreground bg-muted/40`
- Status-specific:
  - Preparing: `border-primary/30 bg-primary/10 text-primary`
  - Analyzing: `border-amber-200 bg-amber-50 text-amber-700`
  - Active: `border-emerald-200 bg-emerald-50 text-emerald-700`
  - Archived: `border-slate-200 bg-slate-100 text-slate-600`

#### Responsive Patterns
```
flex-col gap-6  // Mobile: stack
md:flex-row     // Tablet+: side-by-side
lg:grid-cols-5  // Large: 5 columns
self-start      // Align buttons to top
```

#### Spacing Patterns
```
space-y-10      // Vertical space between major sections
space-y-6       // Between subsections
gap-4, gap-6    // Within flex/grid
px-8 py-6       // Padding inside cards
```

#### Special Elements
- **Initials avatar**: `grid size-16 place-content-center rounded-full bg-primary/10 text-base font-semibold uppercase text-primary`
- **Loading spinner**: `<LoadingSpinner size="lg" text="Loading project..." />`
- **Status badge**: Conditional tone colors applied via className
- **Dashed border (empty)**: `border-dashed border-muted`

---

## 6. Routing & Navigation Patterns

### Route Structure
```
/projects                    // Projects list page (server component)
/projects/[id]              // Project detail page (client component)
/work-packages/[id]         // Work package detail page
```

### Navigation Patterns

**Client-side routing** (via `next/navigation`):
- `useRouter()` from `next/navigation` for programmatic navigation - line 40, 93
- `router.push()` to navigate to work package detail - line 93

**Link-based navigation**:
- `<Link href="/projects">Back to all projects</Link>` - line 291

**File route API calls**:
- GET `/api/projects/[id]` - Fetch project details
- PUT `/api/projects/[id]` - Update project
- DELETE `/api/projects/[id]` - Delete project
- GET `/api/projects/[id]/documents` - List documents
- POST `/api/projects/[id]/documents` - Upload document
- DELETE `/api/projects/[id]/documents/[docId]` - Delete document
- POST `/api/projects/[id]/documents/[docId]/primary` - Set primary RFT
- GET `/api/projects/[id]/work-packages` - List work packages
- POST `/api/projects/[id]/analyze` - Trigger RFT analysis

### Breadcrumb Navigation (lines 113-126)
**File**: `/libs/utils/breadcrumbs.ts`

Custom event-based system:
```typescript
// In project page
useEffect(() => {
  if (!project) return
  setBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: project.name || 'Untitled Project' },
  ])
  return () => clearBreadcrumbs()
}, [project])
```

---

## 7. State Management Approach

### Local Component State (React Hooks)

**Project Page State** (lines 71-84):
```typescript
const [project, setProject] = useState<ProjectDetails | null>(null)
const [documents, setDocuments] = useState<Document[]>([])
const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
const [loading, setLoading] = useState(true)
```

**State Update Pattern** - useCallback + useEffect (lines 86-111):
```typescript
const loadData = useCallback(async () => {
  setLoading(true)
  try {
    const [projectRes, docsRes, packagesRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/documents`),
      fetch(`/api/projects/${projectId}/work-packages`),
    ])
    // Parse responses and setState
  } finally {
    setLoading(false)
  }
}, [projectId])

useEffect(() => {
  loadData()
}, [loadData])
```

**Memoization** (lines 245-276):
- `useMemo()` for computed values:
  - `statusDisplay` - Based on project status
  - `projectInitials` - From project name
  - `uploadInputId` - ID reference
  - `timeLeft` - Deadline calculation
  - `quickStats` - Stats array object

### Dialog/Modal State Patterns

**EditProjectDetailsDialog** (`/components/edit-project-details-dialog.tsx`):
- `useState` for dialog open/close
- `useState` for form state (name, client, dates, etc.)
- `useState` for submission loading
- `useState` for error messages
- `useEffect` to reset form when dialog opens

**WorkPackageTable State**:
- `useState` for generation progress tracking
- `useState` for error states
- Message rotation via `useEffect`

### Data Fetching Pattern

**Direct fetch calls** (no query library):
```typescript
const response = await fetch(`/api/projects/${projectId}`)
const result = await response.json()
if (result.success) setState(result.data)
```

**Error handling**: Try/catch with toast notifications:
```typescript
try {
  // fetch operation
  toast.success('Success message')
} catch (error) {
  const message = error instanceof Error ? error.message : 'Fallback'
  toast.error(message)
  throw error
}
```

### State Refetch Triggers
- Manual `await loadData()` after mutations
- `onUpdate` callback passed to child components
- Callbacks from modals/dialogs

---

## 8. API Response Format

All API routes follow consistent response format:

```typescript
// Success
{
  success: true,
  data: { /* actual data */ }
}

// Error  
{
  success: false,
  error: "Error message"
}

// With HTTP status codes (200, 400, 401, 500)
```

**API Utility** (`/libs/api-utils.ts`):
- `apiSuccess(data)` - Wraps successful responses
- `apiError(error, statusCode)` - Wraps error responses
- `withAuth(handler)` - Middleware for auth check + context injection

---

## 9. Key API Endpoints

### GET `/api/projects/[id]`
**Handler**: `/app/api/projects/[id]/route.ts:10`
```typescript
Returns: Project object with name, client_name, status, deadline, instructions, etc.
```

### PUT `/api/projects/[id]`
**Handler**: `/app/api/projects/[id]/route.ts:24`
```typescript
Body: Partial project update (name, client_name, start_date, deadline, instructions, status)
Returns: Updated project object
```

### GET `/api/projects/[id]/documents`
**Handler**: `/app/api/projects/[id]/documents/route.ts:11`
```typescript
Returns: Array of documents with signed download URLs
```

### GET `/api/projects/[id]/work-packages`
**Handler**: `/app/api/projects/[id]/work-packages/route.ts:6`
```typescript
Returns: Array of work packages with requirements array
```

### POST `/api/projects/[id]/analyze`
**Handler**: `/app/api/projects/[id]/analyze/route.ts`
```typescript
Streaming response with SSE (Server-Sent Events)
Events:
- event: progress (data: { type: 'document', data: DocumentDetails })
- event: progress (data: { type: 'complete', data: { count: number } })
- event: done (data: { success: boolean })
```

---

## 10. Data Layer (Repositories)

**File**: `/libs/repositories/projects.ts`

### Key Functions
```typescript
listProjects(supabase, orgId)      // SELECT from projects table
getProject(supabase, projectId)    // Get single project
createProject(supabase, data)      // INSERT new project
updateProject(supabase, projectId, data)  // UPDATE project
deleteProject(supabase, projectId) // DELETE project
```

**Database Table**: `projects`
- Columns: id, name, client_name, start_date, deadline, status, instructions, organization_id, created_by, created_at, updated_at

---

## 11. Key Dependencies & Utilities

### Form Handling
- **EditProjectDetailsDialog**: Custom form with dialog wrapper
- No form library (vanilla React form state)
- Validation: Client-side only (required field checks)

### Notifications
- **Sonner**: Toast notifications
  - `toast.success(message)`
  - `toast.error(message)`

### Icons
- **lucide-react**: Arrow icons, Plus, Trash2, Download, FileQuestion, CircleUserRound, CalendarDays, NotebookPen

### Utility Functions in Project Page
- `formatDate(value)` - Format dates as "MMM DD, YYYY" (lines 43-54)
- `getInitials(name)` - Extract first letters from name (lines 56-65)
- `calculateTimeLeft(deadline)` - Calculate days until deadline (lines 252-265)

---

## 12. Notable UI Patterns

### Empty States
Used in multiple places with consistent pattern:
- Icon (rounded full background)
- Heading text
- Description
- Optional CTA button

### Loading States
- Full-page loader: `<LoadingSpinner size="lg" text="Loading project..." />`
- Spinner in buttons: `<Spinner size="sm" className="mr-2" />`
- Rotating messages during generation (work package table)

### Error Handling
- Toast-based error notifications
- Error message display in forms
- Form validation errors

### Progressive Disclosure
- Conditional rendering based on project status:
  - `setup`: Show FileUpload + AnalysisTrigger
  - `in_progress`: Show WorkPackageDashboard
  - `completed`/`archived`: Status only

### Inline Editing
- EditProjectDetailsDialog for project metadata
- Status dropdown in work package table
- Assignee dropdown in work package table

---

## 13. File Structure Summary

```
/app
  /(dashboard)
    /projects
      /[id]
        page.tsx                    ← Main project detail page (431 lines)
      page.tsx                      ← Projects list (58 lines)
    layout.tsx                      ← Dashboard layout
  /api
    /projects
      /[id]
        route.ts                    ← GET/PUT/DELETE project
        /documents
          route.ts                  ← GET/POST documents
          /[docId]
            route.ts                ← DELETE document
            /primary
              route.ts              ← POST set primary
        /work-packages
          route.ts                  ← GET work packages
        /analyze
          route.ts                  ← POST analyze RFT

/components
  /ui
    button.tsx, dialog.tsx, table.tsx, etc.
  project-documents-table.tsx       ← 129 lines
  work-package-dashboard.tsx        ← 143 lines
  work-package-table.tsx            ← 140+ lines
  edit-project-details-dialog.tsx   ← 223 lines
  file-upload.tsx                   ← 120+ lines
  analysis-trigger.tsx              ← 113 lines
  empty-state.tsx                   ← 40 lines

/libs
  /repositories
    projects.ts
    project-documents.ts
    work-packages.ts
  /utils
    breadcrumbs.ts
  /api-utils
    (auth middleware, response helpers)
```

---

## Key Takeaways

1. **Simple state mgmt**: Plain React hooks (useState, useCallback, useMemo, useEffect)
2. **Direct API calls**: No query library; direct fetch() with JSON parsing
3. **Component composition**: Feature components wrap UI components
4. **Responsive design**: Tailwind's responsive prefixes (sm:, md:, lg:)
5. **Inline callbacks**: Event handlers defined as arrow functions in JSX
6. **Progressive enhancement**: Show UI based on project status
7. **Consistent patterns**: Same structure used across document & work package mgmt
8. **No global state**: All state scoped to components + breadcrumbs via custom events
