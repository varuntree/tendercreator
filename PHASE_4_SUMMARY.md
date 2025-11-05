# Phase 4: Single Document Workflow - Detailed Specifications

**Objective:** Complete one work package (document) end-to-end: Requirements → Strategy → Generation → Editing → Export

**Timeline:** 5-7 days

---

## 4.1 Requirements Analysis Screen

### Purpose
Present extracted requirements for a single document, allowing user validation before proceeding.

### Display Components
- **Work Package Title:** Document type (e.g., "Technical Specification")
- **Requirements List:**
  - Requirement text
  - Priority badge: 
    - "Mandatory" (red/critical styling)
    - "Optional" (gray/secondary styling)
  - RFT source reference (e.g., "Section 3.2, Page 12")
- **Action Buttons:**
  - Edit requirement (modify text, priority, source)
  - Remove requirement (delete from list)
  - Add requirement (insert new manually)
- **Navigation:** [Continue to Strategy →] button

### UI Layout
```
┌─ Work Package: Technical Specification
├─ Requirements (8 total)
│  ├─ "Must describe cloud architecture approach"
│  │  ├─ Priority: Mandatory (badge)
│  │  ├─ Source: Section 3.2, Page 12
│  │  └─ [Edit] [Remove]
│  ├─ "Should include disaster recovery plan"
│  │  ├─ Priority: Optional (badge)
│  │  ├─ Source: Section 3.5, Page 15
│  │  └─ [Edit] [Remove]
│  └─ ... (more requirements)
├─ [+ Add Requirement]
└─ [Continue to Strategy →]
```

### Data Model
```typescript
// From WorkPackage
requirements: {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string  // RFT reference
}[]
```

### User Actions
- **Validate requirements:** View extracted requirements from analysis phase
- **Edit requirement:** Modal opens to modify text/priority/source
- **Delete requirement:** Remove from list with confirmation
- **Add requirement:** Form to insert new requirement manually
- **Continue:** Save any edits, proceed to Strategy phase

### Success Criteria
✓ All extracted requirements display correctly
✓ User can modify, add, remove requirements
✓ Changes saved to database
✓ Smooth transition to Strategy phase

---

## 4.2 Strategy & Planning Screen

### Purpose
Generate win themes and key messages leveraging organizational strengths. Strategic foundation for content generation.

### Win Themes Generation

#### Gemini Prompt
```
Context:
- Project: [project name]
- Document Type: [work package type]
- Requirements: [list of all requirements]
- Organization Documents: [ALL org doc texts concatenated]
- RFT Documents: [ALL RFT texts concatenated]

Generate 3-5 win themes for this [document type] that:
1. Address the requirements
2. Leverage our organizational strengths (from docs)
3. Differentiate us from competitors

Output as JSON array of strings.

Example output:
[
  "Cloud-first architecture demonstrating 99.9% uptime through redundancy",
  "15+ years AWS partnership with certified architects on staff",
  "Proprietary disaster recovery framework proven in 50+ implementations"
]
```

#### Generation Flow
1. User clicks "Generate Win Themes"
2. System assembles context (org docs + RFT + requirements)
3. Sends prompt to Gemini 2.5 Flash
4. Displays loading state during generation
5. Renders generated themes in editable list

#### Display Components
- **Win Themes Section:**
  - Numbered list of generated themes (3-5 items)
  - Each theme in editable text field
  - Delete button per theme
  - [+ Add Custom Theme] button
  - [Regenerate] button (regenerate all themes)

- **Key Messages Section:**
  - Editable list of key messages (auto-generated or user-added)
  - Supports multiple messages
  - [+ Add Message] button

- **Bid/No-Bid Assessment (Optional):**
  - AI recommendation based on win themes + requirements
  - Display as informational card
  - "Proceed to Generation?" confirmation

