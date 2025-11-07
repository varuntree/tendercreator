import { genAI } from "./client";
import { parseGeminiError, waitForRateLimit } from "./error-parser";
import { countTokens } from "./token-counter";
import type { GenerateContentResult } from "@google/generative-ai";

export interface GeminiRequestOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxRetries?: number;
  requestType?: string; // For logging/debugging
  model?: string; // Override default model
}

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryDelaySeconds?: number;
  isRateLimitError?: boolean;
}

const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_MODEL = "gemini-2.0-flash-exp";
const TOKEN_LIMIT = 64000; // 64K token limit for Gemini 2.0 Flash

/**
 * Unified AI service for all Gemini API requests
 * Handles retry logic, rate limiting, error parsing, token validation
 */
export async function executeRequest<T = any>(
  options: GeminiRequestOptions
): Promise<GeminiResponse<T>> {
  const {
    prompt,
    systemInstruction,
    temperature = 0.7,
    maxRetries = DEFAULT_MAX_RETRIES,
    requestType = "unknown",
    model: modelName = DEFAULT_MODEL,
  } = options;

  // Validate token count
  const tokenCount = countTokens(prompt);
  console.log(
    `[GeminiService] ${requestType}: ${tokenCount} tokens in prompt`
  );

  if (tokenCount > TOKEN_LIMIT) {
    return {
      success: false,
      error: `Prompt exceeds ${TOKEN_LIMIT} token limit (${tokenCount} tokens). Please reduce context size.`,
    };
  }

  if (tokenCount > TOKEN_LIMIT * 0.8) {
    console.warn(
      `[GeminiService] Warning: Prompt is ${Math.round((tokenCount / TOKEN_LIMIT) * 100)}% of token limit`
    );
  }

  // Get model with config
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
    },
    systemInstruction,
  });

  let lastError: unknown = null;
  let retryDelay = 1000; // Start with 1s, exponential backoff

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[GeminiService] ${requestType}: Attempt ${attempt + 1}/${maxRetries + 1}`
      );

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(`[GeminiService] ${requestType}: Success`);

      return {
        success: true,
        data: text as T,
      };
    } catch (error) {
      lastError = error;
      const parsedError = parseGeminiError(error);

      console.error(
        `[GeminiService] ${requestType}: Error on attempt ${attempt + 1}:`,
        parsedError.message
      );

      // Handle rate limit errors
      if (parsedError.isRateLimitError) {
        if (attempt < maxRetries) {
          const delaySeconds = parsedError.retryDelaySeconds || 60;
          console.log(
            `[GeminiService] Rate limit detected, waiting ${delaySeconds}s...`
          );
          await waitForRateLimit(delaySeconds);
          continue; // Retry immediately after rate limit wait
        } else {
          return {
            success: false,
            error: `Rate limit exceeded. Please try again in ${parsedError.retryDelaySeconds || 60} seconds.`,
            isRateLimitError: true,
            retryDelaySeconds: parsedError.retryDelaySeconds || 60,
          };
        }
      }

      // For non-rate-limit errors, use exponential backoff
      if (attempt < maxRetries) {
        console.log(
          `[GeminiService] Retrying after ${retryDelay}ms (exponential backoff)...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff: 1s, 2s, 4s, 8s
      }
    }
  }

  // All retries exhausted
  const finalError = parseGeminiError(lastError);
  return {
    success: false,
    error:
      finalError.message ||
      "AI generation failed after multiple retries. Please try again.",
    isRateLimitError: finalError.isRateLimitError,
    retryDelaySeconds: finalError.retryDelaySeconds || undefined,
  };
}

/**
 * Execute request with streaming support
 * Returns async generator that yields chunks as they're generated
 */
export async function* executeStreamingRequest(
  options: GeminiRequestOptions
): AsyncGenerator<string, void, unknown> {
  const {
    prompt,
    systemInstruction,
    temperature = 0.7,
    requestType = "unknown",
    model: modelName = DEFAULT_MODEL,
  } = options;

  // Validate token count
  const tokenCount = countTokens(prompt);
  console.log(
    `[GeminiService] ${requestType} (streaming): ${tokenCount} tokens`
  );

  if (tokenCount > TOKEN_LIMIT) {
    throw new Error(
      `Prompt exceeds ${TOKEN_LIMIT} token limit (${tokenCount} tokens)`
    );
  }

  // Get model with config
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
    },
    systemInstruction,
  });

  console.log(`[GeminiService] ${requestType}: Starting stream...`);

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }

  console.log(`[GeminiService] ${requestType}: Stream complete`);
}

/**
 * Parse JSON response with error handling
 */
export function parseJsonResponse<T>(response: GeminiResponse): T | null {
  if (!response.success || !response.data) {
    return null;
  }

  try {
    // Clean markdown code blocks if present
    let jsonStr = response.data as string;
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    jsonStr = jsonStr.trim();

    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("[GeminiService] JSON parse error:", error);
    return null;
  }
}
