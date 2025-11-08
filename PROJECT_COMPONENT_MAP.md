# Project /:id - Component Hierarchy & Integration Map

## Component Tree

```
ProjectDetailPage (pages/[id]/page.tsx - 431 lines)
│
├─ Navigation Section
│  ├─ Link (Back to projects)
│  ├─ EditProjectDetailsDialog (button trigger)
│  └─ DeleteProjectDialog (button trigger)
│
├─ Main Project Card
│  ├─ Project Header
│  │  ├─ h1 (project.name)
│  │  └─ p (description)
│  ├─ Quick Stats Grid (useMemo)
│  │  └─ 5x stat boxes
│  │     ├─ Client Name
│  │     ├─ Start Date (formatDate)
│  │     ├─ Deadline (formatDate)
│  │     ├─ Time Left (calculated)
│  │     └─ Project Status
│  ├─ Right Side (flex col)
│  │  ├─ Status Badge (conditional tone color)
│  │  └─ Initials Avatar (getInitials)
│  │
│  └─ Documents Section (border-t divider)
│     ├─ Section header + "Add document" button
│     └─ ProjectDocumentsTable (component)
│        ├─ Empty State OR
│        └─ Table
│           ├─ TableHeader
│           └─ TableBody
│              └─ TableRow[] (one per document)
│                 ├─ Name cell (+ Primary RFT badge if applicable)
│                 ├─ Type cell
│                 ├─ Size cell (formatFileSize)
│                 ├─ Uploaded cell (formatDateTime)
│                 └─ Actions cell
│                    ├─ Download Button (if download_url)
│                    ├─ Make Primary Button (if not primary)
│                    └─ Delete Button
│
├─ Work Area (conditional sections)
│  │
│  ├─ WHEN: workPackages.length === 0 && documents.length === 0
│  │  └─ FileUpload (component)
│  │     ├─ Tab navigation (Upload / Paste Text)
│  │     ├─ Drag & drop zone (upload tab)
│  │     ├─ Form (paste tab)
│  │     │  ├─ Input (document name)
│  │     │  └─ Textarea (content)
│  │     └─ Submit button
│  │
│  ├─ WHEN: status === 'setup' && documents.length > 0
│  │  └─ AnalysisTrigger (component)
│  │     ├─ StreamingProgress (sub-component)
│  │     └─ "Analyze RFT" Button
│  │
│  └─ WHEN: status === 'in_progress'
│     ├─ WorkPackageDashboard (component)
│     │  ├─ Header
│     │  │  ├─ Title + Progress Counter ("X of Y completed")
│     │  │  └─ Action Buttons
│     │  │     ├─ AddDocumentDialog
│     │  │     └─ BulkExportButton (conditional)
│     │  └─ WorkPackageTable (component)
│     │     ├─ Table Header
│     │     └─ Table Body
│     │        └─ TableRow[] (one per work package)
│     │           ├─ Document Type cell
│     │           ├─ Description cell
│     │           ├─ Requirements cell
│     │           ├─ Assigned To (Select dropdown)
│     │           │  └─ Assignee selector (mock users)
│     │           ├─ Status cell
│     │           │  └─ Status indicator (Circle icons)
│     │           └─ Actions cell
│     │              ├─ Open Button (navigate)
│     │              └─ Generate Documents Button
│     │                 └─ GenerateDocumentsDialog
│     │
│     └─ OR WHEN: workPackages.length === 0
│        └─ EmptyState (component)
│           ├─ Icon (FileQuestion)
│           ├─ Heading
│           ├─ Description
│           └─ CTA (AddDocumentDialog)
│
└─ Dialogs (overlays)
   ├─ EditProjectDetailsDialog (modal)
   │  ├─ Sidebar (info + tips)
   │  ├─ Form
   │  │  ├─ Project name input
   │  │  ├─ Client name input
   │  │  ├─ Start date input
   │  │  ├─ Deadline input
   │  │  ├─ Project summary textarea
   │  │  └─ Error message (conditional)
   │  └─ Button group (Cancel / Save)
   │
   ├─ DeleteProjectDialog (confirmation)
   │
   ├─ AddDocumentDialog (in WorkPackageDashboard)
   │
   └─ GenerateDocumentsDialog (in WorkPackageTable rows)
```