### UI Layout
```
┌─ Win Themes (for: Technical Specification)
├─ [Cloud-first architecture] [×] [Edit]
├─ [15+ years AWS partnership] [×] [Edit]
├─ [Proprietary DR framework] [×] [Edit]
├─ [+ Add Custom Theme]
└─ [Regenerate Themes]

┌─ Key Messages
├─ [Our approach prioritizes uptime] [×] [Edit]
├─ [Certified architects lead delivery] [×] [Edit]
└─ [+ Add Message]

┌─ Bid Recommendation
├─ "PROCEED - Strong alignment with requirements"
└─ All mandatory requirements addressable

[Continue to Generation →]
```

### Data Model
```typescript
// WorkPackageContent (phase 4.2)
{
  id: string
  work_package_id: string (FK)
  win_themes: string[]      // ["Theme 1", "Theme 2", ...]
  key_messages: string[]    // ["Message 1", "Message 2", ...]
  created_at: timestamp
  updated_at: timestamp
  // Note: content field populated in 4.3
}
```

### User Actions
- **Generate themes:** Trigger Gemini, see results
- **Edit theme:** Modify individual theme text
- **Delete theme:** Remove from list
- **Add theme:** Insert custom theme
- **Add message:** Create key message manually
- **Regenerate:** Request new set of win themes
- **Continue:** Save themes/messages, proceed to Generation

### Error Handling
- Generation failure: Retry 3x, then manual entry
- Invalid JSON: Retry with corrected prompt
- Timeout: Show cached last attempt or manual entry

### Success Criteria
✓ Win themes generated from context
✓ Themes editable and deletable
✓ Key messages manageable
✓ All data persisted to WorkPackageContent

---

## 4.3 Content Generation Screen

### Purpose
Generate full document content using AI, addressing all requirements with win themes integrated.

### Generation Trigger & Flow
1. User clicks [Generate Content] button
2. System assembles complete context
3. Sends prompt to Gemini 2.5 Flash
4. Displays streaming progress (optional) or loading spinner
5. Renders generated content in editor
6. Transitions to editing screen

### Complete Gemini Prompt

```
You are writing a [document type] for a tender response.

Context:
- Project: [project name]
- Client: [client name]
- Deadline: [deadline - if available]

Requirements to Address (Mandatory must be included):
[Numbered list of all requirements with priority]
Example:
1. (Mandatory) Must describe cloud architecture approach (Section 3.2, Page 12)
2. (Mandatory) Must include disaster recovery plan (Section 3.5, Page 15)
3. (Optional) Should provide case studies (Section 4.1, Page 20)

Win Themes to Incorporate:
[List of 3-5 win themes]
Example:
- Cloud-first architecture with 99.9% uptime through redundancy
- 15+ years AWS partnership with certified architects
- Proprietary disaster recovery framework proven in 50+ implementations

Organization Knowledge Base (Demonstrate Capabilities):
[FULL CONCATENATED TEXT OF ALL ORGANIZATION DOCUMENTS]
[Use case studies, certifications, capabilities, project examples]

RFT Documents (Understand Requirements From):
[FULL CONCATENATED TEXT OF ALL PROJECT RFT DOCUMENTS]

User Instructions:
[If provided by user - optional]

Task:
Write a comprehensive [document type] that:
1. Addresses EVERY mandatory requirement explicitly (call out which requirement is being addressed)
2. Incorporates the win themes naturally throughout
3. Demonstrates our capabilities using evidence from organization documents
4. Maintains professional, formal tone
5. Is structured logically with clear headings and sections
6. Uses compelling language while remaining credible
7. Approximately 1,500-3,000 words (appropriate for document type)

Output as well-formatted Markdown with:
- H1 for main title: # [Document Type]
- H2 for major sections: ## Section Name
- H3 for subsections: ### Subsection
- Use **bold** for emphasis
- Use numbered lists for requirements/steps
- Use bullet points for key features
- Include a brief executive summary at start
```

### Display Components
- **Header:** Document type, status indicator
- **Loading State:**
  - Animated spinner
  - Progress text: "Generating content..." (optional streaming updates)
  - Estimated time remaining (if available)
  - Cancel button

- **Generated Content Display:**
  - Raw Markdown rendered as formatted text
  - Scrollable content area
  - Copy button (copy all content)
  - [Regenerate] button (restart generation)
  - [Edit Content →] button (proceed to editing)

