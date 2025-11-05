# Phase: Single Document Workflow

## Phase Description

Phase 4 implements complete single work package workflow enabling users to generate professional tender documents through a guided 5-step process: Requirements Analysis → Strategy & Planning → Content Generation → Intelligent Editing → Export. Users review document requirements extracted in Phase 2, generate win themes and key messages using AI, trigger full document generation with Gemini using complete context (all org docs + RFT + requirements + win themes), edit content using TipTap rich text editor with AI-powered inline actions (expand, shorten, add evidence, check compliance, custom instruction), and export as professional Word (.docx) documents. The workflow includes comprehensive state management, proper auto-status transitions (not_started → in_progress on generation, manual → completed on export), and maintains consistency with established Gemini API patterns. TipTap editor implementation includes rigorous testing across screen sizes, browser compatibility, and regression prevention to ensure stable editing experience.

## Phase Objectives

- Build 5-screen workflow: Requirements → Strategy → Generate → Edit → Export
- Implement requirements analysis screen with view-only display and navigation
- Create AI win themes generation using project context (org docs + RFT + requirements)
- Build content generation with full context dump to Gemini (consistent with existing patterns)
- Integrate TipTap rich text editor with toolbar, formatting, and content display
- Implement AI assistance menu with 6 actions: expand, shorten, add evidence, rephrase, check compliance, custom instruction
- Create Word (.docx) export functionality with proper formatting preservation
- Add automatic status transitions: in_progress on generation start, completed on export
- Build E2E test covering complete workflow from requirements to export
- Ensure TipTap stability through comprehensive testing (screen sizes, browsers, regressions)

## Problem Statement

After Phase 3, users can assign work packages and navigate to work package detail pages, but encounter placeholder "Workflow coming in Phase 4" message. Critical gaps preventing content creation:
- **No requirements review** - Can't validate/understand what needs to be addressed
- **No strategic planning** - Missing win themes and key messages to guide content
- **No content generation** - Can't trigger AI to write document
- **No editing capability** - Can't refine or customize generated content
- **No AI assistance** - Manual editing without intelligent support for evidence/compliance
- **No export** - Can't produce deliverable Word documents for submission
- **No status tracking** - Work packages stuck at not_started, no workflow progress indication

Without Phase 4, the platform is non-functional for actual tender response work.

## Solution Statement

Build tabbed workflow interface at `/work-packages/[id]` route with 5 sequential tabs: Requirements Analysis displays extracted requirements from work_package.requirements JSONB with count badges and source references (view-only, can return to Phase 3 dashboard for editing). Strategy & Planning screen generates 3-5 win themes and key messages by calling Gemini with full project context (org docs + RFT + requirements), stores in work_package_content.win_themes, allows user editing before proceeding. Content Generation screen triggers document creation via Gemini API (maintaining consistency with existing libs/ai/analysis.ts patterns), assembles complete context dump (<1M tokens: org docs + RFT + requirements + win themes + project instructions), streams or batch generates based on complexity, saves to work_package_content.content, auto-transitions status to 'in_progress'. Intelligent Editing screen uses TipTap editor with custom toolbar, displays generated markdown/HTML content, implements text selection menu showing 6 AI actions (each calling separate API endpoint), actions send selected text + full document context + specific instruction to Gemini, response replaces selection with animation. Export screen generates Word document using docx.js library, preserves formatting (headings, lists, bold, italic), downloads file, marks work_package status as 'completed', shows success message with "Back to Dashboard" button. Implement comprehensive TipTap testing strategy: unit tests for editor initialization, integration tests for AI actions, visual regression tests across viewports (mobile 375px, tablet 768px, desktop 1440px), browser compatibility tests (Chrome, Firefox, Safari), regression prevention through snapshot testing of critical editor states.

## Dependencies

### Previous Phases

**Phase 1 (Core Schema & Project Structure)** - Required:
- work_packages and work_package_content tables with JSONB fields
- Gemini client configured at libs/ai/client.ts
- Repository pattern established
- File storage for exports (Supabase Storage)

**Phase 2 (AI Analysis & Document Decomposition)** - Required:
- work_packages.requirements populated with extracted requirements
- Gemini prompt patterns in libs/ai/prompts/
- Text extraction from org and project documents completed

**Phase 3 (Work Package Assignment)** - Required:
- Work package detail route at /work-packages/[id]
- Status field ready for transitions (not_started → in_progress → completed)
- Navigation from dashboard to work package established
- getWorkPackageWithProject repository function

### External Dependencies

**New npm packages required:**
- `@tiptap/react` - TipTap editor React integration
- `@tiptap/starter-kit` - Basic editor extensions (headings, lists, bold, italic, etc.)
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-character-count` - Word count display
- `docx` - Word document generation library
- `file-saver` - File download utility

**Already installed:**
- `@google/generative-ai` - Gemini API client
- `@supabase/supabase-js` - Database operations
- `zod` - Validation
- `uuid` - Unique ID generation

## Relevant Files

**Existing files from previous phases:**
- `libs/ai/client.ts` - Gemini client (use for all AI operations)
- `libs/ai/analysis.ts` - Analysis patterns (reference for consistency)
- `libs/ai/prompts/analyze-rft.ts` - Prompt patterns (follow same structure)
- `libs/repositories/work-packages.ts` - Work package operations (extend with content operations)
- `app/(dashboard)/work-packages/[id]/page.tsx` - Work package detail shell (replace with workflow)
- `ai_docs/documentation/standards/integration-contracts.md` - API contracts
- `ai_docs/documentation/standards/coding_patterns.md` - Component patterns
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_basic_query.md` - E2E test format example

### New Files

**AI Prompt Templates** (`libs/ai/prompts/`):
- `libs/ai/prompts/generate-win-themes.ts` - Win themes generation prompt
- `libs/ai/prompts/generate-content.ts` - Main document generation prompt
- `libs/ai/prompts/editor-actions.ts` - Editor AI actions prompts (expand, shorten, add evidence, rephrase, check compliance, custom)

**AI Service Functions** (`libs/ai/`):
- `libs/ai/content-generation.ts` - Content generation logic
  - `generateWinThemes(workPackage, orgDocs, rftDocs): Promise<string[]>`
  - `generateDocumentContent(workPackage, orgDocs, rftDocs, winThemes, instructions): Promise<string>`
  - `executeEditorAction(action, selectedText, fullDocument, context): Promise<string>`
- `libs/ai/context-assembly.ts` - Context assembly utilities
  - `assembleProjectContext(projectId): Promise<ContextObject>`
  - `validateContextSize(context): { valid: boolean, tokenEstimate: number }`

**Repository Extensions** (`libs/repositories/`):
- `libs/repositories/work-package-content.ts` - Work package content CRUD
  - `getWorkPackageContent(supabase, workPackageId): Promise<WorkPackageContent | null>`
  - `createWorkPackageContent(supabase, data): Promise<WorkPackageContent>`
  - `updateWorkPackageContent(supabase, id, data): Promise<WorkPackageContent>`
  - `saveWinThemes(supabase, workPackageId, themes): Promise<void>`
  - `saveGeneratedContent(supabase, workPackageId, content): Promise<void>`

**API Routes** (`app/api/`):
- `app/api/work-packages/[id]/win-themes/route.ts` - POST generate win themes
- `app/api/work-packages/[id]/generate-content/route.ts` - POST generate document content
- `app/api/work-packages/[id]/editor-action/route.ts` - POST execute editor AI action
- `app/api/work-packages/[id]/export/route.ts` - POST export to Word document

**UI Components** (`components/workflow/`):
- `components/workflow/workflow-tabs.tsx` - Tab navigation component (Requirements, Strategy, Generate, Edit, Export)
- `components/workflow/requirements-view.tsx` - Requirements analysis screen
- `components/workflow/strategy-screen.tsx` - Win themes generation and editing
- `components/workflow/generation-screen.tsx` - Content generation trigger with loading
- `components/workflow/editor-screen.tsx` - TipTap editor with AI menu
- `components/workflow/export-screen.tsx` - Export and completion screen
- `components/workflow/ai-action-menu.tsx` - Floating menu for text selection AI actions
- `components/workflow/content-editor.tsx` - TipTap editor wrapper component
- `components/workflow/editor-toolbar.tsx` - Custom TipTap toolbar
- `components/workflow/generation-progress.tsx` - Loading state during generation

**Utilities** (`libs/utils/`):
- `libs/utils/export-docx.ts` - Word document generation utilities
  - `convertMarkdownToDocx(markdown: string, metadata: DocumentMetadata): Promise<Blob>`
  - `downloadDocx(blob: Blob, filename: string): void`

**Test Files**:
- `.claude/commands/e2e/test_phase_4_workflow.md` - Complete workflow E2E test
- `test_fixtures/sample_generated_content.md` - Sample generated content for testing editor

**Phase Documentation**:
- `ai_docs/documentation/phases_spec/phase_4_single_document_workflow/phase_4_implementation.log` - Implementation tracking

## Acceptance Criteria

