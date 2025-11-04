# TenderCreator.ai - Technical Architecture Analysis

**Last Updated:** 2025-11-04
**Research Method:** Web analysis, source inspection, endpoint testing

---

## Tech Stack Overview

| Layer | Technology | Confidence |
|-------|-----------|-----------|
| **Marketing Site** | Webflow | ✓ Confirmed |
| **Web Application** | Next.js (React) | ✓ Confirmed |
| **CSS Framework** | Tailwind CSS | ✓ Confirmed |
| **Authentication** | Clerk | ✓ Confirmed |
| **State Management** | TanStack Query (React Query) | ✓ Confirmed |
| **Error Tracking** | Sentry | ✓ Confirmed |
| **Analytics** | Google Analytics 4 | ✓ Confirmed |
| **Hosting (Marketing)** | Webflow CDN | ✓ Confirmed |
| **Hosting (Data)** | Australia-based | ✓ Confirmed |
| **AI/LLM Provider** | Unknown (likely OpenAI/Anthropic) | ○ Inferred |
| **Document Processing** | Custom PDF/Word parser | ○ Inferred |
| **Database** | Unknown (likely PostgreSQL) | ○ Inferred |
| **Vector Database** | Unknown (likely Pinecone/Chroma) | ○ Inferred |

**Legend:** ✓ Confirmed | ○ Inferred | × Unknown

---

## Frontend Architecture

### Marketing Website (tendercreator.ai)

**Platform:** Webflow
**Hosting:** Webflow CDN (`cdn.prod.website-files.com`)
**Key Features:**
- Responsive design with mobile-first breakpoints (480px, 768px, 992px)
- Custom CSS with Webflow's proprietary framework
- No traditional JavaScript framework (vanilla JS with Webflow helpers)

**Third-Party Services:**
- **Google Fonts:** Public Sans, Rubik, Inter, Plus Jakarta Sans
- **Google Analytics 4:** Tracking ID `G-VH2G30KZ8B`
- **Zoom Scheduler:** Embedded iframe for demo bookings
- **Custom UTM Tracking:** 30-day cookie persistence across subdomains

**JavaScript Capabilities:**
```javascript
// Custom event tracking
- file_download events (PDF downloads)
- cta_click events (button interactions)
- Button location tracking
- Cross-domain parameter passing (app.tendercreator.ai, staging.tendercreator.ai)
```

### Web Application (app.tendercreator.ai)

**Framework:** Next.js with React Server Components (RSC)
**Rendering:** Hybrid SSR/CSR with code splitting
**CSS:** Tailwind CSS utility-first framework

**Architecture Pattern:**
- App Router (Next.js 13+)
- Locale-based routing (`[locale]` structure)
- Protected routes via Clerk middleware
- Code-split bundles for performance
- Error boundaries for graceful degradation

**Key Libraries:**
```javascript
- React (18+)
- Next.js (13+ with App Router)
- Tailwind CSS
- TanStack Query (React Query) for server state
- Clerk SDK for authentication
- Sentry SDK for error monitoring
```

**Internationalization:**
- i18n support with locale routing
- Multi-language capability (structure suggests English + others)

---

## Backend Architecture

### Application Server

**Probable Stack:**
- **Framework:** Next.js API Routes or separate Node.js/Python backend
- **Language:** TypeScript/JavaScript (confirmed from Next.js) + possible Python for AI/ML
- **Pattern:** RESTful APIs or GraphQL (not confirmed)

**Architecture Pattern (Inferred):**
```
Client (Next.js)
    ↓
API Layer (Next.js API Routes or separate service)
    ↓
Business Logic Layer
    ├── Document Processing Service
    ├── AI/LLM Integration Layer
    ├── Company Profile Management
    └── Tender Analysis Engine
    ↓
Data Layer
    ├── Primary Database (PostgreSQL/MySQL likely)
    ├── Vector Database (for RAG)
    └── File Storage (S3-compatible)
```

### Authentication & Authorization

**Provider:** Clerk (Production)
**Publishable Key:** `pk_live_Y2xlcmsuYXBwLnRlbmRlcmNyZWF0b3IuYWkk`

**Features:**
- OAuth/Social login support
- Session management
- Protected route middleware
- Server-side authentication helpers
- User management portal

