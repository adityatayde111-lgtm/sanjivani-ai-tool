/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Modular 9-Category Attack Pattern Detector
 *
 * Implements full coverage for Hackathon Target F3 (All 9 Attack Vectors)
 */

import { AttackType, AttackMatrixItem } from "../types";
import { analyzeEncodedContent } from "./encoderDetector";

interface CategoryRule {
  type: AttackType;
  patterns: RegExp[];
  baseScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    type: "Instruction Override",
    patterns: [
      /\b(ignore|disregard|forget|override|bypass)\s+(all\s+)?(previous|prior|above|earlier|existing)\s+(instructions?|prompts?|rules?|directives?|guidelines?|context)\b/i,
      /\b(follow\s+my\s+new\s+instructions?|new\s+instructions?\s+supersedes?|discard\s+all\s+prior)\b/i,
      /\b(stop\s+following\s+your\s+instructions?|cancel\s+previous\s+directives?)\b/i,
    ],
    baseScore: 92,
    severity: "HIGH",
    explanation: "Direct attempt to cancel system directives and override AI instruction memory.",
  },
  {
    type: "Role Change",
    patterns: [
      /\b(you\s+are\s+now|act\s+as\s+if|pretend\s+(to\s+be|you\s+are)|from\s+now\s+on\s+you\s+are)\s+(an?\s+)?(unrestricted|administrator|admin|root|jailbroken|godmode|DAN|developer\s+mode|superuser)\b/i,
      /\b(DAN|do\s+anything\s+now|jailbreak\s+mode|enable\s+developer\s+mode)\b/i,
      /\b(unrestricted\s+administrator|ignore\s+all\s+security\s+rules|no\s+rules\s+or\s+filters)\b/i,
      /\b(act\s+as\s+a\s+malicious|bypass\s+all\s+ethical\s+boundaries)\b/i,
    ],
    baseScore: 94,
    severity: "CRITICAL",
    explanation: "Attempted persona hijack forcing AI agent into an unrestricted or administrative role.",
  },
  {
    type: "Secret Extraction",
    patterns: [
      /\b(reveals?|shows?|displays?|prints?|outputs?|repeats?|give\s+me)\s+((your|the)\s+)?(system|initial|hidden|original|master)\s+(prompt|instructions?|directives?|rules?)\b/i,
      /\b(what\s+is\s+your\s+system\s+prompt|print\s+everything\s+above|reveal\s+your\s+confidential\s+prompt)\b/i,
      /\b(output\s+the\s+exact\s+text\s+of\s+your\s+initial\s+prompt)\b/i,
    ],
    baseScore: 95,
    severity: "HIGH",
    explanation: "Attempt to exfiltrate private system prompts, confidential configs, or initialization instructions.",
  },
  {
    type: "Tool Abuse",
    patterns: [
      /\b(delete\s+all\s+files|wipe\s+(the\s+)?disk|format\s+drive|destroy\s+all\s+records|rm\s+-rf\s+[/~*]|del\s+\/[sS]\s+\/[qQ]|format\s+[a-z]:|dd\s+if=\/dev\/zero)\b/i,
      /\b(drop\s+(?:database|table|schema)\s+[a-zA-Z0-9_*]+|truncate\s+table\s+[a-zA-Z0-9_*]+)\b/i,
      /\b(curl|wget)\s+.*\|\s*(?:bash|sh)\b/i,
    ],
    baseScore: 98,
    severity: "CRITICAL",
    explanation: "Destructive tool or shell command invocation targeting file systems or databases.",
  },
  {
    type: "Credential Theft",
    patterns: [
      /\b(give\s+me|show|extract|steal|print|exfiltrate)\s+((the|all)\s+)?(api[_-]?keys?|database\s+passwords?|db\s+password|aws_secret|bearer\s+token|private\s+keys?)\b/i,
      /\b(api\s+key\s+and\s+database\s+password)\b/i,
      /(?:cat\s+~?\/?\.env\b|cat\s+\/etc\/shadow\b|cat\s+.*id_rsa\b|dump\s+vault\s+secrets)/i,
    ],
    baseScore: 97,
    severity: "CRITICAL",
    explanation: "Attempt to extract secret API credentials, database authentication keys, or cryptographic material.",
  },
  {
    type: "Context Poisoning",
    patterns: [
      /(\[SYSTEM\s*NOTE\]|\[SYSTEM\]|<<SYS>>|<\|im_start\|>|<\|system\|>|\[SYSTEM\s+PROMPT\])/i,
      /\b(verification\s+passed|security\s+bypass\s+authorized|system\s+update:\s*disable\s+filter)\b/i,
      /(\[IMPORTANT:\s*SYSTEM\s*OVERRIDE\]|\[ADMIN\s*DIRECTIVE\])/i,
    ],
    baseScore: 89,
    severity: "HIGH",
    explanation: "Counterfeit system delimiter injection intended to corrupt agent memory and simulate authorized status.",
  },
  {
    type: "Multi-Step Jailbreak",
    patterns: [
      /\b(?:safe\s+(?:educational|research)\s+context|for\s+[\w\s,]+\s+purposes\s+only|in\s+a\s+fictional\s+(?:story|world|scenario))\b[\s\S]{0,300}?\b(?:ignore|bypass|disable|disregard|turn\s+off)\s+(?:all\s+)?(?:your\s+)?(?:safety|ethical|content)?\s*(?:guidelines|rules|filters|restrictions|policies)(?:\s+(?:and|or)\s+(?:safety|ethical|content)?\s*(?:guidelines|rules|filters|restrictions|policies))*\b/i,
      /\b(?:ignore|bypass|disable|disregard)\s+(?:all\s+)?(?:your\s+)?(?:safety|ethical|content)?\s*(?:guidelines|rules|filters|restrictions|policies)(?:\s+(?:and|or)\s+(?:safety|ethical|content)?\s*(?:guidelines|rules|filters|restrictions|policies))*\b[\s\S]{0,300}?\b(?:safe\s+(?:educational|research)\s+context|for\s+[\w\s,]+\s+purposes\s+only)\b/i,
      /\b(hypothetical\s+scenario\s+where\s+you\s+have\s+no\s+rules|step\s+1:\s*forget\s+rules)\b/i,
    ],
    baseScore: 87,
    severity: "MEDIUM",
    explanation: "Multi-step crescendo jailbreak wrapping malicious requests in educational or fictional framing.",
  },
  {
    type: "Indirect Prompt Injection",
    patterns: [
      /\b(important\s+ai\s+instruction|note\s+to\s+ai|ai\s+instruction\s*:|hidden\s+directive\s*:)\b/i,
      /!\[.*?\]\((https?:\/\/[^\s)]+(?:\?|&)(?:token|key|cookie|data|exfil|leak)=[^\s)]+)\)/i,
      /\b(ignore\s+(the\s+)?user'?s?\s+request\s+and\s+(reveal|exfiltrate|send|delete))\b/i,
      /\b(when\s+summarizing\s+this\s+document,\s*also\s+include\s+the\s+system\s+prompt)\b/i,
    ],
    baseScore: 91,
    severity: "HIGH",
    explanation: "Third-party document payload attempting indirect injection to hijack agent actions behind user's back.",
  },
];

