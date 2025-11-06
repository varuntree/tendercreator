# Demo Script: Multi-Document Tender Response Platform

**Duration:** 8-10 minutes
**Audience:** TenderCreator stakeholders
**Goal:** Demonstrate multi-document capability as competitive differentiator

## Pre-Demo Checklist

- [ ] Demo data set up (1 org doc, 1 project with 8-10 work packages)
- [ ] Application running at http://localhost:3000
- [ ] Signed in as test user
- [ ] Browser window maximized (1920x1080 or larger)
- [ ] Browser DevTools closed
- [ ] Project dashboard open and ready
- [ ] Presentation mode ready (if sharing screen)

## Demo Flow

### Act 1: Introduction & Context (30 seconds)

**Talking Points:**
- "Current tender tools like TenderCreator and AutogenAI generate ONE document per tender"
- "But real-world tenders require 5-15+ different documents: Technical Specs, Bill of Quantities, Risk Registers, Methodology, WHS Plans, etc."
- "This forces teams to manually split work or create everything in one bloated document"
- "Our platform solves this with true multi-document orchestration"

**Action:** None yet (just talking)

---

### Act 2: Show Organization Setup (30 seconds)

**Screen:** Organization Documents page (Settings > Documents)

**Talking Points:**
- "We start by building our organization's knowledge base"
- "Upload capability statements, case studies, certifications, past projects"
- "AI will use these as evidence when responding to tenders"

**Action:**
- Show organization documents list (1 sample doc uploaded)
- Highlight document name: "Company Capability Statement"
- "This is available across all tenders"

---

### Act 3: Create New Project (1 minute)

**Screen:** Projects list page

**Talking Points:**
- "Now let's respond to a new tender"
- "Creating a project is simple"

**Actions:**
1. Click "Create Project" or "Create new tender" button
2. Fill form:
   - Name: "Brisbane City Council IT Services RFT"
   - Client: "Brisbane City Council"
   - Deadline: [Pick date 2 weeks out]
3. Click "Create"
4. Navigate to project details page

**Talking Points:**
- "Once created, we upload the RFT documents"

**Actions:**
5. Click "Upload RFT" or drag-drop RFT file
6. Select sample RFT PDF from test fixtures
7. Wait for upload (~2 seconds)
8. "File uploaded and text extracted automatically"

---

### Act 4: The Magic - Document Decomposition (2 minutes)

**Screen:** Project details page with "Analyze RFT" button

**Talking Points:**
- "Here's where our platform differentiates"
- "Instead of generating one document, we analyze the RFT to identify ALL required submissions"

**Actions:**
1. Click "Analyze RFT" button
2. Show loading state: "Analyzing RFT..." (30-60 seconds)
3. Wait for analysis to complete

**Talking Points (while waiting):**
- "Our AI is reading through the RFT"
- "Identifying every document type required for submission"
- "Extracting specific requirements for each document"
- "This takes about 30-60 seconds"

**KEY MOMENT - Document List Appears:**

**Screen:** Work packages list showing 8-10 documents

**Talking Points (enthusiastically):**
- "And there we have it - 10 different documents identified:"
- Read a few: "Technical Specification, Bill of Quantities, Methodology, Risk Register, WHS Plan..."
- "Each with its own specific requirements extracted from the RFT"
- "Current tools would make you create ONE document. We identified TEN."

**Actions:**
4. Click into one work package to show requirements
5. Highlight requirements: "8 mandatory requirements for Technical Specification"
6. "AI extracted these from specific sections of the RFT"

---

### Act 5: Team Assignment (30 seconds)

**Screen:** Project dashboard showing work packages as cards

**Talking Points:**
- "Dashboard shows all documents and their status"
- "Some are complete, some in progress, some not started"
- "Team can work in parallel on different documents"

**Actions:**
1. Show dashboard with work packages in various states
2. Point out status indicators: "3 completed (green), 2 in progress (yellow), 5 not started"

---

### Act 6: Document Workflow Deep-Dive (3-4 minutes)

**Screen:** Project dashboard

**Talking Points:**
- "Let's walk through completing one document end-to-end"
- "We'll use the same proven workflow TenderCreator has, just for each document separately"

**Actions:**
1. Click "Open" on a "Not Started" work package (e.g., "WHS Plan")

**Screen:** Work package workflow - Requirements tab

**Talking Points:**
- "Phase 1: Review requirements"
- "These are the specific requirements for THIS document, extracted from the RFT"

**Actions:**
2. Scroll through requirements list briefly
3. Click "Continue to Strategy" or navigate to Strategy tab

**Screen:** Strategy tab

**Talking Points:**
- "Phase 2: Generate win themes"
- "AI analyzes requirements + our company docs to identify competitive advantages"

**Actions:**
4. Click "Generate Win Themes"
5. Wait 10-15 seconds (show loading spinner)
6. Win themes appear (3-5 themes)
7. Read one aloud: "Proven track record in government cloud migrations"
8. "These will be woven into our response"

