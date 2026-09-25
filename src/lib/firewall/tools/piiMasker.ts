/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Data Loss Prevention (DLP) & PII Redaction Tool
 *
 * Scans and masks sensitive credentials, PII, and financial data before LLM ingestion.
 */

export interface PiiRedactionResult {
  originalText: string;
  sanitizedText: string;
  detectedCount: number;
  detectedTypes: string[];
  findings: Array<{
    type: string;
    originalMatch: string;
    replacement: string;
  }>;
}

export function redactSensitiveData(input: string): PiiRedactionResult {
  if (!input) {
    return {
      originalText: "",
      sanitizedText: "",
      detectedCount: 0,
      detectedTypes: [],
      findings: [],
    };
  }

  let text = input;
  const findings: PiiRedactionResult["findings"] = [];
  const detectedTypesSet = new Set<string>();

  // 1. Credit Card Numbers (Visa, Mastercard, Amex, Discover)
  const ccRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
  text = text.replace(ccRegex, (match) => {
    detectedTypesSet.add("Credit Card");
    const masked = "[REDACTED_CREDIT_CARD]";
    findings.push({ type: "Credit Card", originalMatch: match, replacement: masked });
    return masked;
  });

  // 2. API Keys & Secrets (OpenAI sk-..., Anthropic sk-ant-..., GitHub ghp_..., AWS AKIA...)
  const apiKeyRegex = /\b(?:sk-[a-zA-Z0-9]{24,48}|sk-ant-[a-zA-Z0-9_-]{24,96}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16})\b/g;
  text = text.replace(apiKeyRegex, (match) => {
    detectedTypesSet.add("API Key / Token");
    const masked = "[REDACTED_API_KEY]";
    findings.push({ type: "API Key / Token", originalMatch: match, replacement: masked });
    return masked;
  });

  // 3. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  text = text.replace(emailRegex, (match) => {
    detectedTypesSet.add("Email Address");
    const masked = "[REDACTED_EMAIL]";
    findings.push({ type: "Email Address", originalMatch: match, replacement: masked });
    return masked;
  });

  // 4. Social Security Numbers (SSN: XXX-XX-XXXX) & National IDs
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  text = text.replace(ssnRegex, (match) => {
    detectedTypesSet.add("Social Security Number");
    const masked = "[REDACTED_SSN]";
    findings.push({ type: "Social Security Number", originalMatch: match, replacement: masked });
    return masked;
  });

  // 5. Phone Numbers (US/International standard)
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  text = text.replace(phoneRegex, (match) => {
    // Avoid redacting short date strings or standard numbers
    if (match.length >= 10) {
      detectedTypesSet.add("Phone Number");
      const masked = "[REDACTED_PHONE]";
      findings.push({ type: "Phone Number", originalMatch: match, replacement: masked });
      return masked;
    }
    return match;
  });

  // 6. Private Cryptographic Keys Header
  const pemRegex = /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g;
  text = text.replace(pemRegex, (match) => {
    detectedTypesSet.add("Private Cryptographic Key");
    const masked = "[REDACTED_PRIVATE_KEY]";
    findings.push({ type: "Private Cryptographic Key", originalMatch: match, replacement: masked });
    return masked;
  });

  return {
    originalText: input,
    sanitizedText: text,
    detectedCount: findings.length,
    detectedTypes: Array.from(detectedTypesSet),
    findings,
  };
}