### UI Layout
```
┌─ Content Generation: Technical Specification
├─ ◐ Generating... (50%)
├─ "Assembling organization knowledge base..."
├─ [Cancel]
│
└─ [After generation completes]
  ├─ Content Preview:
  │  ├─ # Technical Specification
  │  ├─ ## Executive Summary
  │  ├─ [Full markdown rendered content]
  │  └─ ... (3,000 words)
  │
  ├─ [Copy All] [Regenerate] [Edit Content →]
```

### Data Model
```typescript
// WorkPackageContent (updated with content)
{
  id: string
  work_package_id: string (FK)
  win_themes: string[]
  key_messages: string[]
  content: string          // Generated Markdown
  content_version: number  // 1 for initial, increment on regenerate
  created_at: timestamp
  updated_at: timestamp
}
```

### Context Assembly (Backend)
```typescript
const assembleContext = async (workPackage, project) => {
  // Fetch all organization documents
  const orgDocs = await db
    .from('organization_documents')
    .select('content_text')
    .eq('organization_id', project.organization_id)
    .then(r => r.data.map(d => d.content_text).join('\n\n'))

  // Fetch all project documents (RFT)
  const projectDocs = await db
    .from('project_documents')
    .select('content_text')
    .eq('project_id', project.id)
    .then(r => r.data.map(d => d.content_text).join('\n\n'))

  // Fetch win themes from WorkPackageContent
  const content = await db
    .from('work_package_content')
    .select('win_themes, key_messages')
    .eq('work_package_id', workPackage.id)
    .single()

  return {
    project_name: project.name,
    client_name: project.client_name,
    deadline: project.deadline,
    document_type: workPackage.document_type,
    requirements: workPackage.requirements,
    win_themes: content.win_themes,
    org_knowledge: orgDocs,
    rft_content: projectDocs,
    user_instructions: project.instructions
  }
}
```

### User Actions
- **Generate:** Trigger Gemini with assembled context
- **Cancel:** Stop in-progress generation
- **Regenerate:** Start fresh generation (increments version)
- **Copy:** Copy all content to clipboard
- **Edit:** Proceed to editing screen

### Error Handling
- **Generation failure:** Retry 3x with exponential backoff
- **Token limit exceeded:** Truncate org docs (oldest first), retry
- **Invalid response:** Show error, allow manual writing
- **Network issue:** Show offline indicator, retry option

### Success Criteria
✓ Full document generated from context
✓ All mandatory requirements addressed
✓ Win themes incorporated naturally
✓ Professional Markdown output
✓ Generation completes in <30 seconds
✓ Content ready for editing

---

## 4.4 Intelligent Editing Screen

### Purpose
Rich text editing with AI-powered assistance for targeted improvements.

### Rich Text Editor Integration

#### Technology: TipTap
```typescript
// Example configuration
const editor = useEditor({
  extensions: [
    StarterKit,
    Heading.configure({ levels: [1, 2, 3] }),
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Underline,
    Link,
    ListItem,
    BulletList,
    OrderedList,
    Blockquote,
    CodeBlock,
    HorizontalRule,
    // Add more as needed
  ],
  content: generatedMarkdown,
  onUpdate: ({ editor }) => {
    updateWorkPackageContent(editor.getHTML())
  }
})
```

#### Toolbar Features
- **Text Formatting:** Bold, Italic, Underline, Strikethrough
- **Alignment:** Left, Center, Right, Justify
- **Lists:** Bullet list, Ordered list, Toggle list
- **Blocks:** Heading 1-3, Paragraph, Blockquote, Code block
- **Links:** Add/edit hyperlinks
- **Undo/Redo:** Full history
- **Character count:** Display word/character count
- **Save indicator:** "Saving..." → "Saved"

### AI Assistance Menu

#### Trigger Mechanism
1. User selects text in editor
2. Context menu appears (floating or modal)
3. Shows AI action options
4. User clicks action
5. AI processes selection
6. Result displayed with apply/reject options

#### AI Actions Available

##### 1. Expand
**Purpose:** Add more detail and supporting evidence to selection

