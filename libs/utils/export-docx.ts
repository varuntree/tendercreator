import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
} from 'docx'
import { saveAs } from 'file-saver'

export interface DocumentMetadata {
  title: string
  author?: string
  date?: Date
}

/**
 * Convert markdown to Word document
 */
export async function convertMarkdownToDocx(
  markdown: string,
  metadata: DocumentMetadata
): Promise<Blob> {
  const lines = markdown.split('\n')
  const paragraphs: Paragraph[] = []

  let currentListItems: string[] = []
  let isNumberedList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) {
      if (currentListItems.length > 0) {
        // Flush list
        paragraphs.push(...flushList(currentListItems, isNumberedList))
        currentListItems = []
      }
      paragraphs.push(new Paragraph({ text: '' }))
      continue
    }

    // Heading 1
    if (trimmedLine.startsWith('# ')) {
      if (currentListItems.length > 0) {
        paragraphs.push(...flushList(currentListItems, isNumberedList))
        currentListItems = []
      }
      paragraphs.push(
        new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
        })
      )
      continue
    }

    // Heading 2
    if (trimmedLine.startsWith('## ')) {
      if (currentListItems.length > 0) {
        paragraphs.push(...flushList(currentListItems, isNumberedList))
        currentListItems = []
      }
      paragraphs.push(
        new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
        })
      )
      continue
    }

    // Heading 3
    if (trimmedLine.startsWith('### ')) {
      if (currentListItems.length > 0) {
        paragraphs.push(...flushList(currentListItems, isNumberedList))
        currentListItems = []
      }
      paragraphs.push(
        new Paragraph({
          text: trimmedLine.substring(4),
          heading: HeadingLevel.HEADING_3,
        })
      )
      continue
    }

    // Bullet list
    if (trimmedLine.startsWith('- ')) {
      currentListItems.push(trimmedLine.substring(2))
      isNumberedList = false
      continue
    }

    // Numbered list
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      currentListItems.push(numberedMatch[1])
      isNumberedList = true
      continue
    }

    // Flush list if we hit a non-list item
    if (currentListItems.length > 0) {
      paragraphs.push(...flushList(currentListItems, isNumberedList))
      currentListItems = []
    }

    // Regular paragraph with inline formatting
    const textRuns = parseInlineFormatting(trimmedLine)
    paragraphs.push(new Paragraph({ children: textRuns }))
  }

  // Flush remaining list items
  if (currentListItems.length > 0) {
    paragraphs.push(...flushList(currentListItems, isNumberedList))
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  return blob
}

/**
 * Parse inline formatting (bold, italic)
 */
function parseInlineFormatting(text: string): TextRun[] {
  const textRuns: TextRun[] = []
  let currentText = ''
  let i = 0

  while (i < text.length) {
    // Bold (**text**)
    if (text[i] === '*' && text[i + 1] === '*') {
      // Save current text
      if (currentText) {
        textRuns.push(new TextRun({ text: currentText }))
        currentText = ''
      }

      // Find closing **
      let j = i + 2
      let boldText = ''
      while (j < text.length - 1) {
        if (text[j] === '*' && text[j + 1] === '*') {
          break
        }
        boldText += text[j]
        j++
      }

      if (j < text.length - 1 && text[j] === '*' && text[j + 1] === '*') {
        textRuns.push(new TextRun({ text: boldText, bold: true }))
        i = j + 2
        continue
      } else {
        // No closing **, treat as literal
        currentText += '**'
        i += 2
        continue
      }
    }

    // Italic (*text*)
    if (text[i] === '*' && text[i + 1] !== '*') {
      // Save current text
      if (currentText) {
        textRuns.push(new TextRun({ text: currentText }))
        currentText = ''
      }

      // Find closing *
      let j = i + 1
      let italicText = ''
      while (j < text.length) {
        if (text[j] === '*') {
          break
        }
        italicText += text[j]
        j++
      }

      if (j < text.length && text[j] === '*') {
        textRuns.push(new TextRun({ text: italicText, italics: true }))
        i = j + 1
        continue
      } else {
        // No closing *, treat as literal
        currentText += '*'
        i += 1
        continue
      }
    }

    currentText += text[i]
    i++
  }

  // Add remaining text
  if (currentText) {
    textRuns.push(new TextRun({ text: currentText }))
  }

  return textRuns.length > 0 ? textRuns : [new TextRun({ text: '' })]
}

/**
 * Flush list items as paragraphs
 */
function flushList(items: string[], isNumbered: boolean): Paragraph[] {
  return items.map((item, index) => {
    const textRuns = parseInlineFormatting(item)
    return new Paragraph({
      children: textRuns,
      bullet: isNumbered ? undefined : { level: 0 },
      numbering: isNumbered
        ? {
            reference: 'default-numbering',
            level: 0,
          }
        : undefined,
    })
  })
}

/**
 * Download docx file
 */
export function downloadDocx(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}
