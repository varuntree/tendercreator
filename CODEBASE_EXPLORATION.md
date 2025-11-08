# TenderCreator Codebase Exploration Summary

## 1. Current /project/:id Page Implementation

### Main Component Location
- **File**: `/app/(dashboard)/projects/[id]/page.tsx`
- **Type**: Client component (`'use client'`)
- **Framework**: Next.js 15.5.2 with React 19.1.1

### Routing & Navigation
- **Route Pattern**: `/projects/[id]` (dynamic route using Next.js app router)
- **Params Handling**: Uses `useParams()` from `next/navigation`
- **Navigation Pattern**: Link-based navigation with Next.js `<Link>` component
- **Breadcrumb Support**: Uses custom breadcrumb utility (`setBreadcrumbs()`, `clearBreadcrumbs()`)

### Data Fetching Architecture
**Pattern**: Client-side fetch with useCallback & useEffect
- Fetches 3 parallel resources:
  1. `/api/projects/{id}` - project metadata
  2. `/api/projects/{id}/documents` - uploaded RFT documents
  3. `/api/projects/{id}/work-packages` - extracted work packages
- Loading state management with `useState`
- Data stored in component state (not using global state manager)
- No query caching visible (re-fetches on every navigation)

### Data Models

#### Project Model
```typescript
interface Project {
  id: string
  name: string
  client_name?: string | null
  start_date?: string | null
  deadline?: string | null
  instructions?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
}
```

#### WorkPackage Model
```typescript
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

#### Document Model
```typescript
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

### Page Structure & Components
The page is composed of several sections:

1. **Header Section**
   - Back link to projects list
   - Edit & Delete project buttons
   - Project title (h1)
   - Project description text

2. **Project Card Section** (main info container)
   - Quick stats grid (5 columns on desktop, responsive)
     - Client Name
     - Start Date
     - Deadline
     - Time Left (calculated)
     - Project Status
   - Status badge (color-coded: preparing/analysis/active/archived/default)
   - Project initials avatar (colored circle)
   - Summary text section

3. **Documents Section**
   - Uploaded documents table (`ProjectDocumentsTable`)
   - Add document button
   - File upload capability

4. **Work Packages Section**
   - `WorkPackageDashboard` component (displays table of work packages)
   - Conditional rendering based on project status:
     - setup + no docs: shows `FileUpload` component
     - setup + docs: shows `AnalysisTrigger` component
     - in_progress + docs: shows `WorkPackageDashboard` component
     - in_progress + no packages: shows empty state

### API Endpoints Used
- `GET /api/projects/{id}` - fetch project details
- `GET /api/projects/{id}/documents` - list documents
- `GET /api/projects/{id}/work-packages` - list work packages
- `POST /api/projects/{id}/documents` - upload document
- `DELETE /api/projects/{id}/documents/{docId}` - delete document
- `POST /api/projects/{id}/documents/{docId}/primary` - set primary RFT
- `PUT /api/projects/{id}` - update project details

### Status Flow
Project status progression: `setup` → `analysis` → `in_progress` → `completed` | `archived`

---

## 2. Header/Navbar Implementation

### Main Navbar Component
**File**: `/components/navbar.tsx`
- **Type**: Client component (`'use client'`)
- **Height**: Fixed 64px (h-16)
- **Structure**:
  - Left: Breadcrumb navigation
  - Right: User avatar dropdown (sign out)

### Breadcrumbs Component
**File**: `/components/breadcrumbs.tsx`
- **Type**: Client component with custom event listener pattern
- **Implementation**:
  - Uses custom DOM events (`BREADCRUMB_EVENT`, `BREADCRUMB_CLEAR_EVENT`)
  - Dispatched from pages via `setBreadcrumbs()` and `clearBreadcrumbs()` utilities
  - Fallback navigation based on pathname
  - Shows: Home icon → segments → current page (last segment bold)

### Layout Structure (Dashboard)
**File**: `/app/(dashboard)/layout.tsx`
- **Type**: Async server component
- **Structure**: Flexbox layout
  - Left: `Sidebar` component (full height)
  - Right: Main area (flex column)
    - Top: `Navbar`
    - Bottom: Main content (scrollable)

---

## 3. Work Packages/Documents List Implementation

### Work Package Dashboard Component
**File**: `/components/work-package-dashboard.tsx`
- **Type**: Client component
- **Responsibilities**:
  - Displays count of completed vs total work packages
  - Renders `WorkPackageTable`
  - Handles bulk export option
  - Shows empty state with `AddDocumentDialog`

