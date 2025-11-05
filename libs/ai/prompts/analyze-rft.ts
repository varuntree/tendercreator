/**
 * Build prompt for RFT document analysis
 * Identifies all required submission documents from RFT content
 */
export function buildAnalysisPrompt(
  rftTexts: string[],
  projectName: string,
  instructions?: string
): string {
  const concatenatedTexts = rftTexts
    .map((text, idx) => `--- DOCUMENT ${idx + 1} ---\n${text}`)
    .join('\n\n')

  return `You are analyzing a Request for Tender (RFT) to identify ALL required submission documents.

Project: ${projectName}

RFT Documents:
${concatenatedTexts}

${instructions ? `Additional Instructions:\n${instructions}\n\n` : ''}

Tasks:
1. Identify ALL documents that must be submitted as part of the tender response
2. Extract 5-8 key mandatory requirements for EACH document
3. Classify each requirement as mandatory or optional
4. Provide specific RFT page/section references for each requirement

Output as valid JSON only (no markdown, no explanation):
{
  "documents": [
    {
      "document_type": "Technical Specification",
      "description": "Detailed technical approach and methodology",
      "requirements": [
        {
          "id": "req_1",
          "text": "Must describe cloud architecture approach with multi-region redundancy",
          "priority": "mandatory",
          "source": "Section 3.2, Page 12"
        }
      ]
    }
  ]
}

Focus on 5-8 KEY requirements per document (not exhaustive).
Common document types: Technical Specification, Methodology, Bill of Quantities,
Risk Register, Subcontractor List, Project Plan, Quality Plan, WHS Plan,
Insurance Certificates, Company Profile, Case Studies.

Return only valid JSON. No markdown formatting.`
}