✓ Work package detail page shows 5-tab workflow: Requirements, Strategy, Generate, Edit, Export
✓ Requirements screen displays all requirements from work_package.requirements with priority badges and sources
✓ Requirements screen shows requirement count and allows navigation back to dashboard
✓ Strategy screen has "Generate Win Themes" button triggering Gemini API call
✓ Win themes generation uses full context (org docs + RFT + requirements) consistent with existing AI patterns
✓ Strategy screen displays 3-5 generated win themes in editable list
✓ User can edit, add, or remove win themes before proceeding to generation
✓ Generate screen shows "Generate Content" button with document type and requirement summary
✓ Clicking generate triggers API call, auto-transitions work package status to 'in_progress'
✓ Content generation assembles full context dump (<1M tokens total)
✓ Generation shows loading state (spinner or progress indicator)
✓ Generated content saves to work_package_content.content field
✓ Edit screen displays TipTap editor with generated content rendered
✓ TipTap toolbar shows formatting options: headings, bold, italic, lists, undo/redo
✓ User can edit content freely with standard rich text editing
✓ Selecting text shows floating AI action menu with 6 options
✓ Each AI action (expand, shorten, add evidence, rephrase, check compliance, custom) calls API endpoint
✓ AI action responses replace selected text with smooth animation
✓ Custom instruction action shows input dialog for user-provided instruction
✓ Editor auto-saves content periodically (every 30 seconds)
✓ Export screen shows document preview and export button
✓ Clicking export generates Word (.docx) file preserving formatting
✓ Export triggers download and marks work package status as 'completed'
✓ Export screen shows success message with "Back to Dashboard" button
✓ Tab navigation prevents skipping steps (must complete in order)
✓ All Gemini API calls use consistent pattern from libs/ai/client.ts
✓ All prompts follow structure from libs/ai/prompts/ templates
✓ TipTap editor tested across screen sizes: mobile 375px, tablet 768px, desktop 1440px
✓ TipTap editor tested in Chrome, Firefox, Safari (no regressions)
✓ E2E test validates complete workflow: requirements → strategy → generate → edit → export
✓ No TypeScript errors, build succeeds

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Install Dependencies

**Command:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count docx file-saver
npm install --save-dev @types/file-saver
```

**Verify:**
- Check package.json for all packages
- Run `npm run build` to ensure no conflicts

### 2. Create Work Package Content Repository

**File:** `libs/repositories/work-package-content.ts`

**Functions:**
- `getWorkPackageContent(supabase, workPackageId)` - Fetch content record by work package ID
  - Return null if not exists (first time generation)
- `createWorkPackageContent(supabase, data)` - Insert new content record
  - Fields: work_package_id, win_themes, content, content_version (default 1)
- `updateWorkPackageContent(supabase, id, data)` - Update existing content
  - Increment content_version on each update
  - Update updated_at timestamp
- `saveWinThemes(supabase, workPackageId, themes)` - Save win themes array
  - Create content record if doesn't exist
  - Update win_themes field
- `saveGeneratedContent(supabase, workPackageId, content)` - Save generated document
  - Update content field
  - Set content_extracted = true
- `saveExportedFile(supabase, workPackageId, filePath)` - Save export metadata
  - Update exported_file_path
  - Set exported_at timestamp

**Types:**
```typescript
interface WorkPackageContent {
  id: string
  work_package_id: string
  win_themes: string[]
  key_messages: string[]
  content: string // HTML/Markdown
  content_version: number
  exported_file_path: string | null
  exported_at: string | null
  created_at: string
  updated_at: string
}
```

**Export:** Add to `libs/repositories/index.ts`

### 3. Create Context Assembly Utility

**File:** `libs/ai/context-assembly.ts`

**Function:** `assembleProjectContext(supabase, projectId)`
- Fetch project with instructions
- Fetch all organization documents with content_text
- Fetch all project documents with content_text
- Concatenate texts with clear separators
- Calculate token estimate (rough: text.length / 4)
- Return context object:
  ```typescript
  interface ProjectContext {
    project: Project
    organizationDocs: string // Concatenated
    rftDocs: string // Concatenated
    totalTokensEstimate: number
  }
  ```

**Function:** `validateContextSize(context)`
- Check if totalTokensEstimate < 1,000,000 (1M limit)
- Return { valid: boolean, tokenEstimate: number }
- Log warning if approaching limit (>800K tokens)

### 4. Create Win Themes Generation Prompt

**File:** `libs/ai/prompts/generate-win-themes.ts`

**Function:** `buildWinThemesPrompt(workPackage, orgDocs, rftDocs)`

**Prompt structure:**
```
You are creating win themes for a tender response document.

Project Context:
- Document Type: {workPackage.document_type}
- Description: {workPackage.document_description}

Requirements to Address:
{workPackage.requirements.map(r => `- [${r.priority}] ${r.text} (${r.source})`).join('\n')}

Organization Knowledge (demonstrate our capabilities):
{orgDocs}

RFT Documents (understand client needs):
{rftDocs}

Task: Generate 3-5 win themes that:
1. Directly address the mandatory requirements
2. Leverage our organizational strengths from company documents
3. Differentiate us from competitors
4. Are specific and actionable (not generic)
5. Align with client needs evident in RFT

Output as valid JSON only (no markdown):
{
  "win_themes": [
    "Win theme 1: Specific differentiator...",
    "Win theme 2: Another key strength...",
    "Win theme 3: Competitive advantage..."
  ]
}

Return only valid JSON. No text before or after.
```

### 5. Create Content Generation Prompt

**File:** `libs/ai/prompts/generate-content.ts`

**Function:** `buildContentPrompt(workPackage, context, winThemes, instructions)`

**Prompt structure:**
```
You are writing a {workPackage.document_type} for a tender response.

Project: {context.project.name}
Client: {context.project.client_name}
Deadline: {context.project.deadline}

Document Type: {workPackage.document_type}
Description: {workPackage.document_description}

Requirements to Address (MUST address all mandatory):
{workPackage.requirements.map(r => `- [${r.priority}] ${r.text} (Source: ${r.source})`).join('\n')}

Win Themes (incorporate naturally):
{winThemes.map((t, i) => `${i+1}. ${t}`).join('\n')}

Organization Knowledge (use to demonstrate capabilities):
{context.organizationDocs}

RFT Documents (understand requirements from):
{context.rftDocs}

User Instructions:
{instructions || 'None provided'}

Task:
Write a comprehensive, professional {workPackage.document_type} that:
1. Addresses EVERY mandatory requirement explicitly
2. Incorporates the win themes naturally throughout
3. Demonstrates our capabilities using evidence from organization documents
4. Maintains professional tone appropriate for tender submission
5. Is well-structured with clear headings and logical flow
6. Uses specific examples and data where available
7. Meets typical length expectations for {workPackage.document_type} (comprehensive but concise)

Output as well-formatted Markdown with:
- # Main heading
- ## Section headings
- ### Subsection headings
- **Bold** for emphasis
- - Bullet lists where appropriate
- 1. Numbered lists for sequences