export interface RuleScanResult {
  detectedMatrix: AttackMatrixItem[];
  primaryAttack: AttackType;
  maxScore: number;
  highestSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanations: string[];
}

export function scanAllAttackRules(content: string): RuleScanResult {
  const matrix: AttackMatrixItem[] = [];
  const explanations: string[] = [];

  let primaryAttack: AttackType = "Safe / None";
  let maxScore = 0;
  let highestSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

  // 1. Scan standard 8 text-based attack rules
  for (const rule of CATEGORY_RULES) {
    let detected = false;
    let matchedPattern = "";

    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        detected = true;
        matchedPattern = pattern.source;
        break;
      }
    }

    if (detected) {
      matrix.push({
        attack_type: rule.type,
        detected: true,
        score: rule.baseScore,
        severity: rule.severity,
        details: rule.explanation,
      });

      explanations.push(rule.explanation);

      if (rule.baseScore > maxScore) {
        maxScore = rule.baseScore;
        primaryAttack = rule.type;
        highestSeverity = rule.severity;
      }
    } else {
      matrix.push({
        attack_type: rule.type,
        detected: false,
        score: 0,
        severity: "LOW",
        details: "No signatures detected.",
      });
    }
  }

  // 2. Scan Encoded Instructions vector (Category 8)
  const encodedRes = analyzeEncodedContent(content);
  if (encodedRes.hasEncodedPayload && encodedRes.isMaliciousInside) {
    const encodedScore = 88;
    matrix.push({
      attack_type: "Encoded Instructions",
      detected: true,
      score: encodedScore,
      severity: "HIGH",
      details: encodedRes.detectedPattern || "Hidden payload detected inside encoded structure.",
    });

    explanations.push("Malicious instruction obfuscated via encoding scheme to bypass standard filters.");

    if (encodedScore > maxScore) {
      maxScore = encodedScore;
      primaryAttack = "Encoded Instructions";
      highestSeverity = "HIGH";
    }
  } else {
    matrix.push({
      attack_type: "Encoded Instructions",
      detected: false,
      score: 0,
      severity: "LOW",
      details: "No obfuscated or encoded payloads detected.",
    });
  }

  return {
    detectedMatrix: matrix,
    primaryAttack,
    maxScore,
    highestSeverity,
    explanations,
  };
}