**Actions:**
9. Click "Continue to Generation" or navigate to Generation tab

**Screen:** Generation tab

**Talking Points:**
- "Phase 3: AI generates the full document"
- "Uses: requirements from RFT, win themes, our company knowledge base"
- "This is the time-saving magic"

**Actions:**
10. Click "Generate Content"
11. Show loading state: "Generating content... This may take 1-2 minutes."
12. Wait 30-90 seconds (KEEP TALKING during this)

**Talking Points (while waiting):**
- "AI is writing comprehensive WHS Plan content"
- "Pulling evidence from our capability statement"
- "Addressing each mandatory requirement"
- "Incorporating our win themes naturally"
- "In production, this might take 1-2 minutes for complex documents"

**Content appears**

**Talking Points:**
- "And there's our first draft - fully formatted, comprehensive WHS Plan"
- Scroll through content briefly
- "Addresses all requirements, demonstrates our capabilities"

**Actions:**
13. Navigate to Editing tab

**Screen:** Content editor with AI assistance

**Talking Points:**
- "Phase 4: Intelligent editing - this is really cool"
- "Not just a text editor - AI-powered refinement"

**Actions:**
14. Select a paragraph of text
15. Show AI actions menu: "Expand, Shorten, Add Evidence, Check Compliance, Rephrase"
16. Click "Add Evidence"
17. Wait 5-10 seconds
18. AI inserts relevant case study from company docs

**Talking Points:**
- "AI pulled a relevant case study from our knowledge base"
- "Strengthens our response with concrete evidence"
- "Team can do this for any section"

**Actions:**
19. Navigate to Export tab

**Screen:** Export screen

**Talking Points:**
- "Phase 5: Export finished document"

**Actions:**
20. Click "Export as Word"
21. Wait for download (~5 seconds)
22. Word file downloads

**Talking Points:**
- "Professional Word document, ready for submission"
- "Document marked as complete"

---

### Act 7: Scale - Multi-Document Dashboard (1 minute)

**Screen:** Return to project dashboard

**Talking Points:**
- "Now imagine doing that for ALL 10 documents"
- "Each follows the same workflow: requirements, strategy, generate, edit, export"
- "Team works in parallel on different documents"

**Actions:**
1. Show dashboard with multiple documents in various states
2. Point out: "3 completed, 2 in progress, 5 not started"
3. Highlight progress indicator

**Talking Points:**
- "When all documents are done, bulk export"

**Actions:**
4. Click "Export All Completed" button (if exists)
5. Show progress modal: "Exporting 3 documents..."
6. Wait for ZIP download (~5-10 seconds)
7. ZIP file downloads

**Talking Points:**
- "One ZIP file with all completed documents"
- "Ready for tender submission"
- "Each file properly named"

---

### Act 8: Closing (30 seconds)

**Screen:** Dashboard or landing page

**Talking Points:**
- "This is how tenders actually work - multiple documents, not one"
- "Current tools force workarounds. We built for the real workflow."
- "Built on modern stack: Next.js, Gemini AI, Supabase"
- "Matches TenderCreator's design language - we can integrate seamlessly"
- "Ready to enhance TenderCreator with this capability"

**Call to Action:**
- "Questions?"
- "Happy to show specific features in detail"
- "Or dive into the technical architecture"

---

## Fallback Plans

### If RFT Analysis Fails
- **Fallback:** Use pre-analyzed demo project (already has 10 work packages)
- **Explain:** "In our demo environment, let me show you a project we analyzed earlier"
- Continue from Act 5

### If Content Generation Fails
- **Fallback:** Use pre-completed work package (with content already generated)
- **Explain:** "For time, let me show you one we generated earlier"
- Show editing and export only

### If AI Operations Are Slow
- **Keep talking:** Use the "Talking Points (while waiting)" sections
- **Don't panic:** Loading states show it's working
- **Have backup:** Pre-generated demo project ready

### If Export Fails
- **Fallback:** Show the content in editor
- **Explain:** "Export is working, but let me show you the completed content here"
- Mention Word export is functional, just skipping for time

---

## Key Messages to Emphasize

1. **Multi-document is the differentiator:** Current tools don't do this
2. **Parallel work:** Teams can work simultaneously on different documents
3. **AI intelligence:** Not just text generation - requirements extraction, evidence matching, compliance checking
4. **Production ready:** Matches TenderCreator UI, professional quality
5. **Built to integrate:** Modern stack, clean architecture

---

## Screenshots to Reference

- ui1.png: Team page showing dashboard layout
- ui2.png: New tender page showing 5-step progress design
- Reference these when highlighting UI match with TenderCreator

---

## Practice Notes

- Run through 3+ times before actual demo
- Time each section to hit 8-10 minute target
- Practice talking points while waiting for AI operations
- Test fallback scenarios
- Have demo data ready and validated