Return only the document content in Markdown format. No preamble or explanation.
```

### 6. Create Editor Actions Prompts

**File:** `libs/ai/prompts/editor-actions.ts`

**Export functions for each action:**

**1. Expand:**
```typescript
export function buildExpandPrompt(selectedText: string, fullDocument: string, context: string): string {
  return `
Selected text to expand:
"${selectedText}"

Full document context:
${fullDocument}

Supporting knowledge:
${context}

Task: Expand the selected text with 2-3 additional paragraphs providing:
- More specific details and examples
- Supporting evidence from the knowledge base
- Technical depth where appropriate
- Maintain the original tone and style

Return only the expanded text (including the original). No preamble.
`
}
```

**2. Shorten:**
```typescript
export function buildShortenPrompt(selectedText: string): string {
  return `
Text to shorten:
"${selectedText}"

Task: Condense this text to 40-60% of original length while:
- Retaining all key points and critical information
- Maintaining professional tone
- Keeping it clear and readable

Return only the shortened text. No preamble.
`
}
```

**3. Add Evidence:**
```typescript
export function buildAddEvidencePrompt(selectedText: string, orgDocs: string): string {
  return `
Statement needing evidence:
"${selectedText}"

Organization documents (case studies, certifications, projects):
${orgDocs}

Task: Find relevant evidence from organization documents that supports this statement. Add:
- Specific project examples
- Relevant certifications or awards
- Quantitative data (success metrics, scale, etc.)
- Case study references

Return the original text enhanced with 1-2 paragraphs of supporting evidence. Maintain flow.
`
}
```

**4. Rephrase:**
```typescript
export function buildRephrasePrompt(selectedText: string, tone?: string): string {
  return `
Text to rephrase:
"${selectedText}"

Task: Rephrase this text with ${tone || 'professional'} tone while:
- Preserving all key information
- Improving clarity and readability
- Varying sentence structure
- Maintaining appropriate formality for tender document

Return only the rephrased text. No preamble.
`
}
```

**5. Check Compliance:**
```typescript
export function buildCompliancePrompt(selectedText: string, requirements: Requirement[]): string {
  return `
Section to check:
"${selectedText}"

Requirements for this document:
${requirements.map(r => `- [${r.priority}] ${r.text} (${r.source})`).join('\n')}

Task: Analyze this section against the requirements. Provide:
1. Which requirements are addressed (list requirement text)
2. Which requirements are missing or inadequately addressed
3. Specific suggestions for addressing missing requirements

Output as structured text:
✓ Addressed: [list]
✗ Missing: [list]
📝 Suggestions: [specific recommendations]

Be concise but specific.
`
}
```

**6. Custom Instruction:**
```typescript
export function buildCustomPrompt(selectedText: string, instruction: string, fullDocument: string): string {
  return `
Selected text:
"${selectedText}"

Full document context:
${fullDocument}

User instruction:
${instruction}

Task: Apply the user's instruction to the selected text. Return the modified text only. No preamble.
`
}
```

### 7. Create Content Generation Service

**File:** `libs/ai/content-generation.ts`

**Import:** Use `model` from `libs/ai/client.ts` (consistent with existing patterns)

**Function 1:** `generateWinThemes`
```typescript
export async function generateWinThemes(
  workPackage: WorkPackage,
  organizationDocs: string,
  rftDocs: string
): Promise<string[]> {
  try {
    const prompt = buildWinThemesPrompt(workPackage, organizationDocs, rftDocs)
    console.log('[Win Themes] Generating for:', workPackage.document_type)

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Parse JSON (strip markdown fences like in analysis.ts)
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)

    if (!parsed.win_themes || !Array.isArray(parsed.win_themes)) {
      throw new Error('Invalid response structure')
    }

    return parsed.win_themes
  } catch (error) {
    console.error('[Win Themes] Generation failed:', error)
    throw error
  }
}
```

**Function 2:** `generateDocumentContent`
```typescript
export async function generateDocumentContent(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): Promise<string> {
  try {
    const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
    console.log('[Content] Generating document:', workPackage.document_type)
    console.log('[Content] Context size estimate:', context.totalTokensEstimate, 'tokens')

    const result = await model.generateContent(prompt)
    const content = result.response.text()

    console.log('[Content] Generated length:', content.length, 'characters')
    return content
  } catch (error) {
    console.error('[Content] Generation failed:', error)
    throw error
  }
}
```

**Function 3:** `executeEditorAction`
```typescript
export async function executeEditorAction(
  action: 'expand' | 'shorten' | 'add_evidence' | 'rephrase' | 'check_compliance' | 'custom',
  selectedText: string,
  fullDocument: string,
  context: {
    orgDocs?: string
    requirements?: Requirement[]
    customInstruction?: string
  }
): Promise<string> {
  try {
    let prompt: string

    switch (action) {
      case 'expand':
        prompt = buildExpandPrompt(selectedText, fullDocument, context.orgDocs || '')
        break
      case 'shorten':
        prompt = buildShortenPrompt(selectedText)
        break
      case 'add_evidence':
        prompt = buildAddEvidencePrompt(selectedText, context.orgDocs || '')
        break
      case 'rephrase':
        prompt = buildRephrasePrompt(selectedText)
        break
      case 'check_compliance':
        prompt = buildCompliancePrompt(selectedText, context.requirements || [])
        break
      case 'custom':
        prompt = buildCustomPrompt(selectedText, context.customInstruction || '', fullDocument)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log('[Editor Action]', action, 'for', selectedText.length, 'chars')

    const result = await model.generateContent(prompt)
    const modifiedText = result.response.text()

    return modifiedText
  } catch (error) {
    console.error('[Editor Action] Failed:', error)
    throw error
  }
}
```

### 8. Create Win Themes API Route

**File:** `app/api/work-packages/[id]/win-themes/route.ts`

**POST handler:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workPackageId = params.id

    // Get work package with project
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)

    // Assemble context
    const context = await assembleProjectContext(supabase, project.id)

    // Validate context size
    const validation = validateContextSize(context)
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Context too large',
        tokenEstimate: validation.tokenEstimate
      }, { status: 400 })
    }

    // Generate win themes
    const winThemes = await generateWinThemes(
      workPackage,
      context.organizationDocs,
      context.rftDocs
    )

    // Save to database
    await saveWinThemes(supabase, workPackageId, winThemes)

    return NextResponse.json({ success: true, win_themes: winThemes })
  } catch (error) {
    console.error('Win themes generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Generation failed'
    }, { status: 500 })
  }
}
```

### 9. Create Content Generation API Route

**File:** `app/api/work-packages/[id]/generate-content/route.ts`

**POST handler:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workPackageId = params.id

    // Get work package with project and content
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)
    const existingContent = await getWorkPackageContent(supabase, workPackageId)

    if (!existingContent || !existingContent.win_themes || existingContent.win_themes.length === 0) {
      return NextResponse.json({
        error: 'Win themes must be generated first'
      }, { status: 400 })
    }

    // Update status to in_progress
    await updateWorkPackageStatus(supabase, workPackageId, 'in_progress')

    // Assemble context
    const context = await assembleProjectContext(supabase, project.id)

    // Validate context size
    const validation = validateContextSize(context)
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Context too large',
        tokenEstimate: validation.tokenEstimate
      }, { status: 400 })
    }

    // Generate content
    const content = await generateDocumentContent(
      workPackage,
      context,
      existingContent.win_themes,
      project.instructions
    )

    // Save to database
    await saveGeneratedContent(supabase, workPackageId, content)

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Generation failed'
    }, { status: 500 })
  }
}
```

### 10. Create Editor Action API Route

**File:** `app/api/work-packages/[id]/editor-action/route.ts`

**POST handler:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, selected_text, full_document, custom_instruction } = body

    // Validate action
    const validActions = ['expand', 'shorten', 'add_evidence', 'rephrase', 'check_compliance', 'custom']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const workPackageId = params.id

    // Get work package for requirements and context
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)

    // For actions needing org docs or requirements
    let context: any = {}
    if (action === 'expand' || action === 'add_evidence') {
      const projectContext = await assembleProjectContext(supabase, project.id)
      context.orgDocs = projectContext.organizationDocs
    }
    if (action === 'check_compliance') {
      context.requirements = workPackage.requirements
    }
    if (action === 'custom') {
      context.customInstruction = custom_instruction
    }

    // Execute action
    const modifiedText = await executeEditorAction(
      action,
      selected_text,
      full_document,
      context
    )

    return NextResponse.json({ success: true, modified_text: modifiedText })
  } catch (error) {
    console.error('Editor action error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Action failed'
    }, { status: 500 })
  }
}
```

---
✅ CHECKPOINT: Steps 1-10 complete (Backend/API/AI layer). Continue to step 11.
---

### 11. Create Export Utility

**File:** `libs/utils/export-docx.ts`

**Import:** `import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'`
**Import:** `import { saveAs } from 'file-saver'`

**Function:** `convertMarkdownToDocx`
```typescript
export async function convertMarkdownToDocx(
  markdown: string,
  metadata: {
    title: string
    author?: string
    date?: Date
  }
): Promise<Blob> {
  // Parse markdown to structured format
  // Convert # headings to Heading1, ## to Heading2, etc.
  // Convert **bold** to bold TextRun
  // Convert lists to proper list items
  // Handle line breaks and paragraphs

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Parse and create paragraphs from markdown
        // Implementation details:
        // 1. Split by lines
        // 2. Detect heading level (# count)
        // 3. Detect bold (**text**)
        // 4. Detect italic (*text*)
        // 5. Detect lists (-, 1.)
        // 6. Create appropriate Paragraph objects
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  return blob
}
```

**Function:** `downloadDocx`
```typescript
export function downloadDocx(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}
```

**Note:** Full markdown parsing logic implementation will be detailed during coding. Use regex patterns for markdown syntax detection.

### 12. Create Export API Route

**File:** `app/api/work-packages/[id]/export/route.ts`

**POST handler:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workPackageId = params.id

    // Get work package and content
    const { workPackage, project } = await getWorkPackageWithProject(supabase, workPackageId)
    const content = await getWorkPackageContent(supabase, workPackageId)

    if (!content || !content.content) {
      return NextResponse.json({
        error: 'No content to export'
      }, { status: 400 })
    }

    // Generate filename
    const filename = `${workPackage.document_type.replace(/\s+/g, '_')}_${project.name.replace(/\s+/g, '_')}.docx`

    // Convert markdown to Word document
    const blob = await convertMarkdownToDocx(content.content, {
      title: workPackage.document_type,
      author: user.email,
      date: new Date()
    })

    // Upload to Supabase Storage
    const filePath = `${project.organization_id}/exports/${workPackageId}/${filename}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, blob, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    // Save export metadata
    await saveExportedFile(supabase, workPackageId, filePath)

    // Update status to completed
    await updateWorkPackageStatus(supabase, workPackageId, 'completed')

    // Get signed URL for download
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hour

    return NextResponse.json({
      success: true,
      download_url: urlData?.signedUrl,
      filename
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 })
  }
}
```

