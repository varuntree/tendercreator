import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

/**
 * Supported document MIME types for text extraction
 *
 * Why these formats:
 * - PDF: Standard tender document format, full text extraction
 * - DOCX: Common Word format, text extraction via mammoth
 * - text/plain: Simple text files, direct buffer read
 *
 * Note: We extract text directly from file buffers, no external API calls.
 * Extracted text stored in DB, later used as context for Gemini AI operations.
 */
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/plain',
] as const

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // Validate supported MIME type
    if (!SUPPORTED_MIME_TYPES.includes(mimeType as any)) {
      throw new Error(
        `Unsupported file format: ${mimeType}. Supported formats: PDF, DOCX, TXT`
      )
    }

    // Extract text based on file type
    let extractedText = ''
    switch (mimeType) {
      case 'text/plain':
        extractedText = fileBuffer.toString('utf-8')
        break

      case 'application/pdf': {
        const parser = new PDFParse({ data: fileBuffer })
        try {
          const result = await parser.getText()
          extractedText = result.text
        } finally {
          await parser.destroy()
        }
        break
      }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const result = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = result.value
        break
      }

      default:
        throw new Error(`Unsupported MIME type: ${mimeType}`)
    }

    // Log successful extraction
    console.log(`[Extraction] ${fileName} (${mimeType}): ${extractedText.length} chars extracted`)
    return extractedText
  } catch (error) {
    console.error('Text extraction error:', error)

    // Re-throw validation errors
    if (error instanceof Error && error.message.includes('Unsupported')) {
      throw error
    }

    // Return empty string for extraction failures (corrupted files, etc.)
    return ''
  }
}