### Work Package Table Component
**File**: `/components/work-package-table.tsx`
- **Type**: Client component
- **Features**:
  - Table display with columns: Document Type | Assigned To | Status | Actions
  - Assignment dropdown (mock users: Admin, Writer A, Writer B)
  - Status indicators with icons (Circle, CircleCheck, CircleDot)
  - Generate documents dialog integration
  - Parallel generation support with progress tracking
  - Real-time status updates

### Documents Table Component
**File**: `/components/project-documents-table.tsx`
- **Type**: Client component
- **Columns**: Name | Type | Size | Uploaded | Actions
- **Features**:
  - Download button per document
  - Delete button with confirmation
  - Primary RFT badge
  - File size formatting
  - Date/time formatting

---

## 4. Navigation & Header Component Structure

### Sidebar Navigation
**File**: `/components/sidebar.tsx`
- **Type**: Client component with localStorage state persistence
- **Navigation Items**:
  - Projects (FolderKanban icon)
  - Company (Building2 icon)
  - Team (Users icon)
  - Billing (CreditCard icon)
  - Settings (Settings icon)
  - Useful Resources (BookOpen icon)
  - Documentation (FileQuestion icon)
- **Features**:
  - Collapsible sidebar (toggle persisted to localStorage)
  - Active state highlighting (uses `cn()` utility)
  - Create new tender button (responsive)
  - Custom matching functions for active detection

### Active State Detection
```typescript
const isActive = (item: NavItem) => {
  if (item.match) {
    return item.match(pathname)
  }
  return pathname === item.href
}
```

### Header Component (Legacy)
**File**: `/components/header.tsx` - Appears to be unused in dashboard layout

---

## 5. Styling Approach

### Overall Strategy: Tailwind CSS v4 + Custom CSS Variables

#### Configuration
- **Base**: Tailwind CSS v4 with PostCSS
- **CSS Modules**: NOT USED (checked with glob)
- **Styling**: Utility-first Tailwind + Custom CSS variables
- **Typography**: @tailwindcss/typography plugin

### Dashboard-Specific Design Tokens
**File**: `/app/(dashboard)/globals-dashboard.css`

#### CSS Variables (Custom Design System)
```css
--dashboard-primary: #10B981 (green)
--dashboard-primary-hover: #059669
--dashboard-primary-light: rgba(16, 185, 129, 0.1)

Text Colors:
--dashboard-text-primary: #1F2937
--dashboard-text-body: #4B5563
--dashboard-text-secondary: #6B7280
--dashboard-text-muted: #9CA3AF

Backgrounds:
--dashboard-bg-white: #FFFFFF
--dashboard-bg-gray-50: #F9FAFB
--dashboard-bg-gray-100: #F3F4F6

Borders:
--dashboard-border: #E5E7EB
--dashboard-border-light: #D1D5DB

Status Colors:
--dashboard-success: #10B981 (green)
--dashboard-warning: #F59E0B (amber)
--dashboard-error: #EF4444 (red)

Shadows:
--dashboard-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
--dashboard-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15)
```

### Global CSS
**File**: `/app/globals.css`
- Tailwind directives with v4 theme customization
- Custom font families defined
- Color system via CSS variables
- Radius configuration

### Button Styling
**File**: `/components/ui/button.tsx`
- Uses CVA (class-variance-authority) for variants
- Variants: default | destructive | outline | secondary | ghost | link | light
- Sizes: default | sm | lg | icon
- Interactive effects: hover, focus, active states
- SVG icon handling built-in

### Component Library
- **UI Components**: shadcn/ui based (Radix UI primitives + Tailwind)
- **Location**: `/components/ui/`
- **Examples**: button, badge, card, table, dropdown-menu, select, input, etc.

### Responsive Approach
- Mobile-first breakpoints
- sm: | md: | lg: | xl: Tailwind prefixes
- Dashboard has specific responsive adjustments in globals-dashboard.css

### Color System Organization
1. **Landing page** uses default Tailwind theme (app/globals.css)
2. **Dashboard** overrides with custom variables (app/(dashboard)/globals-dashboard.css)
3. This prevents style conflicts between marketing and app areas

---

## 6. State Management Patterns

### Current Approach: Component-Level React State
- **No global state manager** (Zustand, Redux, Context API not heavily used)
- **Pattern**: useState + useCallback + useEffect
- **Data Flow**: Fetch in component → setState → re-render
- **Persistence**: localStorage for sidebar collapse state only

