/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Encoded & Obfuscated Payload Security Analyzer
 *
 * Safely decodes payloads inside the analysis layer without executing them.
 */

export interface DecodedAnalysis {
  hasEncodedPayload: boolean;
  encodingType?: "base64" | "hex" | "rot13";
  decodedText?: string;
  isMaliciousInside: boolean;
  detectedPattern?: string;
}

export function analyzeEncodedContent(input: string): DecodedAnalysis {
  if (!input || input.length < 16) {
    return { hasEncodedPayload: false, isMaliciousInside: false };
  }

  // 1. Check for Base64 patterns
  const base64Regex = /\b[A-Za-z0-9+/]{20,}={0,2}\b/g;
  let match: RegExpExecArray | null;

  while ((match = base64Regex.exec(input)) !== null) {
    const candidate = match[0];
    try {
      const decoded = Buffer.from(candidate, "base64").toString("utf-8");
      // Check if decoded contains printable text and malicious keywords
      if (/^[\x20-\x7E\r\n\t]+$/.test(decoded) && decoded.length > 8) {
        if (/ignore\s+(all\s+)?(previous|prior)|system\s+prompt|password|api[_-]?key|rm\s+-rf|administrator/i.test(decoded)) {
          return {
            hasEncodedPayload: true,
            encodingType: "base64",
            decodedText: decoded,
            isMaliciousInside: true,
            detectedPattern: "Malicious payload encoded in Base64",
          };
        }
      }
    } catch {
      // Ignore decode error
    }
  }

  // 2. Check for Hex-encoded sequences (e.g., 49676e6f7265...)
  const hexRegex = /\b(?:[0-9a-fA-F]{2}){10,}\b/g;
  while ((match = hexRegex.exec(input)) !== null) {
    const candidate = match[0];
    try {
      const decoded = Buffer.from(candidate, "hex").toString("utf-8");
      if (/^[\x20-\x7E\r\n\t]+$/.test(decoded) && decoded.length > 8) {
        if (/ignore|system\s+prompt|password|api[_-]?key|drop\s+table/i.test(decoded)) {
          return {
            hasEncodedPayload: true,
            encodingType: "hex",
            decodedText: decoded,
            isMaliciousInside: true,
            detectedPattern: "Malicious payload encoded in Hexadecimal",
          };
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Check for explicit encoding commands or rot13 markers
  if (/\b(base64\s+decode|rot13|hex\s+decode)\b/i.test(input) && /\b(instruction|prompt|command|execute|follow)\b/i.test(input)) {
    return {
      hasEncodedPayload: true,
      encodingType: "rot13",
      isMaliciousInside: true,
      detectedPattern: "Explicit instruction to decode and execute obfuscated directives",
    };
  }

  return { hasEncodedPayload: false, isMaliciousInside: false };
}
