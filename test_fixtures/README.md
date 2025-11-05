# Test Fixtures

This directory contains sample RFT documents for testing Phase 2 AI analysis functionality.

## Files

### sample_rft_construction.txt

A realistic NSW Government construction tender document for testing AI analysis.

**Project:** Community Centre Redevelopment
**Type:** Construction tender
**Expected Documents:** 10 submission documents

The RFT includes detailed requirements for each document type:
1. Technical Specification (8 requirements)
2. Bill of Quantities (5 requirements)
3. Project Plan (requirements in Section 3.2)
4. Risk Register (5 risk categories)
5. Work Health & Safety Plan (5 requirement sections)
6. Quality Assurance Plan (4 requirement sections)
7. Environmental Management Plan (5 requirement sections)
8. Subcontractor List (3 requirement sections)
9. Company Profile (5 requirement sections)
10. Insurance Certificates (4 insurance types)

## Usage

Use this fixture for:
- E2E testing of Phase 2 analysis workflow
- Manual testing of AI document identification
- Validating requirement extraction accuracy
- Testing UI components with realistic data

## Testing Instructions

1. Upload `sample_rft_construction.txt` to a test project
2. Trigger "Analyze RFT"
3. Verify 8-10 documents are identified
4. Check each document has 5-8 requirements
5. Validate requirements include source references (sections/pages)
6. Test manual document addition flow

## Expected Results

- Analysis should complete in <15 seconds
- Document types should match Section 2 submission requirements
- Requirements should reference specific sections
- Priority classification (mandatory/optional) should be accurate
- Source references should include section numbers