### Example (Project Page):
```typescript
const [project, setProject] = useState<Project | null>(null)
const [documents, setDocuments] = useState<Document[]>([])
const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
const [loading, setLoading] = useState(true)

const loadData = useCallback(async () => {
  setLoading(true)
  try {
    const [projectRes, docsRes, packagesRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/documents`),
      fetch(`/api/projects/${projectId}/work-packages`),
    ])
    // ... process responses
  } finally {
    setLoading(false)
  }
}, [projectId])
```

### Breadcrumb State Management
- **Pattern**: Custom DOM events + component state
- **Event Names**: `breadcrumb-set`, `breadcrumb-clear`
- **Broadcast Function**: `setBreadcrumbs()` dispatches CustomEvent
- **Listener**: Breadcrumbs component listens with useEffect

### Form State
- **Library**: react-hook-form
- **Validation**: Zod schema validation
- **Components**: EditProjectDetailsDialog, CreateProjectDialog

### API Call Patterns
- **Fetch API** used directly (no axios/fetch wrapper)
- **Error handling**: try-catch blocks
- **Toast notifications**: sonner library for user feedback
- **Parallel requests**: Promise.all()

---

## 7. UI Versioning & Theming Systems

### Theme Provider
**File**: `/components/theme-provider.tsx`
- Wraps app with theme context
- Uses next-themes library
- Dark/light mode support (though dashboard doesn't seem to use it heavily)

### StyleGlide Integration
**Files**: 
- `/components/styleglide-provider.tsx`
- Dependency: `@styleglide/kit-view-provider` v0.0.8

### Existing UI Patterns/Versions
1. **shadcn/ui Components** - Primary component library
2. **Dashboard Custom Styling** - Green/emerald color scheme
3. **Workflow Components** - Specialized editor/strategy/export screens
4. **MagicUI Components** - Animated marquee for marketing

### Color Theming
- Primary: Emerald/Green (#10B981)
- No dark mode implementation in dashboard yet
- Responsive color adjustments in CSS variables

---

## 8. Key File Locations & Architecture

### Directory Structure
```
/app
  /dashboard/          # All dashboard routes
    /projects/[id]/    # Project detail page
    /work-packages/[id]/ # Work package detail page
    layout.tsx         # Dashboard layout
    globals-dashboard.css # Dashboard theme

/components
  /ui/                 # shadcn/ui components
  /workflow-steps/     # Editor, strategy, export screens
  /sections/          # Landing page sections
  navbar.tsx
  sidebar.tsx
  breadcrumbs.tsx
  work-package-dashboard.tsx
  work-package-table.tsx
  project-documents-table.tsx

/libs
  /repositories/      # Data access layer
    projects.ts
    work-packages.ts
    project-documents.ts
  /supabase/         # Client/server utilities
  /ai/               # AI integration (Gemini)
  /utils/            # Helpers (breadcrumbs, bulk export, etc.)

/types
  database.ts        # TypeScript interfaces for DB models

/app/api/            # API routes
  /projects/[id]/
  /work-packages/[id]/