**Prompt:**
```
Selected text: "[selected text from document]"

Full document context: "[entire current editor content]"

Organization documents: "[all org doc texts]"

Task:
Expand this text with more detail and supporting evidence.
- Add 2-3 more paragraphs
- Maintain professional tone
- Include specific examples or evidence from context
- Naturally flow with surrounding text

Output as Markdown.
```

**User Flow:**
1. Select text: "Cloud architecture provides 99.9% uptime"
2. Click "Expand"
3. AI returns: "Cloud architecture provides 99.9% uptime through [detailed explanation]..."
4. User sees: Replace selection | Insert after | Reject
5. Choose action, text updated

##### 2. Shorten
**Purpose:** Reduce verbosity while maintaining key points

**Prompt:**
```
Selected text: "[selected text]"

Task:
Shorten this text to be more concise while keeping key points.
- Reduce by 30-50%
- Maintain professional tone
- Remove redundancy

Output as Markdown.
```

##### 3. Add Evidence
**Purpose:** Find and incorporate relevant proof points from org knowledge

**Prompt:**
```
Selected text: "[selected text]"

Organization documents: "[ALL org doc texts]"

Task:
Find relevant case studies, certifications, project examples from our
organization documents that support this claim. Add them as evidence.
- Reference specific projects, metrics, certifications
- Add 1-2 supporting examples
- Cite sources from our organization docs

Output as Markdown.
```

##### 4. Check Compliance
**Purpose:** Verify section addresses all applicable requirements

**Prompt:**
```
Selected section: "[selected text]"

Requirements for [document type]:
[List of all requirements for this work package]

Task:
Check if this section addresses the applicable requirements.
List:
1. Which requirements are addressed (with quotes)
2. Which requirements are missing
3. Recommendations to improve compliance

Output as checklist format.
```

**Result:** Shows compliance report, user can accept/modify based on findings

##### 5. Rephrase
**Purpose:** Change tone/style while keeping meaning

**Prompt:**
```
Selected text: "[selected text]"

Current tone: [assess from context]

Task:
Rephrase this text with these improvements:
- Tone: More compelling, less defensive
- Style: Active voice, confident language
- Impact: Stronger emphasis on our differentiators

Output as Markdown.
```

##### 6. Custom Instruction
**Purpose:** User provides specific instruction for AI

**Flow:**
1. User selects text
2. Clicks "Custom Instruction"
3. Input field appears: "What should I do with this?"
4. User types: "Add metrics comparing our solution to industry standard"
5. AI processes with selected text + custom instruction
6. Result shown with apply options

**Prompt Template:**
```
Selected text: "[selected text]"

Full document: "[editor content]"

Organization knowledge: "[org docs]"

Requirements: "[work package requirements]"

User instruction: "[custom instruction]"

Task:
Apply the user's instruction to the selected text.
- Maintain document consistency
- Keep professional tone
- Integrate naturally with surrounding content

Output as Markdown.
```

### AI Actions Menu UI

#### Design Pattern
```
┌────────────────────────────────────┐
│ ✨ AI Actions                      │
├────────────────────────────────────┤
│ ⬈ Expand                           │
│ ⬇ Shorten                          │
│ 📋 Add Evidence                    │
│ ✓ Check Compliance                 │
│ 🔄 Rephrase                        │
│ ⚙️ Custom Instruction              │
└────────────────────────────────────┘
```

#### Menu Behavior
- **Trigger:** Text selection (floating menu or right-click)
- **Position:** Near selected text, avoid window edges
- **Action states:** 
  - Hover: Highlight action
  - Click: Show loading spinner
  - Complete: Show "Replace | Reject" buttons
- **Keyboard shortcuts:** Opt/Cmd+K (or configurable)

### Applying AI Results

#### Result Display
```
Original: "Cloud architecture provides 99.9% uptime"

AI Suggestion: "Cloud architecture provides 99.9% uptime through 
redundant database clusters across 3 availability zones, with automatic 
failover mechanisms ensuring zero downtime during maintenance windows..."

[✓ Apply]  [→ Insert After]  [✗ Reject]  [⟲ Regenerate]
```