## Component Imports in ProjectDetailPage

```typescript
'use client'

// UI Components
import { Button }              // /components/ui/button
import { LoadingSpinner }      // /components/ui/loading-spinner
import { Link }                // from next/link

// Feature Components
import { AnalysisTrigger }                    // ./analysis-trigger
import { DeleteProjectDialog }                // ./delete-project-dialog
import { EditProjectDetailsDialog }           // ./edit-project-details-dialog
import { EmptyState }                         // ./empty-state
import FileUpload                             // ./file-upload
import { ProjectDocumentsTable }              // ./project-documents-table
import { WorkPackageDashboard }               // ./work-package-dashboard

// Icons
import { ArrowLeft, FileQuestion, Plus }     // from lucide-react

// Utilities
import { clearBreadcrumbs, setBreadcrumbs }  // from @/libs/utils/breadcrumbs
import { toast }                              // from sonner
import { useParams, useRouter }               // from next/navigation
```

## Data Flow Diagram

```
ProjectDetailPage (parent)
│
├─ STATE: project, documents, workPackages, loading
├─ EFFECT: loadData() on mount
│
├─ HANDLER: handleUpload → POST /api/projects/[id]/documents → loadData()
│
├─ HANDLER: handlePasteText → POST /api/projects/[id]/documents → loadData()
│
├─ HANDLER: handleDeleteDocument → DELETE /api/projects/[id]/documents/[docId] → loadData()
│
├─ HANDLER: handleSetPrimaryDocument → POST /api/projects/[id]/documents/[docId]/primary → loadData()
│
├─ HANDLER: handleProjectUpdate → PUT /api/projects/[id] → setState(project)
│
├─ PASS TO: EditProjectDetailsDialog
│  ├─ Props: project, onSubmit={handleProjectUpdate}
│  └─ Returns: void (updates parent via callback)
│
├─ PASS TO: ProjectDocumentsTable
│  ├─ Props: documents, onDelete={handleDeleteDocument}, onSetPrimary={handleSetPrimaryDocument}
│  └─ Returns: void (updates parent via callbacks)
│
├─ PASS TO: FileUpload
│  ├─ Props: onUpload={handleUpload}, onPasteText={handlePasteText}
│  └─ Returns: void (updates parent via callbacks)
│
├─ PASS TO: AnalysisTrigger
│  ├─ Props: projectId, projectStatus, onAnalysisComplete={loadData}
│  └─ Returns: void (updates parent via callback)
│
└─ PASS TO: WorkPackageDashboard
   ├─ Props: projectId, workPackages, onUpdate={loadData}, showBulkExport
   ├─ INTERNALLY:
   │  ├─ useRouter() for navigation
   │  ├─ handleAssignmentChange → PUT /api/work-packages/[id]/assign → onUpdate()
   │  ├─ handleStatusChange → PUT /api/work-packages/[id]/status → onUpdate()
   │  └─ handleOpen → router.push('/work-packages/[id]')
   └─ PASS TO: WorkPackageTable
      ├─ Props: workPackages, onAssignmentChange, onStatusChange, onOpen, onRefresh
      ├─ INTERNALLY:
      │  ├─ useState for generation progress tracking
      │  ├─ handleGenerateDocuments → parallel API calls → progress updates
      │  └─ GenerateDocumentsDialog overlay
      └─ Returns: void (updates parent via callbacks)
```

## Event Flow for Common Operations

### Upload Document
```
FileUpload.handleFile(file)
  → fetch POST /api/projects/[id]/documents
  ↓
ProjectDetailPage.handleUpload()
  → fetch POST /api/projects/[id]/documents
  → toast.success()
  → loadData()
    ├─ GET /api/projects/[id]
    ├─ GET /api/projects/[id]/documents
    └─ GET /api/projects/[id]/work-packages
  → setState(documents)
  → ProjectDocumentsTable re-renders
```

### Edit Project Details
```
EditProjectDetailsDialog.handleSubmit()
  → ProjectDetailPage.handleProjectUpdate()
    → fetch PUT /api/projects/[id]
    → toast.success()
    → setState(project)
    → re-render breadcrumbs
  → Close dialog
```