```

### Data Access Layer
**Location**: `/libs/repositories/`
- Repository pattern for data operations
- Each entity has dedicated file (projects.ts, work-packages.ts, etc.)
- Functions: list, get, create, update, delete

### API Route Patterns
**Location**: `/app/api/`
- Middleware-based auth check: `withAuth(handleGET)`
- Response format: `apiSuccess(data)` / `apiError(error)`
- Dynamic params: `await routeContext.params` (Next.js 15 syntax)

---

## 9. Key Technologies & Dependencies

### Framework & Runtime
- Next.js 15.5.2 (Turbopack enabled)
- React 19.1.1
- TypeScript 5

### UI & Styling
- Tailwind CSS 4
- Radix UI (multiple @radix-ui/react-* packages)
- shadcn/ui components
- class-variance-authority (CVA)
- tailwind-merge
- clsx

### Form & Validation
- react-hook-form
- zod

### Data & API
- Supabase (@supabase/supabase-js, @supabase/ssr)
- Fetch API (native)

### Notifications
- sonner (toast notifications)

### Icons
- lucide-react

### AI/Content Generation
- @google/generative-ai (Gemini)
- js-tiktoken (token counting)

### Document Processing
- docx (DOCX generation)
- pdf-parse
- mammoth (DOCX parsing)
- turndown (HTML to Markdown)
- officeparser

### Utilities
- lodash
- uuid
- framer-motion / motion (animations)
- next-themes

---

## 10. Current Design Patterns & Best Practices

### Component Organization
- Functional components with hooks
- Client vs Server components clearly marked
- UI components in `/components/ui/` (shadcn/ui)
- Feature components in `/components/`
- Dialog patterns for modals

### Error Handling
- Try-catch blocks in async operations
- Toast notifications for user feedback
- Fallback UI states (loading, empty, error)

### Performance
- useCallback for stable function references
- useMemo for computed values
- Parallel fetches with Promise.all()
- LoadingSpinner component for feedback

### Naming Conventions
- PascalCase for components
- kebab-case for file names
- camelCase for functions/variables
- Suffixes: Component → -trigger, -dialog, -table, -dashboard

### CSS Organization
- Global styles in app/globals.css
- Dashboard overrides in app/(dashboard)/globals-dashboard.css
- Scoped to layouts to prevent conflicts
- Inline Tailwind for component-level styling

---

## Summary Table

| Aspect | Implementation |
|--------|-----------------|
| Routing | Next.js App Router (dynamic routes) |
| Data Fetching | Client-side fetch() with useState |
| State Management | Component-level React state |
| Styling | Tailwind CSS v4 + Custom CSS variables |
| UI Components | shadcn/ui (Radix UI + Tailwind) |
| Database | Supabase (PostgreSQL) |
| Forms | react-hook-form + zod |
| Notifications | sonner |
| Authentication | Supabase Auth (middleware protected) |
| AI Integration | Google Gemini API |
| Theming | next-themes (not heavily used) |
| Theme Colors | Green (#10B981) primary, custom palette |
| Component Pattern | Functional components with hooks |
| Documentation | Comments in code, AI docs folder |


---

## Appendix: Architecture Diagrams

### Project Page Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│  /projects/[id] Page Component                               │
│  (/app/(dashboard)/projects/[id]/page.tsx)                   │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    useEffect    useCallback
        │             │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ loadData()  │
        └──────┬──────┘
               │
        ┌──────┴────────────────────┐
        │  Promise.all() - 3 calls  │
        └────┬──────────┬──────────┬┘
             │          │          │
       ┌─────▼─┐   ┌────▼────┐  ┌─▼──────────────┐
       │ GET   │   │ GET     │  │ GET            │
       │/api/  │   │/api/    │  │/api/projects/  │
       │projects│   │projects │  │{id}/work-      │
       │/{id}  │   │/{id}/   │  │packages        │
       └──┬────┘   │documents│  └────────────────┘
          │        └────┬────┘
          │             │
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │ setState()  │
          │ ×3 setters  │
          └──────┬──────┘
                 │
          ┌──────▼──────────────────────────┐
          │ Render UI Components:           │
          ├────────────────────────────────┤
          │ - Project Header               │
          │ - Quick Stats Grid             │
          │ - Documents Table              │
          │ - WorkPackageDashboard         │
          │ - Status Badges                │
          └────────────────────────────────┘
```

### Component Hierarchy
```
DashboardLayout
├── Sidebar (navigation)
└── Main Content Area
    ├── Navbar (breadcrumbs + user menu)
    └── Project Page Component
        ├── Header Section (title, buttons)
        ├── Project Card
        │   ├── Quick Stats Grid (5 stats)
        │   ├── Status Badge
        │   ├── Project Avatar
        │   └── Summary Text
        ├── Documents Section
        │   ├── Section Header (Add button)
        │   └── ProjectDocumentsTable
        │       └── TableRow ×n (documents)
        └── Work Packages Section
            └── WorkPackageDashboard
                ├── Section Header
                └── WorkPackageTable
                    ├── Header (Generate All button)
                    └── TableRow ×n (work packages)
                        ├── Document Type (col)
                        ├── Assigned To (col with dropdown)
                        ├── Status (col with icon)
                        └── Actions (col with Open btn)
```

### Data Models & Relationships
```
Project
├── id
├── organization_id
├── name
├── client_name
├── start_date
├── deadline
├── status (setup → analysis → in_progress → completed | archived)
├── instructions
├── created_at
└── updated_at
    │
    ├── Has Many: Documents
    │   └── ProjectDocument
    │       ├── id
    │       ├── name
    │       ├── file_type
    │       ├── file_size
    │       ├── uploaded_at
    │       ├── is_primary_rft
    │       └── download_url
    │
    └── Has Many: WorkPackages
        └── WorkPackage
            ├── id
            ├── document_type
            ├── document_description
            ├── status (pending → in_progress → review → completed)
            ├── assigned_to
            ├── order
            ├── created_at
            ├── updated_at
            └── requirements (Array)
                ├── id
                ├── text
                ├── priority (mandatory | optional)
                └── source
```