#### Apply Options
- **Replace:** Replace selected text with AI result
- **Insert After:** Keep original, add AI result after
- **Reject:** Discard AI result, keep original
- **Regenerate:** Retry AI action with modified context

### Full Editor Layout
```
┌─ Work Package: Technical Specification
├─ Editor Toolbar: [B I U | H1 H2 H3 | • # > | Link]
├─
├─ ┌──────────────────────────────────────────────────┐
│  │ # Technical Specification                        │
│  │                                                  │
│  │ ## Executive Summary                             │
│  │ Our approach emphasizes cloud-native...         │
│  │                                                  │
│  │ ## Architecture & Infrastructure              [Selected Text]
│  │ [AI Actions Menu appears on selection]         ✨ Expand
│  │ Cloud architecture provides 99.9% uptime...    ✨ Shorten
│  │                                                 📋 Evidence
│  │ [Full editor content continues]                ✓ Compliance
│  └──────────────────────────────────────────────────┘
│
├─ Word count: 2,150 words | [Autosave: Saved]
└─ [← Back] [Save] [Export as Word →]
```

### Data Persistence
- **Auto-save:** Every 30 seconds to WorkPackageContent.content
- **Manual save:** [Save] button for immediate persistence
- **Version history:** content_version incremented on major edits (optional for MVP)

### Data Model
```typescript
// WorkPackageContent (fully populated by 4.4)
{
  id: string
  work_package_id: string (FK)
  win_themes: string[]
  key_messages: string[]
  content: string              // HTML or Markdown from TipTap
  content_version: number      // Incremented on major edits
  created_at: timestamp
  updated_at: timestamp
}
```

### User Actions
- **Edit:** Type, delete, format text using toolbar
- **Select text:** Highlight for AI actions
- **AI action:** Click action from menu
- **Apply result:** Replace, insert, or reject
- **Save:** Persist changes
- **Back:** Return to previous phase (with save prompt)
- **Export:** Proceed to export phase

### Error Handling
- **AI action failure:** Show error, allow retry or manual edit
- **Concurrent edits:** Last writer wins (simple, single-user MVP)
- **Network loss:** Show "Offline" indicator, queue saves
- **Invalid Markdown:** Graceful rendering, show warning

### Success Criteria
✓ Full rich text editing capabilities
✓ All AI actions function correctly
✓ Content saves automatically
✓ Professional appearance maintained
✓ All edits traceable (for future audit)

---

## 4.5 Export

### Purpose
Convert edited document to professional Word format and mark work package complete.

### Export Flow
1. User clicks [Export as Word] button
2. System prepares document for export
3. Generates .docx file using docx.js library
4. Downloads file to user's device
5. Optionally mark work package as completed
6. Return to project dashboard

### Word Document Generation

#### Library: docx.js (or similar)
```typescript
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

const generateWordDocument = async (workPackage, content) => {
  // Parse Markdown to structured content
  const sections = parseMarkdownToSections(content)

  // Build document
  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            text: workPackage.document_type,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 }
          }),

          // Generate from parsed sections
          ...sections.map(section => buildSection(section)),

          // Footer with metadata
          new Paragraph({
            text: `Generated for: ${project.name}`,
            spacing: { before: 400, after: 100 }
          }),
          new Paragraph({
            text: `Date: ${new Date().toLocaleDateString()}`,
            spacing: { after: 0 }
          })
        ]
      }
    ]
  })

  // Generate and download
  const blob = await Packer.toBlob(doc)
  downloadFile(blob, `${workPackage.document_type}.docx`)
}
```

#### Document Formatting
- **Font:** Calibri or similar professional font
- **Margins:** 1 inch (standard business)
- **Line spacing:** 1.5 lines
- **Headings:** H1 (24pt bold), H2 (14pt bold), H3 (12pt bold)
- **Body text:** 11pt, justified
- **Lists:** Bullet and numbered lists preserved from Markdown
- **Styling:** Bold, italic, underline preserved
- **Table support:** If editor includes tables

