/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Text Normalization & Sanitization Parser
 */

export function normalizeInputText(input: string): string {
  if (!input) return "";

  let text = input;

  // 1. Normalize Unicode to NFKC representation to defeat homoglyph & composite obfuscation
  try {
    text = text.normalize("NFKC");
  } catch {
    // Fallback if normalization fails
  }

  // 2. Strip invisible zero-width characters (often used to break keyword detection)
  // \u200B (zero-width space), \u200C (zwnj), \u200D (zwj), \uFEFF (bom), \u200E/\u200F (bidi marks)
  text = text.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  // 3. Normalize multiple whitespace while preserving paragraph structure
  text = text.replace(/[ \t]+/g, " ");

  return text.trim();
}