### Analyze RFT
```
AnalysisTrigger.handleAnalyze()
  → fetch POST /api/projects/[id]/analyze (streaming)
  ↓ SSE events received
  ├─ event: progress (type: 'document')
  │  → setDocuments()
  │  → StreamingProgress re-renders
  ├─ event: progress (type: 'complete')
  │  → toast.success('Found X documents')
  ├─ event: done (success: true)
  │  → setTimeout(() => onAnalysisComplete(), 500)
  │  → ProjectDetailPage.loadData()
  │     └─ Re-fetches all data
  │     └─ workPackages populated
  │     └─ UI switches to in_progress view
  └─ event: error
     → toast.error()
```

### Assign Work Package
```
WorkPackageTable.handleAssignmentChange(wpId, userId)
  → WorkPackageDashboard.handleAssignmentChange()
    → fetch PUT /api/work-packages/[wpId]/assign
    → toast.success()
    → onUpdate()
      → ProjectDetailPage.loadData()
        └─ Re-fetches work-packages
```

### Generate Documents
```
WorkPackageTable.generateDocs()
  → GenerateDocumentsDialog.onSubmit()
    → parallelGenerateDocuments() [utility]
      ├─ Track progress per workPackage
      ├─ API calls (parallel)
      └─ Error handling per-doc
    → setGenerationProgress()
    → toast updates
    → onRefresh() (if all complete)
      → WorkPackageDashboard.onUpdate()
        → ProjectDetailPage.loadData()
```

## Prop Drilling Summary

```
ProjectDetailPage
├─ project (state) → many child components
├─ documents (state) → ProjectDocumentsTable, FileUpload
├─ workPackages (state) → WorkPackageDashboard
├─ loadData (callback) → AnalysisTrigger, WorkPackageDashboard
├─ handleUpload (callback) → FileUpload
├─ handlePasteText (callback) → FileUpload
├─ handleDeleteDocument (callback) → ProjectDocumentsTable
├─ handleSetPrimaryDocument (callback) → ProjectDocumentsTable
├─ handleProjectUpdate (callback) → EditProjectDetailsDialog
│
└─ WorkPackageDashboard
   ├─ projectId (prop)
   ├─ workPackages (prop)
   ├─ onUpdate (callback) → AnalysisTrigger, DeleteProjectDialog
   ├─ showBulkExport (prop)
   │
   └─ WorkPackageTable
      ├─ workPackages (prop)
      ├─ onAssignmentChange (callback)
      ├─ onStatusChange (callback)
      ├─ onOpen (callback)
      └─ onRefresh (callback)
```

## File Size & Complexity

| Component | Lines | Complexity | Main Concerns |
|-----------|-------|-----------|---|
| ProjectDetailPage | 431 | High | Multiple state vars, 5+ handlers, conditional rendering |
| ProjectDocumentsTable | 129 | Low | Simple table rendering, 3 actions |
| WorkPackageDashboard | 143 | Medium | Composition component, progress tracking |
| WorkPackageTable | 140+ | High | Dynamic generation, progress tracking, dropdowns |
| EditProjectDetailsDialog | 223 | Medium | Form state, validation, dialog lifecycle |
| FileUpload | 120+ | Medium | Tab switching, drag-drop, upload states |
| AnalysisTrigger | 113 | Medium | SSE streaming, progress updates |
| EmptyState | 40 | Low | Simple presentational component |

## Styling Approach

- **No CSS-in-JS**: Pure Tailwind class strings
- **No styled-components**: Direct className attrs
- **Responsive first**: Mobile-first with sm:, md:, lg: prefixes
- **Token-based colors**: primary, muted, destructive from theme
- **Radix UI**: Unstyled components + Tailwind styling

## Dependencies Used

```
React 18+
Next.js 13+ (app router, useRouter, useParams)
Radix UI (primitives: Dialog, Select, etc.)
Tailwind CSS (styling)
lucide-react (icons)
sonner (toasts)
Supabase (client + server auth)
```

## Key Custom Hooks

- `useParams()` - Get [id] from URL
- `useRouter()` - Navigate programmatically
- `useCallback()` - Stable function references
- `useMemo()` - Expensive computations
- `useEffect()` - Side effects (breadcrumbs, data loading)

## Notable Absence

- No Context API usage
- No Redux/Zustand
- No React Query/SWR
- No form library (react-hook-form, formik)
- No animation library
