/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Security Analytics & Telemetry Engine
 */

import { FirewallAnalytics, AttackType, InputSourceType } from "../types";
import { getSecurityLogs } from "../logs/securityLogger";

export function computeFirewallAnalytics(): FirewallAnalytics {
  const logs = getSecurityLogs(200);

  const total_scans = logs.length;
  let safe_inputs = 0;
  let suspicious_inputs = 0;
  let blocked_inputs = 0;
  let scoreSum = 0;

  const attack_distribution: Record<AttackType, number> = {
    "Instruction Override": 0,
    "Role Change": 0,
    "Secret Extraction": 0,
    "Tool Abuse": 0,
    "Credential Theft": 0,
    "Context Poisoning": 0,
    "Multi-Step Jailbreak": 0,
    "Encoded Instructions": 0,
    "Indirect Prompt Injection": 0,
    "Safe / None": 0,
  };

  const source_distribution: Record<InputSourceType, number> = {
    user_text: 0,
    pdf: 0,
    web_url: 0,
    image_ocr: 0,
    json_api: 0,
    email: 0,
    markdown: 0,
    code: 0,
  };

  for (const log of logs) {
    scoreSum += log.risk_score;

    if (log.action === "ALLOW") safe_inputs++;
    else if (log.action === "SANITIZE") suspicious_inputs++;
    else if (log.action === "BLOCK") blocked_inputs++;

    if (log.attack_type in attack_distribution) {
      attack_distribution[log.attack_type]++;
    }

    if (log.source in source_distribution) {
      source_distribution[log.source]++;
    }
  }

  const average_risk_score = total_scans > 0 ? Math.round(scoreSum / total_scans) : 0;

  // Find most common attack type (excluding Safe / None)
  let most_common_attack: AttackType = "Instruction Override";
  let maxCount = -1;

  for (const [attack, count] of Object.entries(attack_distribution)) {
    if (attack !== "Safe / None" && count > maxCount) {
      maxCount = count;
      most_common_attack = attack as AttackType;
    }
  }

  return {
    total_scans,
    safe_inputs,
    suspicious_inputs,
    blocked_inputs,
    average_risk_score,
    most_common_attack,
    attack_distribution,
    source_distribution,
  };
}
