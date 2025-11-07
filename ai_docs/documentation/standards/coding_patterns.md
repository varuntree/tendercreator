# Coding Patterns & Rules

This document defines code style and structure patterns. For system architecture, data schema, and integration patterns, see `/architecture` folder.

**Architecture References:**
- System design, layers, data flow → `/architecture/system-architecture.md`
- Database schema, tables, RLS → `/architecture/data-schema.sql`
- API contracts, AI integration, file uploads → `/architecture/integration-contracts.md`

## 📋 Table of Contents

1. [🎨 Design System Pattern](#-design-system-pattern)
2. [🎨 Component Pattern](#-component-pattern)
3. [🚫 Prohibited Patterns](#-prohibited-patterns)
4. [✅ Code Review Checklist](#-code-review-checklist)

---

## 🎨 Design System Pattern

### ✅ REQUIRED: Use CSS Variables for All Design Tokens

**All design values must use CSS variables.** Never hard-code spacing, colors, or sizes.

#### Design Token Structure:
```css
/* ✅ CORRECT - In globals.css */
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  
  /* Colors (HSL format) */
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
}
```

#### Usage in Components:
```typescript
// ✅ CORRECT - Using design tokens
<div className="p-4 text-sm rounded-lg">
  {/* p-4 uses var(--space-4) */}
  {/* text-sm uses var(--font-size-sm) */}
  {/* rounded-lg uses var(--radius-lg) */}
</div>

// ❌ WRONG - Hard-coded values
<div style={{ padding: '16px', fontSize: '14px' }}>
```

#### Adding shadcn/ui Components:
```bash
# ✅ CORRECT - Use shadcn CLI
npx shadcn@latest add button

# Components automatically use CSS variables
```

#### Updating Design System:
When design specifications arrive:
1. Update values in `/app/globals.css`
2. Components automatically use new values
3. No component code changes needed

---

## 🎨 Component Pattern

### ✅ Component Structure Rules

**Fixed Decision**: Tailwind CSS + shadcn/ui only (per `development-decisions.md`)

#### File Organization:
```typescript
// ✅ CORRECT - Component structure
export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className="tailwind-classes">
      {/* UI using shadcn/ui components */}
    </div>
  )
}

interface ComponentNameProps {
  prop1: string
  prop2?: number
}
```

#### Repository Usage in Components:
```typescript
// ✅ CORRECT - Repository in component
import { authRepository } from '@/libs/repositories/authRepository'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    authRepository.getUser().then(setUser)
  }, [])
  
  return <div>Dashboard content</div>
}
```

#### Naming Conventions:
- **Components**: PascalCase (`ButtonCheckout.tsx`)
- **Props Interface**: `ComponentNameProps`
- **Hooks**: camelCase starting with `use` (`useFileUpload.ts`)

---

## 🚫 Prohibited Patterns

### ❌ Enum Changes Without Migrations:
```typescript
// NEVER DO THIS - Change enum in code without database migration
export type ProjectStatus = 'new_value' | 'old_value' // Added 'new_value'
// Must create migration FIRST, then update code
```

### ❌ Hard-Coded Column Names in Queries:
```typescript
// NEVER DO THIS - String-based column names
.select('id, file_name, content_text')
// Use generated types or verify column exists
```

### ❌ Empty String for NULL:
```typescript
// NEVER DO THIS - Pass empty strings to database
deadline: data.deadline || '', // Wrong
// Always convert empty strings to null
deadline: data.deadline || null, // Correct
```

### ❌ Unvalidated External API Calls:
```typescript
// NEVER DO THIS - No validation before calling external API
const result = await model.generateContent(prompt)
// Add existence checks and fallbacks
```

### ❌ Class-Based Repositories:
```typescript
// NEVER DO THIS
class AuthRepository extends BaseRepository {
  async getUser() { /* ... */ }
}
```

### ❌ Auto-Detection Patterns:
```typescript
// NEVER DO THIS  
if (typeof window === 'undefined') {
  return serverClient()
} else {
  return browserClient()
}
```

### ❌ Raw API Routes:
```typescript
// NEVER DO THIS
export async function POST(req: NextRequest) {
  try {
    // Raw implementation
  } catch (error) {
    // Manual error handling
  }
}
```

### ❌ Client Components Using Repositories:
```typescript
// NEVER DO THIS - Client component importing server repositories
import { getUser } from '@/libs/repositories/auth'
// Use direct client instead in client components
```

### ❌ Non-Standard UI:
```typescript
// NEVER DO THIS - Wrong UI framework
import { Button } from 'react-bootstrap'
import { Spinner } from 'antd'

// NEVER DO THIS - DaisyUI classes (removed)
<button className="btn btn-primary">

// NEVER DO THIS - Hard-coded design values
<div style={{ padding: '16px', margin: '8px' }}>
```

---

## ✅ Code Review Checklist

**Before committing, verify:**

### Architecture Compliance:
- [ ] Read `/architecture/system-architecture.md` for this phase
- [ ] Followed data schema in `/architecture/data-schema.sql`
- [ ] Followed API/AI contracts in `/architecture/integration-contracts.md`
- [ ] No architectural deviations without user approval

### Code Style:
- [ ] Uses only Tailwind + shadcn/ui (no other UI libraries)
- [ ] All spacing/colors use CSS variables (design tokens)
- [ ] Proper TypeScript interfaces
- [ ] Consistent naming conventions (PascalCase components, camelCase functions)

### Prohibited Patterns:
- [ ] No class-based repositories
- [ ] No auto-detection patterns (typeof window checks)
- [ ] No raw API routes (always use wrappers)
- [ ] No hard-coded design values
- [ ] No non-standard UI frameworks

### Best Practices:
- [ ] Components contain only UI logic (business logic in `/libs`)
- [ ] Server Components for data fetching, Client Components for interactivity
- [ ] No unnecessary complexity (keep MVP simple)
- [ ] Clear, concise code (avoid over-engineering)

### Phase 2 Lessons (Enum & Schema Safety):
- [ ] Enum changes: Database migration FIRST, code update SECOND
- [ ] Search ALL occurrences when changing enum values (including defaults)
- [ ] Empty strings → null conversion for optional fields
- [ ] Validate external API model names exist before deployment
- [ ] Use generated Supabase types to catch column name errors
- [ ] Test both auto-creation AND manual-creation code paths

---

## 🤖 AI Integration Rules

### ✅ REQUIRED: Use Unified Service Layer

**All AI/Gemini API calls must use the unified service layer.** Never call `model.generateContent()` directly.

#### Service Layer Structure:
```typescript
// ✅ CORRECT - Use geminiService
import { executeRequest, executeStreamingRequest } from '@/libs/ai/gemini-service'

const response = await executeRequest({
  prompt: buildPrompt(...),
  requestType: 'content-generation',
  temperature: 0.7,
  maxRetries: 4
})

// ❌ WRONG - Direct model access
import { model } from './client'
const result = await model.generateContent(prompt)
```

#### Why Service Layer:
- **Automatic retry**: Exponential backoff (1s, 2s, 4s, 8s)
- **Rate limit handling**: Detects 429 errors, extracts retry delay, waits automatically
- **Token validation**: Enforces 64K limit before sending request
- **Consistent errors**: Standard format with `{ success, data?, error?, retryDelaySeconds? }`
- **Logging**: Centralized request logging

### Token Limits

**Gemini 2.0 Flash has 64K token input limit** (not 1M).

#### Validation Rules:
```typescript
// ✅ CORRECT - Validate before generation
const context = await assembleProjectContext(supabase, projectId)
const validation = validateContextSize(context)

if (!validation.valid) {
  return Response.json({
    error: validation.warning,
    tokenCount: validation.tokenEstimate
  }, { status: 400 })
}

// Token counter uses js-tiktoken for accuracy
import { countTokens } from '@/libs/ai/token-counter'
const tokens = countTokens(text) // Accurate token count
```

#### Token Guidelines:
- **Warning threshold**: 51.2K tokens (80% of limit)
- **Hard limit**: 64K tokens
- **Batch operations**: Validate total prompt size (context + all requirements)
- **Truncation strategy**: Remove oldest org docs first if needed

### Error Handling

**All AI routes must return consistent error format:**

```typescript
// ✅ CORRECT - Consistent error response
catch (error) {
  const err = error as { isRateLimitError?: boolean; retryDelaySeconds?: number }

  if (err.isRateLimitError) {
    return NextResponse.json({
      error: err.message,
      isRateLimitError: true,
      retryDelaySeconds: err.retryDelaySeconds || 60
    }, { status: 429 })
  }

  return NextResponse.json({
    error: err.message || 'Generation failed'
  }, { status: 500 })
}
```

### Retry Logic

**Standard retry configuration:**
- **Max retries**: 4 attempts
- **Backoff**: Exponential (1s, 2s, 4s, 8s)
- **Rate limits**: Use Gemini's `retryDelay` value, default 60s
- **Batch operations**: 6 max retries (longer operations need more attempts)

### Context Assembly

**Use caching to avoid repeated fetches:**

```typescript
// ✅ CORRECT - Context automatically cached (5 min TTL)
const context = await assembleProjectContext(supabase, projectId)
// Second call within 5 min returns cached version

// Skip cache if needed
const freshContext = await assembleProjectContext(supabase, projectId, { skipCache: true })

// Clear cache manually
clearContextCache(projectId) // Clear specific project
clearContextCache() // Clear all
```

### Prompt Patterns

**Follow established prompt structure:**

#### JSON Output Prompts:
```typescript
// ✅ CORRECT - Strict JSON format
`Return ONLY valid JSON with no markdown fences:
{
  "field1": "value",
  "field2": ["item1", "item2"]
}

No text before or after the JSON.`

// Use parseJsonResponse() helper
const parsed = parseJsonResponse<MyType>(response)
```

#### Markdown Content Prompts:
```typescript
// ✅ CORRECT - Content prompts
`Generate comprehensive content in well-formatted Markdown:
- # Main heading
- ## Section headings
- **Bold** for emphasis
- Bullet lists where appropriate

Return only the document content.`
```

### Streaming Support

**Use streaming for real-time user feedback:**

```typescript
// ✅ CORRECT - Server-Sent Events streaming
if (acceptHeader.includes('text/event-stream')) {
  const encoder = new TextEncoder()
  let fullContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of generateDocumentContentStream(...)) {
        fullContent += chunk
        const data = JSON.stringify({ text: chunk })
        controller.enqueue(encoder.encode(`event: chunk\ndata: ${data}\n\n`))
      }

      controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ fullContent })}\n\n`))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })
}
```

### Batch Operations

**Client-orchestrated batching for bulk generation:**

```typescript
// ✅ CORRECT - Use batch API endpoint
import { bulkGenerateDocuments } from '@/libs/utils/bulk-generation-v2'

const result = await bulkGenerateDocuments(
  projectId,
  workPackageIds,
  (progress) => {
    console.log(`Batch ${progress.batchNumber}/${progress.totalBatches}`)
    console.log(`${progress.completedDocs}/${progress.totalDocs} documents`)
  }
)

// Batches are automatically sized (2-3 docs per batch)
// 5 second delay between batches for rate limit safety
// Automatic retry with split strategy if batch too large
```

### Code Review Checklist - AI:
- [ ] All AI calls use `geminiService.executeRequest()`, not direct model access
- [ ] Context validated for 64K token limit before generation
- [ ] Error responses include `isRateLimitError` and `retryDelaySeconds` when applicable
- [ ] Streaming endpoints check `Accept` header and support backwards compatibility
- [ ] Batch operations use `/api/projects/[id]/generate-batch` endpoint
- [ ] JSON prompts emphasize "valid JSON only, no markdown"
- [ ] No hard-coded token limits (always use constant from service layer)

---

**Remember**: Read architecture files before each phase. Keep code lean, functional, and aligned with system design.