### 13. Create Workflow Tabs Component

**File:** `components/workflow/workflow-tabs.tsx`

**Client Component** ('use client')

**Structure:**
- Use shadcn Tabs component
- 5 tabs: Requirements, Strategy, Generate, Edit, Export
- Track current step in state
- Disable tabs ahead of current progress
- Allow backward navigation
- Show completion checkmarks on completed tabs
- Match TenderCreator tab design

**Props:**
```typescript
interface WorkflowTabsProps {
  workPackageId: string
  currentTab: 'requirements' | 'strategy' | 'generate' | 'edit' | 'export'
  onTabChange: (tab: string) => void
  completedSteps: string[] // ['requirements', 'strategy', 'generate']
}
```

**Implementation:**
- Map tab to display name and icon (lucide-react)
- Disable tabs not in completedSteps and not currentTab
- Visual indicator for active tab (green underline)
- Checkmark icon for completed tabs
- Lock icon for disabled tabs

### 14. Create Requirements View Component

**File:** `components/workflow/requirements-view.tsx`

**Server Component** (fetches data)

**Display:**
- Work package document type heading
- Total requirement count badge
- Requirements grouped by priority (Mandatory first, then Optional)
- Each requirement shows:
  - Priority badge (red for mandatory, blue for optional)
  - Requirement text
  - Source reference (RFT section/page)
- "Continue to Strategy →" button at bottom
- "← Back to Dashboard" button

**Styling:**
- Use shadcn Card for each requirement
- Badge component for priority
- Responsive layout (stacks on mobile)
- Match TenderCreator card design

### 15. Create Strategy Screen Component

**File:** `components/workflow/strategy-screen.tsx`

**Client Component**

**State:**
- winThemes: string[]
- isGenerating: boolean
- isEditing: boolean

**UI Structure:**
- Heading: "Strategy & Planning"
- Subheading: "Win themes will guide content generation"
- "Generate Win Themes" button (if no themes yet)
- Loading state during generation
- Generated themes displayed in editable list
- Each theme has:
  - Text display/input (toggle edit mode)
  - Edit button
  - Delete button
- "Add Theme" button to manually add
- "Continue to Generation →" button (disabled until themes exist)
- "← Back to Requirements" button

**Behavior:**
- Click generate → POST to `/api/work-packages/[id]/win-themes`
- Display loading spinner during API call
- On success, populate winThemes state
- Allow inline editing of each theme
- Save changes on blur or button click
- Validate at least 1 theme before allowing continue

### 16. Create Generation Screen Component

**File:** `components/workflow/generation-screen.tsx`

**Client Component**

**UI Structure:**
- Heading: "Content Generation"
- Summary card showing:
  - Document type
  - Requirement count
  - Win themes count
  - Estimated generation time (e.g., "2-3 minutes")
- "Generate Content" button (large, prominent)
- Loading state with:
  - Animated spinner
  - Progress message: "Generating {document_type}..."
  - Substatus: "Analyzing requirements...", "Assembling context...", "Generating content..."
- On completion, show success message
- Auto-navigate to Edit tab after 2 seconds

**Behavior:**
- Click generate → POST to `/api/work-packages/[id]/generate-content`
- Show loading animation
- Poll or wait for response
- On success, transition to edit screen
- On error, show error message with retry button
- "← Back to Strategy" button (disabled during generation)

### 17. Create TipTap Editor Toolbar Component

**File:** `components/workflow/editor-toolbar.tsx`

**Client Component**

**Toolbar buttons:**
- Undo / Redo
- Heading dropdown (H1, H2, H3, Paragraph)
- Bold
- Italic
- Bullet list
- Numbered list
- Clear formatting

**Styling:**
- Sticky at top of editor
- Match TenderCreator toolbar design
- Icons from lucide-react
- Active state for current formatting
- Disabled state when not applicable
- Tooltips on hover

**Integration:**
- Receives `editor` prop (TipTap editor instance)
- Buttons call editor commands: `editor.chain().focus().toggleBold().run()`

### 18. Create AI Action Menu Component

**File:** `components/workflow/ai-action-menu.tsx`

**Client Component**

**Structure:**
- Floating menu appearing on text selection
- 6 action buttons:
  1. ✨ Expand
  2. ✂️ Shorten
  3. 📚 Add Evidence
  4. 🔄 Rephrase
  5. ✓ Check Compliance
  6. ✏️ Custom Instruction
- Position near selected text (bubble menu pattern)
- Dismiss on click outside or ESC key

**Behavior:**
- Detect text selection in editor
- Calculate position above/below selection
- Show menu with animation (fade + slide)
- Click action → execute API call
- Show loading state (spinner on button)
- Replace selection with result
- Smooth animation for text replacement
- For "Custom Instruction": show dialog with input field first

**Styling:**
- Dark background with white text (stands out)
- Rounded corners, shadow
- Icons for each action
- Compact layout (horizontal or vertical based on space)

### 19. Create Content Editor Component

**File:** `components/workflow/content-editor.tsx`

**Client Component**

**TipTap Setup:**
```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }
    }),
    Placeholder.configure({
      placeholder: 'Your generated content will appear here...'
    }),
    CharacterCount
  ],
  content: initialContent, // From work_package_content.content
  onUpdate: ({ editor }) => {
    // Auto-save logic (debounced)
    debouncedSave(editor.getHTML())
  }
})
```

**UI Structure:**
- EditorToolbar component at top
- TipTap EditorContent in middle (full height)
- AIActionMenu component (shows on selection)
- Character/word count at bottom
- Save status indicator ("Saving...", "Saved", "Error")

**Auto-save:**
- Debounce updates (500ms)
- PUT to update work_package_content.content
- Show save status icon
- Handle errors gracefully

**Responsive:**
- Full width on desktop
- Proper padding and max-width
- Mobile: toolbar may wrap or scroll horizontally
- Test on 375px, 768px, 1440px viewports

### 20. Create Editor Screen Component

**File:** `components/workflow/editor-screen.tsx`

**Client Component**

**Combines:**
- ContentEditor component
- Side panel (optional) showing:
  - Requirements list (reference)
  - Win themes (reference)
  - Collapsible for more space

**Layout:**
- Main area: editor (70% width on desktop, 100% on mobile)
- Side panel: reference info (30% width, collapsible)
- "Continue to Export →" button in top-right corner
- "← Back to Generate" button

**State management:**
- Fetch work_package_content on mount
- Pass content to editor
- Handle auto-save updates
- Track unsaved changes (warn on navigate if dirty)

### 21. Create Export Screen Component

**File:** `components/workflow/export-screen.tsx`

**Client Component**

**UI Structure:**
- Heading: "Export Document"
- Preview card showing:
  - Document type
  - Word count
  - Last updated timestamp
  - Export format: Word (.docx)
- "Export as Word" button (large, prominent)
- Loading state during export
- Success state:
  - Checkmark icon
  - "Document exported successfully!"
  - Download link
  - "Back to Dashboard" button
  - "View All Work Packages" button

**Behavior:**
- Click export → POST to `/api/work-packages/[id]/export`
- Show loading spinner
- On success:
  - Download file automatically (via download_url)
  - Show success message
  - Provide navigation options
- On error, show error message with retry

### 22. Update Work Package Detail Page

**File:** `app/(dashboard)/work-packages/[id]/page.tsx`

**Replace placeholder with full workflow:**

**Server Component:**
```typescript
export default async function WorkPackagePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { workPackage, project } = await getWorkPackageWithProject(supabase, params.id)
  const content = await getWorkPackageContent(supabase, params.id)

  // Determine current tab based on progress
  let defaultTab = 'requirements'
  if (content?.win_themes && content.win_themes.length > 0) {
    defaultTab = 'strategy'
  }
  if (content?.content) {
    defaultTab = 'edit'
  }
  if (workPackage.status === 'completed') {
    defaultTab = 'export'
  }

  return (
    <div>
      <WorkflowTabs
        workPackageId={params.id}
        currentTab={defaultTab}
        completedSteps={getCompletedSteps(workPackage, content)}
      >
        <TabContent value="requirements">
          <RequirementsView workPackage={workPackage} />
        </TabContent>
        <TabContent value="strategy">
          <StrategyScreen workPackageId={params.id} content={content} />
        </TabContent>
        <TabContent value="generate">
          <GenerationScreen workPackageId={params.id} workPackage={workPackage} />
        </TabContent>
        <TabContent value="edit">
          <EditorScreen workPackageId={params.id} content={content} />
        </TabContent>
        <TabContent value="export">
          <ExportScreen workPackageId={params.id} workPackage={workPackage} />
        </TabContent>
      </WorkflowTabs>
    </div>
  )
}
```

**Helper function:**
```typescript
function getCompletedSteps(workPackage: WorkPackage, content: WorkPackageContent | null): string[] {
  const steps = ['requirements'] // Always completed (came from Phase 2)

  if (content?.win_themes && content.win_themes.length > 0) {
    steps.push('strategy')
  }
  if (content?.content) {
    steps.push('generate')
  }
  if (workPackage.status === 'completed') {
    steps.push('edit', 'export')
  }

  return steps
}
```