**Implementation Pattern:**
```typescript
// Next.js middleware pattern
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/docs"],
  // Routes protected by default
});
```

---

## AI/ML Infrastructure

### Document Processing Pipeline

**Capabilities:**
1. **Document Ingestion**
   - PDF upload (preserves formatting)
   - Word document upload
   - Prefers native digital files over scans
   - Poor performance on scanned images (OCR limitations noted)

2. **Processing Steps (Inferred):**
   - Text extraction from PDFs/Word docs
   - Document structure parsing
   - Requirement identification (mandatory vs. desirable)
   - Evaluation criteria extraction
   - Compliance point detection
   - Complexity assessment

**Technology Stack (Inferred):**
```
Document Upload
    ↓
PDF/Word Parser (PyPDF2, pdfplumber, or docx library)
    ↓
Text Chunking & Processing
    ↓
Embedding Generation (OpenAI/Cohere embeddings)
    ↓
Vector Database Storage (Pinecone/Weaviate/Chroma)
    ↓
LLM Processing (GPT-4/Claude)
    ↓
Response Generation
```

### LLM Integration (Inferred)

**Probable Provider:** OpenAI GPT-4 or Anthropic Claude

**Evidence for GPT-4:**
- Industry competitor (TenderFacts) explicitly uses GPT-4
- Common for document analysis tasks
- Strong at structured extraction

**Evidence for Claude:**
- Better at long-context documents (100k+ tokens)
- Superior for compliance/analysis tasks
- Strong safety/alignment for enterprise

**Use Cases:**
- Tender document analysis
- Requirement extraction
- Company profile matching
- Response generation
- Competitive analysis
- Compliance checking

### RAG (Retrieval Augmented Generation) Architecture

**Probable Implementation:**
```
Company Knowledge Base
    ↓
Document Embeddings (stored in vector DB)
    ↓
Semantic Search on Tender Requirements
    ↓
Context Retrieval
    ↓
LLM Prompt Enhancement
    ↓
Generated Response
```

**Key Components (Inferred):**
1. **Embedding Model:** OpenAI text-embedding-3 or similar
2. **Vector Database:** Pinecone, Weaviate, or Chroma
3. **Chunking Strategy:** Semantic chunking for tender documents
4. **Retrieval:** Hybrid search (vector + keyword)

---

## Database & Storage

### Primary Database (Inferred)

**Likely Choice:** PostgreSQL

**Reasoning:**
- Enterprise-grade reliability
- JSON support for flexible schemas
- Full-text search capabilities
- Strong Next.js ecosystem support
- Vector extension (pgvector) availability

**Probable Schema Domains:**
- Users & Authentication (managed by Clerk)
- Companies & Profiles
- Tenders & RFT Documents
- Generated Responses
- Team Management
- Billing & Subscriptions

### Vector Database (Inferred)

**Likely Options:**
1. **Pinecone** (managed, scalable)
2. **Weaviate** (hybrid search)
3. **Chroma** (open-source, embeddable)
4. **pgvector** (PostgreSQL extension)

**Use Case:**
- Company knowledge base embeddings
- Historical tender response storage
- Semantic search across documents
- Similar requirement matching

### File Storage

**Probable Solution:** S3-compatible storage

**Options:**
1. **AWS S3** (if using AWS infrastructure)
2. **Cloudflare R2** (cost-effective, AU presence)
3. **Azure Blob Storage** (if using Azure)
4. **Australian cloud provider** (for data sovereignty)

**Storage Requirements:**
- Uploaded RFT documents (PDF/Word)
- Company documents and credentials
- Generated tender responses
- Attachment management

---

## Security & Compliance

### Data Residency

**Confirmed:**
- Hosted securely in Australia
- Sensitive information not used for external AI training
- Private hosting options available for enterprise

**Implications:**
- Compliance with Australian data sovereignty laws
- Possible Australian cloud provider or AU region of major cloud
- GDPR-style privacy protections

### Authentication Security

**Clerk Implementation:**
- Industry-standard OAuth 2.0
- Session management with secure cookies
- CSRF protection
- Rate limiting (Clerk-provided)

### Data Security (Inferred)

**Likely Implementations:**
- TLS/SSL encryption in transit (HTTPS)
- Encryption at rest for stored documents
- Role-based access control (RBAC)
- Audit logging for compliance
- API key management for integrations

