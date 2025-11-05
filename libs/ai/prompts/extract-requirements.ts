/**
 * Build prompt for extracting requirements for a specific document type
 * Used when user manually adds a document and needs AI assistance
 */
export function buildExtractionPrompt(
  rftTexts: string[],
  documentType: string
): string {
  const concatenatedTexts = rftTexts
    .map((text, idx) => `--- DOCUMENT ${idx + 1} ---\n${text}`)
    .join('\n\n')

  return `You are extracting requirements from an RFT for a specific document type.

Document Type: ${documentType}

RFT Documents:
${concatenatedTexts}

Task: Find 5-8 key requirements in the RFT that relate to "${documentType}".

Output as valid JSON only:
{
  "requirements": [
    {
      "id": "req_1",
      "text": "Requirement text",
      "priority": "mandatory",
      "source": "Section X, Page Y"
    }
  ]
}

If no relevant requirements found, return: {"requirements": []}

Return only valid JSON. No markdown formatting.`
}