---
✅ CHECKPOINT: Steps 11-22 complete (Frontend/UI layer). Continue to step 23.
---

### 23. Implement TipTap Regression Testing Strategy

**Create test documentation:**

**File:** `ai_docs/documentation/phases_spec/phase_4_single_document_workflow/tiptap_testing_checklist.md`

**Content:**
```markdown
# TipTap Editor Testing Checklist

## Pre-Implementation Tests (Baseline)
- [ ] No TipTap editor exists yet - confirm clean baseline

## Unit Tests (during implementation)
- [ ] Editor initializes with empty content
- [ ] Editor initializes with markdown content
- [ ] Editor initializes with HTML content
- [ ] StarterKit extensions load correctly
- [ ] Placeholder shows when empty
- [ ] Character count updates on edit
- [ ] onUpdate callback fires correctly
- [ ] Auto-save debouncing works (500ms)

## Integration Tests
- [ ] Toolbar buttons trigger editor commands
- [ ] Bold button toggles bold
- [ ] Italic button toggles italic
- [ ] Heading dropdown changes heading level
- [ ] List buttons create lists
- [ ] Undo/redo works across edits
- [ ] Clear formatting removes all styles
- [ ] AI action menu appears on text selection
- [ ] AI action menu positioned correctly
- [ ] AI action replaces selected text
- [ ] Content persists on auto-save

## Visual Regression Tests

### Desktop (1440px)
- [ ] Editor full width with proper padding
- [ ] Toolbar visible and aligned
- [ ] AI menu positioned correctly
- [ ] Side panel (reference) displays at 30% width
- [ ] No horizontal scroll
- [ ] Character count visible at bottom

### Tablet (768px)
- [ ] Editor adapts to narrower width
- [ ] Toolbar remains accessible (may wrap)
- [ ] Side panel collapses or stacks below
- [ ] AI menu still accessible
- [ ] No layout breaking

### Mobile (375px)
- [ ] Editor takes full width
- [ ] Toolbar scrolls horizontally if needed (or wraps)
- [ ] AI menu adapts to smaller screen
- [ ] Text input responsive
- [ ] Virtual keyboard doesn't break layout
- [ ] Auto-save still works

## Browser Compatibility Tests

### Chrome (latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable (<100ms input lag)

### Firefox (latest)
- [ ] All features work
- [ ] Selection handling works
- [ ] AI menu positioning correct

### Safari (latest)
- [ ] All features work
- [ ] iOS Safari: text selection works
- [ ] iOS Safari: toolbar accessible above keyboard

## Performance Tests
- [ ] Large document (10,000 words) loads quickly (<2s)
- [ ] Editing remains smooth with large content
- [ ] Auto-save doesn't cause lag
- [ ] AI action response doesn't freeze UI

## Regression Prevention
- [ ] Screenshot baseline for default state
- [ ] Screenshot with content
- [ ] Screenshot with AI menu open
- [ ] Screenshot of each viewport size
- [ ] Compare screenshots before/after changes

## Error Scenarios
- [ ] Invalid HTML content - editor handles gracefully
- [ ] Network error during auto-save - shows error, retries
- [ ] AI action API failure - shows error message, selection preserved
- [ ] Rapid text selection changes - menu doesn't flicker
- [ ] Multiple quick edits - debouncing prevents API spam
```

**Testing execution plan:**
1. Complete baseline screenshots before implementing TipTap
2. After each major component (toolbar, editor, AI menu), run subset of tests
3. Before considering step complete, run full checklist
4. Document any issues in implementation log
5. Fix regressions immediately before proceeding

### 24. Create Sample Generated Content Fixture

**File:** `test_fixtures/sample_generated_content.md`

**Content:** Create realistic sample content for testing editor:
```markdown
# Technical Specification for Community Centre Redevelopment

## Executive Summary

This Technical Specification outlines our comprehensive approach to delivering the Community Centre Redevelopment project...

## Project Methodology

### 1. Planning Phase

Our planning phase incorporates industry best practices and lessons learned from similar projects...

**Key Activities:**
- Stakeholder consultation
- Site assessment
- Risk identification
- Resource allocation

### 2. Design Phase

The design phase leverages our award-winning architectural team...

[Continue with realistic tender document content, ~2000 words]
```

**Purpose:** Use this for:
- Testing editor rendering of various markdown elements
- Testing AI actions on realistic content
- Performance testing with substantial content
- Export testing (markdown to Word conversion)

### 25. Create E2E Test File

**File:** `.claude/commands/e2e/test_phase_4_workflow.md`

```markdown
# E2E Test: Phase 4 Single Document Workflow

Test complete work package workflow from requirements to export.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## User Story

As a tender response team member
I want to complete a full document workflow
So that I can generate, edit, and export professional tender documents

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Prerequisites

- Dev server running at http://localhost:3000
- Test project exists with analyzed work packages (from Phase 2/3 tests)
- Test fixtures available

## Test Steps

### 1. Navigate to Work Package

**Steps:**
- Sign in as test user
- Navigate to Projects page
- Click on existing test project
- Click "Open" on first work package card
- **Verify** URL is `/work-packages/[id]`
- Take screenshot: `01_work_package_detail.png`

**Expected:**
- Work package detail page loads
- 5 tabs visible: Requirements, Strategy, Generate, Edit, Export
- Requirements tab is active (default)

### 2. Review Requirements

**Steps:**
- **Verify** Requirements tab shows:
  - Document type heading
  - Total requirement count badge
  - List of requirements with priority badges
  - Source references for each requirement
- Count requirements displayed
- Take screenshot: `02_requirements_view.png`
- Click "Continue to Strategy →" button

**Expected:**
- Requirements displayed correctly
- Mandatory requirements have red badges
- Optional requirements have blue badges
- Navigation to Strategy tab works

### 3. Generate Win Themes

**Steps:**
- **Verify** Strategy tab is now active
- **Verify** "Generate Win Themes" button is visible
- Click "Generate Win Themes" button
- **Verify** loading state appears (spinner)
- Wait for generation to complete (10-30 seconds)
- Take screenshot: `03_win_themes_loading.png`
- **Verify** 3-5 win themes displayed
- Take screenshot: `04_win_themes_generated.png`

**Expected:**
- API call to `/api/work-packages/[id]/win-themes` succeeds
- Win themes display as editable list
- "Continue to Generation →" button enabled

### 4. Edit Win Theme (optional validation)

**Steps:**
- Click edit icon on first win theme
- Modify text slightly (add word "enhanced")
- Save changes
- **Verify** change persists
- Click "Continue to Generation →" button

**Expected:**
- Win theme editing works
- Changes saved successfully
- Navigation to Generate tab works

### 5. Generate Document Content

**Steps:**
- **Verify** Generate tab is active
- **Verify** summary card shows:
  - Document type
  - Requirement count
  - Win themes count
- Click "Generate Content" button
- **Verify** loading animation appears
- Take screenshot: `05_content_generation_loading.png`
- Wait for generation to complete (30-90 seconds)
- **Verify** success message appears
- Take screenshot: `06_content_generation_success.png`
- Wait for auto-navigation to Edit tab (2 seconds)

**Expected:**
- API call to `/api/work-packages/[id]/generate-content` succeeds
- Work package status updates to 'in_progress'
- Generated content appears in editor
- Auto-navigation to Edit tab works

### 6. Test Editor Functionality

**Steps:**
- **Verify** Edit tab is active
- **Verify** TipTap editor displays generated content
- **Verify** editor toolbar visible with buttons
- Take screenshot: `07_editor_with_content.png`
- Click into editor, type new sentence at end
- **Verify** text appears in editor
- Click Bold button on toolbar
- Type "bold text"
- **Verify** text is bolded
- Wait 5 seconds (auto-save)
- Take screenshot: `08_editor_after_edits.png`

**Expected:**
- Editor renders markdown correctly
- Typing works smoothly
- Toolbar buttons work (bold)
- Auto-save executes (check network tab)
- No console errors

### 7. Test AI Action - Expand

**Steps:**
- Select 1-2 sentences in middle of document (click and drag)
- **Verify** AI action menu appears above/below selection
- Take screenshot: `09_ai_menu_visible.png`
- Click "✨ Expand" button
- **Verify** loading spinner appears on button
- Wait for AI response (5-15 seconds)
- **Verify** selected text is replaced with expanded version
- Take screenshot: `10_text_expanded.png`

**Expected:**
- Text selection triggers AI menu
- Menu positioned correctly
- API call to `/api/work-packages/[id]/editor-action` succeeds
- Expanded text replaces selection
- Smooth animation on replacement

### 8. Test AI Action - Add Evidence

**Steps:**
- Select a statement making a claim (e.g., "We have extensive experience...")
- Click "📚 Add Evidence" in AI menu
- Wait for AI response (5-15 seconds)
- **Verify** additional paragraph(s) added with case studies/evidence
- Take screenshot: `11_evidence_added.png`

**Expected:**
- Evidence from org docs appears
- Content integrates naturally
- Original statement preserved

### 9. Test AI Action - Check Compliance

**Steps:**
- Select a full section/paragraph
- Click "✓ Check Compliance" in AI menu
- Wait for AI response (5-10 seconds)
- **Verify** compliance report appears (addressed requirements, missing requirements, suggestions)
- Take screenshot: `12_compliance_check.png`

**Expected:**
- Compliance analysis displays
- Shows which requirements addressed
- Shows which requirements missing
- Provides specific suggestions

### 10. Test Custom Instruction Action

**Steps:**
- Select any paragraph
- Click "✏️ Custom Instruction" in AI menu
- **Verify** input dialog appears
- Enter instruction: "Make this more technical and add specific metrics"
- Click submit
- Wait for AI response (5-15 seconds)
- **Verify** text modified according to instruction
- Take screenshot: `13_custom_instruction.png`

**Expected:**
- Dialog appears with input field
- Custom instruction sent to API
- Text modified as requested

### 11. Navigate to Export

**Steps:**
- Click "Continue to Export →" button
- **Verify** Export tab is active
- **Verify** export screen shows:
  - Document type
  - Word count
  - Last updated timestamp
  - "Export as Word" button
- Take screenshot: `14_export_screen.png`

**Expected:**
- Navigation to export tab works
- Export screen displays metadata correctly
- Export button is enabled

### 12. Export to Word Document

**Steps:**
- Click "Export as Word" button
- **Verify** loading state appears
- Wait for export to complete (5-15 seconds)
- **Verify** success message appears
- **Verify** file download initiated
- Take screenshot: `15_export_success.png`
- Check Downloads folder for .docx file
- Open .docx file in Word/Preview
- **Verify** content is present with formatting preserved

**Expected:**
- API call to `/api/work-packages/[id]/export` succeeds
- Work package status updates to 'completed'
- Word file downloads automatically
- File contains all content with proper formatting (headings, bold, lists)

### 13. Return to Dashboard

**Steps:**
- Click "Back to Dashboard" button
- **Verify** navigation to project detail page
- **Verify** work package card shows status = "Completed" (green badge)
- Take screenshot: `16_dashboard_completed.png`

**Expected:**
- Navigation works
- Status updated correctly
- Dashboard reflects completion

## Success Criteria

✓ All workflow tabs accessible
✓ Win themes generation works
✓ Content generation works
✓ Editor renders content correctly
✓ Editor toolbar functional
✓ AI actions all work (expand, add evidence, check compliance, custom)
✓ Auto-save persists changes
✓ Export generates valid Word document
✓ Status transitions correct (not_started → in_progress → completed)
✓ 16 screenshots captured
✓ No console errors during workflow
✓ All API calls succeed
```