#### File Naming Convention
```
[DocumentType]_[ProjectName]_[Date].docx

Examples:
- Technical_Specification_Acme_Corp_2025-01-15.docx
- Bill_of_Quantities_Acme_Corp_2025-01-15.docx
- Methodology_Acme_Corp_2025-01-15.docx
```

### Completion Workflow
```
1. User clicks [Export as Word]
   ↓
2. "Exporting document..." (progress)
   ↓
3. File downloads to user
   ↓
4. Confirm dialog: "Mark this document as completed?"
   [Yes] [No]
   ↓
5. If Yes:
   - Update work_package.status = 'completed'
   - Update work_package.updated_at
   - Update WorkPackageContent.exported_file_path
   - Update WorkPackageContent.exported_at
   ↓
6. Return to project dashboard
```

### Data Model Updates
```typescript
// WorkPackage
{
  status: 'not_started' | 'in_progress' | 'completed'
  updated_at: timestamp (refresh)
}

// WorkPackageContent
{
  exported_file_path: string // S3/Storage path if stored
  exported_at: timestamp     // Export timestamp
}
```

### UI Layout
```
┌─ Work Package: Technical Specification
├─ [← Back] [Save] [Export as Word ✓]
│
└─ Export Options
   ├─ Format: Word (.docx) [selected]
   ├─ Include metadata: [checkbox checked]
   ├─ [Export as Word]
   │
   └─ [After export]
      ├─ ✓ Document exported successfully
      ├─ "Technical_Specification_Acme_Corp_2025-01-15.docx"
      ├─ [Mark as Completed] [Continue to Next]
      └─ [Return to Dashboard]
```

### Export Options (Future)
- **PDF:** Export as PDF instead (post-MVP)
- **Metadata:** Include project info, author, creation date
- **Template:** Apply corporate template styling
- **Multi-format:** Export all formats simultaneously

### User Actions
- **Export:** Generate and download Word document
- **Mark completed:** Update status in database
- **Continue:** Proceed to next work package
- **Return:** Go back to project dashboard

### Success Criteria
✓ Word document generates without errors
✓ Formatting preserved from editor
✓ File downloads with correct naming
✓ Status updated to completed
✓ File is professional and printable

---

## 4. Complete Workflow Summary

### End-to-End Flow
```
User enters Work Package workflow
    ↓
4.1 Requirements Analysis
    - View requirements extracted during Phase 2
    - Validate/edit as needed
    ↓
4.2 Strategy & Planning
    - Generate win themes (Gemini)
    - Add key messages
    - Review bid recommendation
    ↓
4.3 Content Generation
    - Trigger full document generation (Gemini)
    - View generated Markdown
    - Stream progress or loading state
    ↓
4.4 Intelligent Editing
    - Rich text editor (TipTap)
    - Select text for AI actions
    - Expand, Shorten, Add Evidence, Check Compliance, Rephrase, Custom
    - Auto-save as user edits
    ↓
4.5 Export
    - Generate Word document (.docx)
    - Download to user
    - Mark as completed
    ↓
Return to Project Dashboard (Phase 3)
    - Status updated to "Completed"
    - Can proceed to next work package or view dashboard
```

### Data Flow
```
WorkPackage (from Phase 2)
├─ id, document_type, requirements
├─ (user edits requirements in 4.1)
│
WorkPackageContent (new, created in 4.2)
├─ win_themes (generated in 4.2)
├─ key_messages (user/generated in 4.2)
├─ content (generated in 4.3, edited in 4.4)
├─ content_version (incremented on regenerate)
├─ exported_file_path (populated in 4.5)
├─ exported_at (populated in 4.5)

WorkPackage (updated)
├─ status: 'completed' (in 4.5)
├─ updated_at: timestamp (refreshed in 4.5)
```

### Context Management Across Phases
- **4.1:** Requires WorkPackage.requirements
- **4.2:** Requires Project, WorkPackage, org docs, RFT docs
- **4.3:** Requires all of 4.2 + win themes from 4.2
- **4.4:** Requires WorkPackageContent.content from 4.3
- **4.5:** Requires WorkPackageContent.content (edited) from 4.4

**Key:** Org docs and RFT docs fetched once per project, reused across all phases and all work packages.

