import { encodingForModel } from "js-tiktoken";
import type { ProjectContext } from "./context-assembly";

// Gemini 2.0 Flash uses similar tokenization to GPT models
// Using gpt-4 encoding as approximation
const encoding = encodingForModel("gpt-4");

/**
 * Count tokens in text using tiktoken (accurate for Gemini approximation)
 * Falls back to 4-chars-per-token estimation if encoding fails
 */
export function countTokens(text: string): number {
  try {
    const tokens = encoding.encode(text);
    return tokens.length;
  } catch (error) {
    console.warn("Token counting failed, using fallback estimation:", error);
    // Fallback: 4 characters per token (conservative estimate)
    return Math.ceil(text.length / 4);
  }
}

/**
 * Estimate total tokens in project context
 * Note: ProjectContext already has organizationDocs and rftDocs as concatenated strings
 */
export function estimateContextTokens(context: ProjectContext): number {
  const totalText = `${JSON.stringify(context.project)}\n${context.organizationDocs}\n${context.rftDocs}`;
  return countTokens(totalText);
}

/**
 * Clean up encoding resources when done (optional, for memory efficiency)
 * Note: tiktoken handles cleanup automatically, so this is a no-op
 */
export function cleanupTokenCounter() {
  // No-op: tiktoken handles cleanup automatically
}