### 26. Run Build Check

**Command:**
```bash
npm run build
```

**Verify:**
- No TypeScript errors
- No build warnings related to Phase 4 code
- All new components compile successfully
- TipTap dependencies resolved

**If errors:**
- Fix immediately before proceeding
- Common issues: missing types, incorrect imports, circular dependencies

### 27. Test Win Themes Generation Manually

**Steps:**
1. Start dev server: `npm run dev`
2. Sign in as test user
3. Navigate to existing work package (from Phase 2/3)
4. Click Strategy tab
5. Click "Generate Win Themes"
6. Watch network tab for API call
7. Verify 3-5 themes generated
8. Check console for Gemini API logs
9. Test editing themes
10. Save changes
11. Refresh page, verify themes persisted

**Validate:**
- Themes are specific to document type
- Themes reference organization docs
- Themes address requirements
- Themes are not generic/boilerplate

### 28. Test Content Generation Manually

**Steps:**
1. From previous test, click "Continue to Generation"
2. Review summary (requirement count, themes count)
3. Click "Generate Content"
4. Monitor network tab (may take 30-90 seconds)
5. Verify loading animation doesn't freeze
6. When complete, verify content appears in editor
7. Check content quality:
   - Addresses requirements
   - Incorporates win themes
   - Uses evidence from org docs
   - Professional tone
   - Well-structured (headings, sections)

**Validate:**
- Context assembly includes all org docs + RFT
- Token estimate logged in console (should be <1M)
- Generated content is comprehensive (>1000 words)
- Work package status changed to 'in_progress'

### 29. Test TipTap Editor Across Viewports

**Use browser DevTools responsive mode:**

**Desktop (1440px):**
- Editor width: ~70% of container
- Side panel visible: 30%
- Toolbar all buttons visible in single row
- AI menu positioned near selection
- Screenshot: `test_desktop_1440.png`

**Tablet (768px):**
- Editor width: 100% or side panel collapsed
- Toolbar may wrap to 2 rows
- AI menu adapts to narrower space
- Screenshot: `test_tablet_768.png`

**Mobile (375px):**
- Editor full width
- Toolbar icons smaller or horizontal scroll
- AI menu vertical layout
- Text selection still works
- Screenshot: `test_mobile_375.png`

**Verify:**
- No horizontal scroll at any viewport
- All features accessible
- Text remains readable
- No overlapping elements

### 30. Test AI Editor Actions Thoroughly

**For each action (expand, shorten, add evidence, rephrase, check compliance, custom):**

1. Select appropriate text (1-3 sentences)
2. Open AI menu
3. Click action button
4. Wait for response
5. Verify response quality
6. Verify selection replaced correctly
7. Test undo (Ctrl+Z) to revert
8. Screenshot result

**Validate:**
- All 6 actions work without errors
- Responses are contextually appropriate
- API calls use consistent Gemini pattern
- Loading states clear
- Error handling works (test by disconnecting network mid-action)

### 31. Test Word Export Thoroughly

**Steps:**
1. Complete workflow to export screen
2. Click "Export as Word"
3. Download file
4. Open in Microsoft Word
5. Verify formatting:
   - # becomes Heading 1
   - ## becomes Heading 2
   - ### becomes Heading 3
   - **bold** is bold
   - *italic* is italic
   - Lists render as lists
   - Paragraphs have proper spacing

**Validate:**
- File opens without errors
- All content present (no truncation)
- Formatting matches editor preview
- Professional appearance suitable for tender submission

### 32. Run Full E2E Test

**Command:**
```bash
# Read E2E test runner instructions
Read .claude/commands/test_e2e.md

# Execute Phase 4 E2E test
Execute .claude/commands/e2e/test_phase_4_workflow.md
```

**Expected result:**
```json
{
  "test_name": "Phase 4 Single Document Workflow",
  "status": "passed",
  "screenshots": [
    "test_results/phase_4_workflow/01_work_package_detail.png",
    "test_results/phase_4_workflow/02_requirements_view.png",
    ...
    "test_results/phase_4_workflow/16_dashboard_completed.png"
  ],
  "error": null
}
```

**If test fails:**
- Note which step failed
- Review error message
- Debug and fix issue
- Re-run from step 1
- Iterate until all steps pass

### 33. Check Gemini API Consistency

**Review all new AI service functions:**

**Files to check:**
- `libs/ai/content-generation.ts`
- `libs/ai/prompts/generate-win-themes.ts`
- `libs/ai/prompts/generate-content.ts`
- `libs/ai/prompts/editor-actions.ts`