### Styling System Hierarchy
```
Global Scope (app/globals.css)
├── Tailwind v4 base
├── Font families
└── Default theme colors
    │
    └── Used by: Marketing pages, Landing page

Dashboard Scope (app/(dashboard)/globals-dashboard.css)
├── Dashboard-specific CSS variables
│   ├── Colors (primary, text, backgrounds, borders, status)
│   ├── Shadows
│   ├── Spacing
│   └── Typography
│
├── Component-specific overrides
│   ├── Buttons
│   ├── Cards
│   ├── Tables
│   ├── Forms
│   ├── Badges
│   └── Progress indicators
│
└── Used by: Dashboard pages, project pages, work package pages

Inline Component Styles
├── Tailwind utility classes
├── CVA variants (button, badge, etc.)
└── Dynamic className generation (cn() utility)
```

### API Request Patterns
```
Client Component (Page)
    │
    ├─ fetch('GET /api/projects/{id}')
    │  └─ API Route Handler
    │     ├─ withAuth() middleware
    │     ├─ getProject(supabase, id)
    │     └─ Repository → Supabase
    │
    ├─ fetch('POST /api/projects/{id}/documents', FormData)
    │  └─ API Route Handler
    │     ├─ withAuth() middleware
    │     ├─ File processing
    │     └─ Repository → Supabase
    │
    ├─ fetch('PUT /api/projects/{id}', JSON)
    │  └─ API Route Handler
    │     ├─ withAuth() middleware
    │     ├─ updateProject(supabase, id, data)
    │     └─ Repository → Supabase
    │
    └─ fetch('DELETE /api/projects/{id}/documents/{docId}')
       └─ API Route Handler
          ├─ withAuth() middleware
          └─ Repository → Supabase
```

### Breadcrumb System Flow
```
Page Component (e.g., ProjectDetailPage)
    │
    ├─ useEffect(() => {
    │   setBreadcrumbs([
    │     { label: 'Projects', href: '/projects' },
    │     { label: project.name, href: `/projects/${id}` }
    │   ])
    │ })
    │
    ├─ Dispatch CustomEvent('breadcrumb-set', { segments })
    │
    └─ Event propagates to window
        │
        └─ Navbar Component
            │
            ├─ useEffect(() => {
            │   window.addEventListener('breadcrumb-set', handler)
            │ })
            │
            ├─ setState(customSegments)
            │
            └─ Breadcrumbs Component
               │
               ├─ Receives segments from parent (Navbar)
               │
               ├─ Falls back to pathname-based derivation
               │
               └─ Renders: Home / Segment1 / Segment2 / CurrentSegment
```

### State Management Pattern
```
Component State
├── project (Project | null)
├── documents (ProjectDocument[])
├── workPackages (WorkPackage[])
└── loading (boolean)
    │
    ├─ Managed by: useState()
    ├─ Updated by: loadData() callback
    │
    └─ Trigger recompute:
       ├─ Manual: onUpdate() function
       └─ Automatic: useEffect dependency array

Local Storage
└─ sidebarCollapsed (boolean)
   ├─ Key: 'sidebarCollapsed'
   └─ Used by: Sidebar component
```

---

## File Cross-Reference

### Core Pages
- **Project List**: `/app/(dashboard)/projects/page.tsx`
- **Project Detail**: `/app/(dashboard)/projects/[id]/page.tsx` ← MAIN FOCUS
- **Work Package Detail**: `/app/(dashboard)/work-packages/[id]/page.tsx`

### Components Used in Project Detail
- `ProjectDocumentsTable` - document list display
- `WorkPackageDashboard` - work package list wrapper
- `WorkPackageTable` - work package table display
- `EditProjectDetailsDialog` - edit project form
- `DeleteProjectDialog` - delete confirmation
- `FileUpload` - document upload handler
- `AnalysisTrigger` - analyze RFT button
- `AddDocumentDialog` - add work package dialog
- `BulkExportButton` - export all documents
- `LoadingSpinner` - loading indicator
- `EmptyState` - no data state

### Utilities & Helpers
- `setBreadcrumbs()` / `clearBreadcrumbs()` - `/libs/utils/breadcrumbs.ts`
- `cn()` - class name merge utility - `/lib/utils.ts`
- `formatDate()` - inline date formatter
- `getInitials()` - inline initial generator
- `parallelGenerateDocuments()` - bulk generation - `/libs/utils/parallel-generation.ts`

### Repositories (Data Access)
- `getProject()`, `updateProject()`, etc. - `/libs/repositories/projects.ts`
- `listWorkPackages()`, `getWorkPackage()`, etc. - `/libs/repositories/work-packages.ts`
- `listProjectDocuments()`, etc. - `/libs/repositories/project-documents.ts`