### Compliance Posture

**Unknown/Not Published:**
- SOC 2 Type II certification
- ISO 27001 compliance
- GDPR compliance details
- Privacy Shield framework
- Australian privacy principles adherence

**Note:** Enterprise SaaS typically pursues these certifications; lack of public disclosure doesn't indicate absence.

---

## Infrastructure & Hosting

### Hosting Architecture

**Marketing Site:**
- **Platform:** Webflow hosting
- **CDN:** Webflow's global CDN
- **DNS:** Likely Cloudflare or AWS Route53

**Application (Inferred):**
- **Platform:** Vercel (Next.js native) or AWS/Azure
- **Region:** Australia (confirmed for data storage)
- **CDN:** Cloudflare, AWS CloudFront, or Vercel Edge

### Probable Cloud Provider

**Evidence for Australian Provider:**
- Explicit "hosted in Australia" claim
- Data sovereignty emphasis
- Options: AWS Sydney, Azure Australia, Google Cloud Sydney

**Evidence for Vercel:**
- Next.js application (Vercel's native platform)
- RSC streaming format
- Edge network capabilities

**Likely Architecture:**
```
User Request
    ↓
Cloudflare/Vercel Edge (CDN, DDoS protection)
    ↓
Next.js App (Vercel or AWS ECS/Fargate)
    ↓
API Gateway (if microservices)
    ↓
Application Servers (AU region)
    ↓
Database (AU region)
    ↓
File Storage (AU region)
```

### Scalability Patterns (Inferred)

**Frontend:**
- Edge caching via CDN
- Static generation for marketing content
- Incremental Static Regeneration (ISR) for dynamic content
- Code splitting and lazy loading

**Backend:**
- Horizontal scaling for API servers
- Database read replicas
- Queue-based document processing (async)
- Caching layer (Redis likely)

**AI/ML:**
- Async job processing for long-running analysis
- Batch processing for multiple tenders
- API rate limiting for LLM providers
- Response caching for similar queries

---

## Integrations

### Confirmed Integrations

1. **Clerk** (Authentication)
   - User management
   - Session handling
   - OAuth providers

2. **Sentry** (Error Monitoring)
   - Error tracking
   - Performance monitoring
   - Release tracking

3. **Google Analytics 4** (Analytics)
   - User behavior tracking
   - Conversion tracking
   - Event analytics

4. **Zoom Scheduler** (Demo Booking)
   - Calendar integration
   - Meeting scheduling

5. **Google Fonts** (Typography)
   - Web font delivery

### Probable Integrations (Inferred)

1. **LLM Provider** (OpenAI/Anthropic)
   - API integration for GPT-4/Claude
   - Streaming responses
   - Function calling

2. **Email Service** (SendGrid/AWS SES)
   - Transactional emails
   - Notifications

3. **Payment Gateway** (Stripe/PayPal)
   - Subscription billing
   - Enterprise invoicing

4. **Document Storage** (S3-compatible)
   - File upload/download
   - Secure access URLs

### Potential Future Integrations

- CRM systems (Salesforce, HubSpot)
- Tender platforms (AusTender, TenderLink)
- Document management systems
- Microsoft Office 365 / Google Workspace
- Slack/Teams for notifications

---

## Probable System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────┐              ┌─────────────────────────┐  │
│  │  Marketing Site   │              │   Web Application       │  │
│  │   (Webflow)      │              │   (Next.js + React)     │  │
│  │   tendercreator  │              │   app.tendercreator     │  │
│  └──────────────────┘              └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CDN / Edge Network (Cloudflare / Vercel Edge)           │   │
│  │  - Static asset caching                                  │   │
│  │  - DDoS protection                                       │   │
│  │  - Geographic routing to AU region                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (AU)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js Application Server                              │   │
│  │  ├── App Router (RSC)                                    │   │
│  │  ├── API Routes                                          │   │
│  │  ├── Middleware (Auth)                                   │   │
│  │  └── Server Components                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Business Logic Services                                 │   │
│  │  ├── Document Processing Service                         │   │
│  │  ├── Tender Analysis Engine                              │   │
│  │  ├── Response Generation Service                         │   │
│  │  ├── Company Profile Manager                             │   │
│  │  └── Team & Billing Service                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                 │
│  ┌──────────────────┐         ┌────────────────────────────┐   │
│  │  LLM Provider     │         │  RAG Pipeline              │   │
│  │  (GPT-4/Claude)   │←────────│  ├── Embedding Gen        │   │
│  │                   │         │  ├── Vector Search         │   │
│  │  API Integration  │         │  └── Context Retrieval     │   │
│  └──────────────────┘         └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (AU REGION)                        │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │  PostgreSQL   │  │  Vector DB   │  │  Object Storage (S3)  │ │
│  │              │  │  (Pinecone/  │  │                        │ │
│  │  - Users     │  │   pgvector)  │  │  - RFT Documents      │ │
│  │  - Companies │  │              │  │  - Company Docs       │ │
│  │  - Tenders   │  │  - Embeddings│  │  - Generated Files    │ │
│  │  - Responses │  │  - Knowledge │  │  - Attachments        │ │
│  └──────────────┘  └─────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌────────────────┐   │
│  │  Clerk   │  │ Sentry  │  │  GA4     │  │  Email (SES)   │   │
│  │  (Auth)  │  │ (Errors)│  │(Analytics)│  │  Payment       │   │
│  └──────────┘  └─────────┘  └──────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Document Processing Flow

```
User Uploads RFT Document
    ↓
[Next.js API Route]
    ↓
File validation (PDF/Word, size limits)
    ↓
Upload to S3-compatible storage (AU region)
    ↓
[Async Job Queue - Redis/BullMQ]
    ↓
[Document Processing Worker]
    ├── Text extraction (PyPDF2/pdfplumber)
    ├── Structure parsing (layout analysis)
    └── Metadata extraction
    ↓
[AI Analysis Service]
    ├── Send chunks to LLM (GPT-4/Claude)
    ├── Extract requirements (structured output)
    ├── Identify evaluation criteria
    ├── Detect compliance points
    └── Assess complexity
    ↓
[Database Storage]
    ├── Save parsed data to PostgreSQL
    └── Store embeddings in vector DB
    ↓
[Notification Service]
    └── Email/in-app notification to user
    ↓
User views analysis in dashboard
```

### Response Generation Flow

```
User requests tender response generation
    ↓
[Company Profile Retrieval]
    ├── Fetch company data from PostgreSQL
    └── Retrieve relevant documents from vector DB (RAG)
    ↓
[Requirement Matching]
    ├── Vector search for similar past responses
    └── Match company strengths to requirements
    ↓
[LLM Prompt Construction]
    ├── Requirement context
    ├── Company profile context
    ├── Retrieved knowledge (RAG)
    └── Compliance checklist
    ↓
[LLM API Call]
    ├── Streaming response generation
    └── Structured output formatting
    ↓
[Quality Checks]
    ├── Compliance verification
    ├── Word count targets
    └── Tone/style consistency
    ↓
[Save & Present]
    ├── Store in PostgreSQL
    ├── Generate downloadable format
    └── Display in editor (React component)
```

---

## Technology Gaps & Assumptions

### Confirmed (Direct Evidence)

✓ **Frontend Framework:** Next.js with React
✓ **CSS Framework:** Tailwind CSS
✓ **Authentication:** Clerk
✓ **State Management:** TanStack Query
✓ **Error Tracking:** Sentry
✓ **Analytics:** Google Analytics 4
✓ **Marketing Platform:** Webflow
✓ **Data Location:** Australia
✓ **Document Formats:** PDF, Word (native preferred over scans)

### Highly Likely (Strong Inference)

○ **Primary Database:** PostgreSQL
- Reasoning: Enterprise SaaS standard, Next.js ecosystem, vector extension support

○ **LLM Provider:** OpenAI GPT-4 or Anthropic Claude
- Reasoning: Industry standard for document analysis, competitors use GPT-4, Claude superior for long docs

○ **Vector Database:** Pinecone, Weaviate, or pgvector
- Reasoning: RAG architecture needed for company knowledge base

○ **File Storage:** S3-compatible (AWS S3, Cloudflare R2, or AU provider)
- Reasoning: Industry standard, AU data residency requirement

○ **Hosting:** Vercel or AWS/Azure (AU region)
- Reasoning: Next.js optimized for Vercel, AU hosting requirement

○ **Email Service:** SendGrid or AWS SES
- Reasoning: Transactional email needs, common integrations

○ **Payment Gateway:** Stripe
- Reasoning: SaaS industry standard, subscription billing

### Assumptions (Educated Guesses)

△ **API Architecture:** RESTful with possible GraphQL
△ **Caching:** Redis for session/response caching
△ **Queue System:** BullMQ or AWS SQS for async processing
△ **Monitoring:** Datadog or AWS CloudWatch beyond Sentry
△ **Embedding Model:** OpenAI text-embedding-3-small/large
△ **Document Parsing:** PyPDF2, pdfplumber, python-docx
△ **Backend Language:** TypeScript + Python (for ML/AI)

### Unknown (No Evidence)

× **Exact cloud provider** (AWS/Azure/GCP/AU-specific)
× **Specific LLM model version** (GPT-4-turbo vs GPT-4o vs Claude 3.5)
× **Vector database choice** (among viable options)
× **Microservices vs monolith** architecture
× **CI/CD pipeline** (GitHub Actions, GitLab, Jenkins)
× **Testing framework** (Jest, Vitest, Playwright)
× **Security certifications** (SOC 2, ISO 27001)
× **Backup/disaster recovery** strategy
× **API rate limits** and quotas
× **Internal vs external ML models** (fine-tuned or base models)

### Research Limitations

**Why gaps exist:**
1. No public API documentation found
2. No developer documentation accessible
3. No job postings revealing tech requirements
4. Limited technical blog posts or case studies
5. Privacy-focused (rightfully not exposing architecture)
6. Standard SaaS practice to not disclose full stack publicly

**To confirm unknowns:**
- Direct outreach to TenderCreator.ai engineering team
- Partnership/integration technical discussions
- Enterprise customer technical due diligence
- Security questionnaires/audits
- Job postings monitoring for tech stack mentions

---

## Comparative Analysis (Similar Products)

| Feature | TenderCreator.ai | TenderFacts | Brainial |
|---------|------------------|-------------|----------|
| **LLM Disclosed** | Not public | GPT-4 confirmed | Not disclosed |
| **Data Location** | Australia | Unknown | Unknown |
| **Frontend** | Next.js | Unknown | Unknown |
| **Processing Speed** | "Minutes" | "Seconds" (claimed) | "Minutes" |
| **Private Hosting** | Available | Unknown | Unknown |
| **API Docs** | Not found | Not found | Not found |

---

## Recommendations for Technical Due Diligence

If evaluating TenderCreator.ai for enterprise adoption or integration:

### Questions to Ask

1. **Infrastructure:**
   - Exact cloud provider and AU regions used?
   - Data backup and disaster recovery procedures?
   - SLA guarantees for uptime?

2. **Security:**
   - SOC 2 Type II certification status?
   - ISO 27001 compliance?
   - Penetration testing frequency and results?
   - Data encryption standards (at rest and in transit)?

3. **AI/ML:**
   - Which LLM provider(s) and model versions?
   - Fine-tuning on industry data?
   - Data used for model training (customer data excluded)?
   - Fallback mechanisms for LLM API failures?

4. **Integration:**
   - Available APIs and documentation?
   - Webhook support for events?
   - SSO/SAML support for enterprise auth?
   - Data export capabilities?

5. **Scalability:**
   - Concurrent user limits?
   - Document processing throughput?
   - API rate limits?
   - Performance under load?

---

## Summary

**Tech Stack Findings:**

1. **Modern JAMstack Architecture** - Next.js/React frontend with Webflow marketing, Clerk auth, hosted in Australia for data sovereignty
2. **AI-Powered Document Processing** - Sophisticated PDF/Word parsing with probable GPT-4/Claude integration, RAG architecture for knowledge retrieval
3. **Enterprise-Grade Security Focus** - Australian hosting, private deployment options, no AI training on customer data, but public certifications not disclosed
4. **Developer Experience Optimized** - Modern stack (Next.js, TypeScript, Tailwind, TanStack Query) suggests strong engineering culture and maintainability

**Confidence Level:** ~60-70% of architecture inferred with high confidence; LLM provider and exact infrastructure remain unknown without direct disclosure.
