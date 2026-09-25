/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Risk Scoring Engine
 *
 * Implements:
 * 0–29:   SAFE (ALLOW)
 * 30–69:  SUSPICIOUS / REVIEW (SANITIZE)
 * 70–100: MALICIOUS / BLOCK (BLOCK)
 */

import { AttackType, FirewallAction, SeverityLevel, AttackMatrixItem } from "../types";

export interface RiskEvaluationOptions {
  blockThreshold?: number; // default: 70
  sanitizeThreshold?: number; // default: 30
}

export interface RiskScoreOutput {
  riskScore: number;
  confidence: number;
  action: FirewallAction;
  severity: SeverityLevel;
  primaryAttack: AttackType;
  isMalicious: boolean;
  reason: string;
}

export function evaluateRisk(
  rawMaxScore: number,
  primaryAttack: AttackType,
  matrix: AttackMatrixItem[],
  explanations: string[],
  options?: RiskEvaluationOptions
): RiskScoreOutput {
  const blockThreshold = options?.blockThreshold ?? 70;
  const sanitizeThreshold = options?.sanitizeThreshold ?? 30;

  let riskScore = rawMaxScore;
  let confidence = 0.95;

  // Count how many attack patterns fired (multi-vector attacks increase confidence and risk score)
  const activeAttacks = matrix.filter((item) => item.detected);
  if (activeAttacks.length > 1) {
    riskScore = Math.min(100, riskScore + (activeAttacks.length - 1) * 3);
    confidence = 0.99;
  }

  // Action mapping
  let action: FirewallAction = "ALLOW";
  let severity: SeverityLevel = "LOW";
  let isMalicious = false;

  if (riskScore >= blockThreshold) {
    action = "BLOCK";
    severity = riskScore >= 95 ? "CRITICAL" : "HIGH";
    isMalicious = true;
  } else if (riskScore >= sanitizeThreshold) {
    action = "SANITIZE";
    severity = "MEDIUM";
    isMalicious = false;
  } else {
    action = "ALLOW";
    severity = "LOW";
    isMalicious = false;
    riskScore = Math.min(riskScore, 15);
    confidence = 0.98;
  }

  // Construct explainability reason
  let reason = "The input has been analyzed and classified as safe legitimate content.";
  if (isMalicious) {
    reason = `Blocked due to critical ${primaryAttack} threat (${riskScore}/100). ${explanations.join(" ")}`;
  } else if (action === "SANITIZE") {
    reason = `Marked for sanitization and review due to elevated risk indicators in ${primaryAttack} (${riskScore}/100).`;
  }

  return {
    riskScore,
    confidence,
    action,
    severity,
    primaryAttack: action === "ALLOW" ? "Safe / None" : primaryAttack,
    isMalicious,
    reason,
  };
}