**Verify:**
- All use `model` from `libs/ai/client.ts`
- All call `model.generateContent(prompt)`
- All handle markdown fence stripping (```json removal)
- All log to console with consistent format: `[ComponentName] Action: detail`
- All catch errors and throw with context
- All follow same pattern as `libs/ai/analysis.ts`

**If inconsistencies found:**
- Update to match established pattern
- Re-test affected functionality

### 34. Performance Check

**Measure key operations:**

**Win themes generation:**
- Typical time: 5-15 seconds
- Token estimate: log context size
- Acceptable: <30 seconds

**Content generation:**
- Typical time: 30-90 seconds
- Token estimate: should be <1M
- Acceptable: <2 minutes

**Editor actions:**
- Typical time: 5-15 seconds
- Acceptable: <30 seconds

**Auto-save:**
- Debounce: 500ms
- API call time: <1 second
- No UI lag during save

**Export:**
- Conversion time: 2-5 seconds
- File size: 20-100KB typical
- Acceptable: <15 seconds total

**If performance issues:**
- Check token usage (may be assembling too much context)
- Optimize context assembly (truncate if needed)
- Increase debounce time if auto-save laggy

### 35. Browser Compatibility Test

**Test in 3 browsers:**

**Chrome (latest):**
- Run full workflow
- Check DevTools console for errors
- Verify all features work
- Note any issues

**Firefox (latest):**
- Run full workflow
- Verify text selection behavior
- Verify AI menu positioning
- Note any issues

**Safari (latest - macOS or iOS):**
- Run full workflow
- Verify iOS text selection works (if testing mobile)
- Verify toolbar above keyboard accessible
- Note any issues

**Document results:**
- All browsers: no critical issues
- Minor visual differences acceptable
- Functionality must be equivalent

### 36. Final Validation Against Acceptance Criteria

**Review each criterion from Acceptance Criteria section:**

Go through list checking each item:
- ✓ = Implemented and tested
- ✗ = Missing or broken
- ⚠ = Partial or needs refinement

**If any ✗ or ⚠:**
- Implement missing features
- Fix broken functionality
- Refine partially working features
- Re-test until all ✓

### 37. Create Implementation Log

**File:** `ai_docs/documentation/phases_spec/phase_4_single_document_workflow/phase_4_implementation.log`

**Content:**
```
Phase 4: Single Document Workflow - Implementation Log

Start Date: [DATE]
End Date: [DATE]
Status: Complete / In Progress

## Summary
- 37 steps completed
- All acceptance criteria met
- E2E test passed
- Cross-browser tested

## Key Decisions
1. Used TipTap StarterKit for editor (comprehensive, well-documented)
2. Batch content generation vs streaming (chose batch for MVP simplicity)
3. Auto-save interval: 500ms debounce (balances UX and API load)
4. Export format: Word only for MVP (PDF deferred)

## Issues Encountered
1. [Issue description]
   - Resolution: [how it was fixed]
2. [Issue description]
   - Resolution: [how it was fixed]

## Performance Metrics
- Win themes generation: avg 12s
- Content generation: avg 45s
- Editor actions: avg 8s
- Export: avg 5s
- Context size: avg 350K tokens

## Testing Results
- Unit tests: N/A (manual testing for MVP)
- Integration tests: Manual - all passed
- E2E test: Passed
- Browser compatibility: Chrome ✓, Firefox ✓, Safari ✓
- Viewport testing: Desktop ✓, Tablet ✓, Mobile ✓

## Known Limitations
- Export: basic Word formatting only (no advanced styles)
- Editor: no collaborative editing (Phase 5+)
- AI actions: sequential only (no parallel processing)
- Context: no intelligent truncation if approaching 1M tokens

## Next Phase Prep
Phase 4 enables Phase 5 (Multi-Document Orchestration):
- work_package_content table fully utilized
- Status transitions working
- Export functionality complete
- Ready to scale to multiple documents

## Deployment Notes
- New dependencies: @tiptap/*, docx, file-saver
- Environment variables: GEMINI_API_KEY (already configured)
- Database: no new migrations needed
- Storage: exports saved to Supabase Storage documents bucket

Completed by: [NAME/AI]
Date: [DATE]
```

---
✅ CHECKPOINT: Steps 23-37 complete (Testing & Validation). Phase 4 complete.
---

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Build check (no TypeScript errors)
npm run build

# 2. Start dev server
npm run dev

# 3. Database check
# (Manual: Supabase dashboard > work_package_content table, verify all fields exist)

# 4. Test win themes generation
# (Manual: Navigate to work package, strategy tab, click generate, verify 3-5 themes)

# 5. Test content generation
# (Manual: From strategy, continue to generation, click generate, wait for content in editor)

# 6. Test TipTap editor initialization
# (Manual: Verify editor loads, content renders, toolbar works)

# 7. Test each AI editor action
# (Manual: Test expand, shorten, add evidence, rephrase, check compliance, custom - all 6 actions)

# 8. Test auto-save
# (Manual: Edit content, wait 5 seconds, check network tab for PUT request, refresh page, verify changes persisted)

# 9. Test export to Word
# (Manual: Click export, download file, open in Word, verify formatting correct)

# 10. Test status transitions
# (Manual: Verify work package status changes: not_started → in_progress on generate → completed on export)

# 11. Viewport testing
# (Manual: Test at 375px, 768px, 1440px using browser DevTools)
# - No horizontal scroll
# - All features accessible
# - Layout adapts appropriately

# 12. Browser compatibility
# (Manual: Test in Chrome, Firefox, Safari)
# - All features work
# - No console errors
# - Similar UX across browsers

# 13. Run E2E test
# Read .claude/commands/test_e2e.md for test credentials
# Execute .claude/commands/e2e/test_phase_4_workflow.md
# Complete all 13 test steps
# Verify all success criteria met
# Confirm 16 screenshots captured

# 14. Performance check
# (Manual: Monitor generation times, ensure all operations <2 minutes)
# Win themes: <30s
# Content: <2 min
# Editor actions: <30s
# Export: <15s

# 15. Console error check
# (Manual: Open DevTools console, complete full workflow, verify zero errors)

# 16. API call verification
# (Manual: Network tab, verify all API calls return 200 status)
# POST /api/work-packages/[id]/win-themes
# POST /api/work-packages/[id]/generate-content
# POST /api/work-packages/[id]/editor-action
# PUT /api/work-packages/[id]/content (auto-save)
# POST /api/work-packages/[id]/export

# 17. Gemini API consistency check
# (Code review: Verify all libs/ai/ functions use same pattern)
# - Import model from client.ts
# - Call model.generateContent
# - Handle markdown fences
# - Consistent error handling
# - Consistent logging

# 18. TipTap regression check
# (Manual: Compare screenshots before/after, verify no visual regressions)

# 19. Validate against acceptance criteria
# (Manual: Check each item in Acceptance Criteria section above, ensure all ✓)

# 20. Final smoke test
# (Manual: Complete workflow start to finish without consulting documentation)
# - Sign in
# - Navigate to work package
# - Generate win themes
# - Generate content
# - Edit with AI actions
# - Export Word document
# - Verify completion
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed workflow tests in `.claude/commands/e2e/test_phase_4_workflow.md`

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_4_single_document_workflow/phase_4_implementation.log

## Notes

### Critical Implementation Details

**Gemini API Consistency:**
All AI operations must follow established pattern from `libs/ai/analysis.ts`:
```typescript
// Import shared client
import { model } from './client'

// Call API
const result = await model.generateContent(prompt)
const text = result.response.text()

// Strip markdown fences
let cleanText = text.trim()
if (cleanText.startsWith('```json')) {
  cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
}

// Parse JSON (if applicable)
const parsed = JSON.parse(cleanText)

// Return or process
return parsed
```

**Context Assembly Strategy:**
Assemble full context for each generation:
```typescript
const context = {
  organizationDocs: orgDocs.map(d => d.content_text).join('\n\n---\n\n'),
  rftDocs: projectDocs.map(d => d.content_text).join('\n\n---\n\n'),
  totalTokensEstimate: (orgDocsText.length + rftDocsText.length) / 4
}
```

Estimate tokens as `text.length / 4` (rough but acceptable for MVP).

Validate context size before sending:
```typescript
if (context.totalTokensEstimate > 1000000) {
  throw new Error('Context too large - exceeds 1M token limit')
}
```

**Status Transition Rules:**
- User enters workflow at any status (can edit even if completed)
- Clicking "Generate Content" → auto-transition to 'in_progress'
- Clicking "Export" → auto-transition to 'completed'
- Manual status change in Phase 3 dashboard still works (doesn't conflict)
- Allow re-generation and re-export (overwrites previous)

**TipTap Editor Architecture:**
- EditorToolbar: separate component, receives editor instance as prop
- AIActionMenu: separate component, manages positioning and API calls
- ContentEditor: wrapper managing editor instance and auto-save
- EditorScreen: orchestrates components and handles state

**Auto-save Implementation:**
```typescript
const debouncedSave = useMemo(
  () =>
    debounce(async (content: string) => {
      try {
        await fetch(`/api/work-packages/${workPackageId}/content`, {
          method: 'PUT',
          body: JSON.stringify({ content }),
          headers: { 'Content-Type': 'application/json' }
        })
        setSaveStatus('saved')
      } catch (error) {
        setSaveStatus('error')
      }
    }, 500),
  [workPackageId]
)
```

Debounce prevents API spam, 500ms balances UX and performance.

**AI Action Menu Positioning:**
TipTap provides `BubbleMenu` extension for selection-based menus:
```typescript
import { BubbleMenu } from '@tiptap/react'

<BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
  <AIActionMenu onAction={handleAction} />
</BubbleMenu>
```

Automatically positions near selection, handles edge cases.

**Export Format Handling:**
Markdown to Word conversion strategy:
1. Split content by lines
2. Detect heading level by counting `#` characters
3. Detect bold with `**text**` regex
4. Detect italic with `*text*` regex
5. Detect lists by line prefix (`-`, `1.`)
6. Create corresponding docx Paragraph objects with proper styling

For MVP, focus on core elements (headings, bold, italic, lists, paragraphs). Advanced formatting (tables, images) deferred to Phase 5+.

**Tab Navigation Logic:**
```typescript
const canNavigateTo = (tab: string) => {
  if (tab === 'requirements') return true // Always accessible
  if (tab === 'strategy') return true // Can skip back
  if (tab === 'generate') return completedSteps.includes('strategy')
  if (tab === 'edit') return completedSteps.includes('generate')
  if (tab === 'export') return completedSteps.includes('edit')
  return false
}
```

Users can navigate backward anytime, but must complete steps in order to proceed forward.

**Error Handling Patterns:**
- **API errors**: Show toast notification, preserve user state, allow retry
- **Gemini errors**: Log to console, show user-friendly message, offer regenerate button
- **Network errors**: Detect offline, show offline indicator, queue requests when online
- **Validation errors**: Show inline error messages, prevent submission until fixed

**Performance Optimization:**
- Context assembly: Cache org docs + RFT per project (reuse across work packages)
- Auto-save: Debounce 500ms to prevent excessive API calls
- Editor: Lazy load TipTap extensions (reduce initial bundle size)
- Export: Generate Word doc in Web Worker (prevent UI freeze)

For MVP, caching not critical (acceptable load times). Phase 5+ can add if needed.

**Responsive Design Strategy:**
- Desktop (≥1024px): Side panel visible, full toolbar, editor 70% width
- Tablet (640-1023px): Side panel collapsible, toolbar may wrap, editor 100% width
- Mobile (<640px): No side panel, toolbar horizontal scroll, editor full width, AI menu vertical

Test at breakpoints: 375px (mobile), 768px (tablet), 1440px (desktop).

**Browser Compatibility:**
- **Chrome**: Full support, primary testing browser
- **Firefox**: Full support, test text selection behavior
- **Safari**: Full support, test iOS text selection, toolbar above keyboard

Known limitation: IE11 not supported (TipTap requires modern browsers).

**Security Considerations:**
- All API routes protected with auth check
- RLS ensures org isolation (users can't access other orgs' work packages)
- AI-generated content sanitized before saving (prevent XSS)
- File uploads validated (only .docx export, no arbitrary file types)

**Testing Philosophy:**
- **Manual testing** for MVP (E2E test is comprehensive)
- **Unit tests** deferred to Phase 5+ (time constraint for MVP demo)
- **Visual regression** via screenshots (compare before/after)
- **Performance monitoring** via console logs and browser DevTools

### Future Enhancements (Post-MVP)

**Phase 5+ Improvements:**
- Streaming content generation (show text as it generates)
- Context caching (reduce API latency)
- Collaborative editing (multiple users in same document)
- Version history (undo to previous content versions)
- Advanced export formats (PDF, customizable Word templates)
- AI action batching (apply multiple actions in sequence)
- Offline mode (queue operations, sync when online)
- Voice input for editor
- Accessibility improvements (screen reader support, keyboard shortcuts)

**AI Enhancements:**
- Confidence scores for AI actions (show how confident AI is)
- Alternative suggestions (AI provides 2-3 options for user to choose)
- Contextual suggestions (AI proactively suggests edits based on requirements)
- Smart auto-complete (AI predicts next sentences)
- Tone adjustment (formal/informal/technical sliders)

**Editor Enhancements:**
- Comments and annotations
- Track changes (like Word's track changes)
- Real-time collaboration cursor
- Advanced formatting (tables, images, charts)
- Spell check and grammar
- Find and replace
- Document outline navigation

**Export Enhancements:**
- Custom Word templates (upload company template)
- PDF export with watermark
- Batch export (all work packages at once)
- Export with metadata (embedded project info)
- Export to other formats (LaTeX, InDesign, etc.)

### TipTap Implementation Safety

**Pre-Implementation Checklist:**
- [ ] Review TipTap documentation thoroughly
- [ ] Understand StarterKit extensions included
- [ ] Plan component architecture (editor, toolbar, menu separate)
- [ ] Create baseline screenshots (no editor yet)
- [ ] Set up error boundaries (catch React errors)

**During Implementation:**
- [ ] Implement editor first (basic rendering)
- [ ] Test basic text input
- [ ] Add toolbar second (formatting controls)
- [ ] Test each toolbar button
- [ ] Add AI menu third (selection-based)
- [ ] Test each AI action independently
- [ ] Add auto-save last
- [ ] Test debouncing and persistence

**Post-Implementation:**
- [ ] Run full testing checklist (see step 23)
- [ ] Compare screenshots (before/after)
- [ ] Test across browsers
- [ ] Test across viewports
- [ ] Performance profiling
- [ ] Document any workarounds or gotchas

**Regression Prevention:**
- Take screenshots at each milestone
- Test existing features after each change
- Keep TipTap version pinned (don't auto-update)
- Document any custom extensions or modifications
- Maintain test checklist for future changes

**Common TipTap Pitfalls (Avoid):**
1. Not calling `editor.destroy()` on unmount → memory leak
2. Updating editor content without `setContent()` → state mismatch
3. Complex state management → use TipTap's built-in state
4. Over-customizing extensions → use StarterKit defaults
5. Forgetting controlled/uncontrolled mode → use uncontrolled for simplicity

**If Issues Arise:**
1. Check TipTap GitHub issues (likely someone had same problem)
2. Simplify implementation (remove custom extensions)
3. Test with minimal editor (no toolbar, no menu)
4. Gradually add features back to isolate issue
5. Document solution for future reference

### Context Size Management

**Token Estimation:**
Rough estimate: `text.length / 4` (characters per token ~4).

**Typical Sizes:**
- Small RFT: 20-50K tokens
- Medium RFT: 50-150K tokens
- Large RFT: 150-400K tokens
- Org docs (5-10 files): 20-100K tokens
- **Total**: Usually 50-500K tokens (well under 1M limit)

**If Approaching Limit:**
1. Log warning at 800K tokens
2. Prioritize recent/relevant org docs (sort by upload date)
3. Truncate oldest org docs (keep 70% of context)
4. Ensure RFT docs always included (critical)
5. Document which docs truncated in console

**Validation:**
```typescript
if (tokenEstimate > 1000000) {
  throw new Error('Context exceeds 1M token limit')
}
if (tokenEstimate > 800000) {
  console.warn('[Context] Approaching token limit:', tokenEstimate)
}
```

For MVP, truncation not implemented (unlikely to hit limit). Phase 5+ can add if needed.

### Integration with Phase 3

**Navigation Flow:**
```
Phase 3 Dashboard (Work Package Cards)
  ↓ Click "Open" button
Work Package Detail (Phase 4 Workflow)
  ↓ Complete workflow
Export Success Screen
  ↓ Click "Back to Dashboard"
Phase 3 Dashboard (Card shows "Completed" status)
```

**Status Synchronization:**
- Phase 3 dashboard shows current status (not_started/in_progress/completed)
- Phase 4 workflow auto-updates status during generation and export
- Status changes immediately visible in dashboard (revalidate on navigate back)

**Data Consistency:**
- work_packages.requirements: Set in Phase 2, read-only in Phase 4
- work_packages.status: Set in Phase 3 (manual), updated in Phase 4 (auto)
- work_package_content: Created/updated in Phase 4 only

**Edge Cases:**
- User navigates to workflow before Phase 2 analysis → show error, redirect to project
- User navigates to workflow without requirements → show error, can't proceed
- User deletes work package while in workflow → handle 404, redirect to dashboard

### Workflow State Persistence

**Which State Persists:**
- ✓ Win themes (work_package_content.win_themes)
- ✓ Generated content (work_package_content.content)
- ✓ Exported file path (work_package_content.exported_file_path)
- ✓ Work package status (work_packages.status)
- ✓ Content version (work_package_content.content_version)

**Which State is Ephemeral:**
- ✗ Current tab selection (resets on page load)
- ✗ AI menu visibility (resets on selection change)
- ✗ Unsaved editor changes (lost if page closed before auto-save)
- ✗ Loading states (always start fresh)

**Handling Refresh:**
- User refreshes during generation → generation lost, can retry
- User refreshes after generation → content loaded from DB
- User refreshes during auto-save → changes may be lost (warn on navigate if dirty)

**Preventing Data Loss:**
- Auto-save every 500ms (debounced)
- Warn before navigate if unsaved changes (window.beforeunload)
- Show save status indicator ("Saving...", "Saved", "Error")
- Allow manual save button (optional enhancement)

### Accessibility Considerations

**Keyboard Navigation:**
- Tab through workflow tabs (Requirements → Strategy → Generate → Edit → Export)
- Enter to activate tab
- Tab through editor toolbar buttons
- Keyboard shortcuts in editor (Ctrl+B for bold, etc.)
- Escape to close AI menu

**Screen Reader Support:**
- aria-labels on all interactive elements
- aria-current on active tab
- aria-busy during loading states
- Announce status changes ("Content generated successfully")
- Describe AI action results

**Visual Indicators:**
- Focus outlines on all interactive elements (keyboard navigation)
- Loading spinners with text labels (not icon-only)
- Color not sole indicator (use icons + text for status)
- High contrast mode support

**For MVP:**
- Basic keyboard navigation (tab, enter, escape)
- aria-labels on key elements
- Full accessibility audit deferred to Phase 6 (polish)

## Research Documentation

No research sub-agents deployed for Phase 4. Implementation follows:
- TipTap documentation (https://tiptap.dev)
- docx library documentation (https://docx.js.org)
- Gemini API patterns from Phase 2 (libs/ai/analysis.ts)
- Repository patterns from Phase 1-3
- E2E test patterns from existing tests
- TenderCreator UI reference (ai_docs/ui_reference/)
