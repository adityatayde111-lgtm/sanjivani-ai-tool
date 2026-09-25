/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Decision Engine & Content Sanitizer
 *
 * Implements: ALLOW | SANITIZE / REVIEW | BLOCK
 * Preserves legitimate business context while redacting malicious instructions.
 */

import { FirewallAction } from "../types";

export interface DecisionResult {
  action: FirewallAction;
  originalContent: string;
  sanitizedContent?: string;
  redactedInstructions: string[];
  sentToAgent: boolean;
  decisionSummary: string;
}

export function makeDecision(
  action: FirewallAction,
  originalText: string,
  attackType: string
): DecisionResult {
  const redactedInstructions: string[] = [];
  let sanitized = originalText;

  if (action === "SANITIZE" || action === "BLOCK") {
    // List of aggressive patterns to redact from content
    const redactPatterns = [
      /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)\b/gi,
      /\b(you\s+are\s+now|from\s+now\s+on\s+you\s+are)\s+(an?\s+)?(unrestricted|administrator|DAN)\b/gi,
      /\b(reveal|show|give\s+me)\s+(your\s+)?(system\s+prompt|api[_-]?key|database\s+password)\b/gi,
      /\b(important\s+ai\s+instruction\s*:|ai\s+instruction\s*:)\b/gi,
      /\b(delete\s+all\s+files|rm\s+-rf\s+[/~*]|drop\s+table\s+[a-z0-9_*]+)\b/gi,
    ];

    for (const pat of redactPatterns) {
      sanitized = sanitized.replace(pat, (match) => {
        redactedInstructions.push(match);
        return "[Malicious instruction removed by Sanjivani Firewall]";
      });
    }
  }

  const sentToAgent = action === "ALLOW" || action === "SANITIZE";
  let decisionSummary = "";

  if (action === "ALLOW") {
    decisionSummary = "Content verified safe. Dispatched directly to AI Agent.";
  } else if (action === "SANITIZE") {
    decisionSummary = `Suspicious elements isolated. Sanitized payload dispatched to AI Agent with ${redactedInstructions.length} instruction(s) removed.`;
  } else {
    decisionSummary = `Critical threat (${attackType}) detected. Blocked at perimeter; zero upstream agent tokens spent.`;
  }

  return {
    action,
    originalContent: originalText,
    sanitizedContent: action === "SANITIZE" ? sanitized : undefined,
    redactedInstructions,
    sentToAgent,
    decisionSummary,
  };
}
