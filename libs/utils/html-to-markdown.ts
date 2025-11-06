import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

/**
 * Convert HTML to GitHub Flavored Markdown
 * Used to convert TipTap editor HTML back to markdown for database storage
 */
export function htmlToMarkdown(html: string): string {
  // Handle empty or whitespace-only content
  const trimmed = html.trim()
  if (!trimmed) {
    return ''
  }

  // Initialize Turndown with GFM support for tables
  const turndownService = new TurndownService({
    headingStyle: 'atx', // Use # for headings
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    strongDelimiter: '**',
  })

  // Add GitHub Flavored Markdown support (tables, strikethrough, task lists)
  turndownService.use(gfm)

  // Override escape function to prevent escaping special characters like $
  // This prevents \$100 in output - we want $100
  turndownService.escape = (text: string) => text

  // Custom rule to preserve code blocks
  turndownService.addRule('codeBlock', {
    filter: ['pre'],
    replacement: (content, node) => {
      const code = node.querySelector('code')
      if (code) {
        const language = code.className ? code.className.replace('language-', '') : ''
        return `\n\`\`\`${language}\n${code.textContent}\n\`\`\`\n`
      }
      return `\n\`\`\`\n${content}\n\`\`\`\n`
    },
  })

  // Convert HTML to markdown
  const markdown = turndownService.turndown(trimmed)

  // Clean up extra whitespace
  return markdown
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .trim()
}