---

## Implementation Checklist

### 4.1 Requirements Analysis
- [ ] Component: RequirementsScreen
- [ ] Display requirements from work_package.requirements
- [ ] Modal for edit requirement
- [ ] Delete confirmation dialog
- [ ] Form for add requirement
- [ ] Save logic for edits
- [ ] Navigation to 4.2

### 4.2 Strategy & Planning
- [ ] Component: StrategyScreen
- [ ] Gemini integration for win themes generation
- [ ] Display generated themes (editable list)
- [ ] Add/delete theme functionality
- [ ] Key messages input
- [ ] Bid recommendation display (optional)
- [ ] Create/update WorkPackageContent record
- [ ] Navigation to 4.3

### 4.3 Content Generation
- [ ] Component: GenerationScreen
- [ ] Context assembly function
- [ ] Gemini integration with full prompt
- [ ] Streaming progress display (or spinner)
- [ ] Markdown rendering
- [ ] Regenerate logic
- [ ] Save to WorkPackageContent.content
- [ ] Navigation to 4.4

### 4.4 Intelligent Editing
- [ ] Component: EditorScreen
- [ ] TipTap editor setup with extensions
- [ ] Toolbar implementation
- [ ] Text selection detection
- [ ] AI menu display (floating/modal)
- [ ] Expand action + Gemini prompt
- [ ] Shorten action + Gemini prompt
- [ ] Add Evidence action + Gemini prompt
- [ ] Check Compliance action + Gemini prompt
- [ ] Rephrase action + Gemini prompt
- [ ] Custom Instruction modal + Gemini prompt
- [ ] Apply/reject/regenerate results
- [ ] Auto-save logic (30s interval)
- [ ] Manual save button
- [ ] Navigation: back, export

### 4.5 Export
- [ ] Component: ExportScreen (or modal)
- [ ] Markdown to Word conversion logic
- [ ] File naming convention
- [ ] Download file
- [ ] Completion workflow
- [ ] Update work_package.status
- [ ] Update WorkPackageContent fields
- [ ] Navigation back to dashboard

---

## Testing Strategy

### Unit Tests
- [ ] Gemini prompt construction (all variations)
- [ ] Markdown parsing for Word export
- [ ] Context assembly function
- [ ] Requirement edit/add/delete logic

### Integration Tests
- [ ] Full workflow: 4.1 → 4.2 → 4.3 → 4.4 → 4.5
- [ ] AI actions: select text → action → result → apply
- [ ] Database persistence across phases
- [ ] File download functionality

### E2E Tests
- [ ] Complete work package from requirements to export
- [ ] Multiple work packages in sequence
- [ ] Error scenarios (AI failure, network)

### Demo Testing
- [ ] Requirements display and editing
- [ ] Win themes generation quality
- [ ] Content generation quality
- [ ] All AI actions functional
- [ ] Export generates valid .docx
- [ ] File opens properly in Word

---

## Performance Targets

- **Win themes generation:** <10 seconds
- **Content generation:** <30 seconds
- **AI action (expand/evidence/etc):** <10 seconds
- **Auto-save:** <1 second
- **Export to Word:** <3 seconds
- **Page load:** <2 seconds
- **Editor responsiveness:** <100ms keystroke feedback

---

## Notes for Implementer

1. **Gemini Prompts:** These prompts are starting points. Iterate with real content for quality improvements.

2. **Token Management:** Monitor context size. Typical content:
   - Requirements: 1-2K tokens
   - Win themes: 500 tokens
   - Org docs: 20-50K tokens
   - RFT docs: 50-100K tokens
   - Total per generation: 100-150K tokens (well under 1M limit)

3. **Markdown to HTML:** TipTap handles this internally. Save as HTML to database, render as needed.

4. **Error Messages:** All Gemini errors should show user-friendly messages ("Unable to generate. Retrying...") not raw API errors.

5. **Mobile:** Phase 4 targets desktop only. Editor, AI menu work best on larger screens.

6. **Accessibility:** Ensure TipTap editor is accessible (keyboard navigation, screen readers).

