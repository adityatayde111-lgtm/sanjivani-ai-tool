/**
 * Sanjivani Ai Tool — PromptGuard AI: Agentic Prompt Injection Firewall
 * Master Engine Coordinator
 *
 * Implements the complete Hackathon Architecture:
 * INPUT
 *   ↓
 * CONTENT PARSER
 *   ↓
 * TEXT EXTRACTION
 *   ↓
 * NORMALIZATION
 *   ↓
 * SECURITY DETECTION ENGINE
 *   ↓
 * ATTACK CLASSIFICATION
 *   ↓
 * RISK SCORING
 *   ↓
 * DECISION ENGINE (ALLOW / SANITIZE / BLOCK)
 *   ↓
 * AI AGENT / AUDIT LOG
 */

import {
  SecurityAnalysisResult,
  InputSourceType,
  PipelineStep,
} from "./types";
import { parseIncomingContent } from "./parsers";
import { scanAllAttackRules } from "./detection/ruleDetector";
import { enforceContextSeparation } from "./detection/contextSeparator";
import { evaluateRisk, RiskEvaluationOptions } from "./risk-engine/riskScorer";
import { makeDecision } from "./decision-engine/decisionEngine";
import { addSecurityLog } from "./logs/securityLogger";

export * from "./types";
export * from "./parsers";
export * from "./detection/ruleDetector";
export * from "./detection/encoderDetector";
export * from "./detection/contextSeparator";
export * from "./risk-engine/riskScorer";
export * from "./decision-engine/decisionEngine";
export * from "./logs/securityLogger";
export * from "./analytics/analyticsEngine";
export * from "./simulator/demoScenarios";

export interface FirewallScanOptions extends RiskEvaluationOptions {
  url?: string;
  fileData?: string;
  skipLog?: boolean;
}

export async function processFirewallScan(
  rawContent: string,
  source: InputSourceType = "user_text",
  options?: FirewallScanOptions
): Promise<SecurityAnalysisResult> {
  const startTime = performance.now();
  const pipelineTrace: PipelineStep[] = [];

  // Step 1 & 2: Content Parsing & Text Extraction
  const p1Start = performance.now();
  const parseResult = await parseIncomingContent(rawContent, source, {
    url: options?.url,
    fileData: options?.fileData,
  });
  pipelineTrace.push({
    name: "Content Parser & Text Extraction",
    status: "passed",
    duration_ms: Math.round((performance.now() - p1Start) * 100) / 100,
    description: `Parsed ${source} payload (${parseResult.extractedText.length} chars extracted).`,
  });

  // Step 3: Context Boundary Isolation & Normalization
  const p2Start = performance.now();
  const isolation = enforceContextSeparation(parseResult.extractedText, source);
  pipelineTrace.push({
    name: "Context Separation & Normalization",
    status: isolation.containsDirectiveConfusion ? "flagged" : "passed",
    duration_ms: Math.round((performance.now() - p2Start) * 100) / 100,
    description: isolation.isolationNote,
  });

  // Step 4: Security Detection Engine (Rule + Pattern + Encoded Obfuscation)
  const p3Start = performance.now();
  const ruleScan = scanAllAttackRules(parseResult.extractedText);
  pipelineTrace.push({
    name: "9-Vector Attack Pattern Scanner",
    status: ruleScan.primaryAttack !== "Safe / None" ? "flagged" : "passed",
    duration_ms: Math.round((performance.now() - p3Start) * 100) / 100,
    description: `Analyzed 9 attack categories. Detected vector: ${ruleScan.primaryAttack}.`,
  });

  // Step 5: Risk Scoring Engine
  const p4Start = performance.now();
  const riskEval = evaluateRisk(
    ruleScan.maxScore,
    ruleScan.primaryAttack,
    ruleScan.detectedMatrix,
    ruleScan.explanations,
    options
  );
  pipelineTrace.push({
    name: "Risk Scoring & Confidence Engine",
    status: riskEval.action === "BLOCK" ? "flagged" : "passed",
    duration_ms: Math.round((performance.now() - p4Start) * 100) / 100,
    description: `Calculated Composite Risk: ${riskEval.riskScore}/100 (Confidence: ${Math.round(riskEval.confidence * 100)}%).`,
  });

  // Step 6: Decision Engine (ALLOW / SANITIZE / BLOCK)
  const p5Start = performance.now();
  const decision = makeDecision(riskEval.action, parseResult.extractedText, riskEval.primaryAttack);
  pipelineTrace.push({
    name: "Policy Decision Engine",
    status: decision.action === "BLOCK" ? "flagged" : "passed",
    duration_ms: Math.round((performance.now() - p5Start) * 100) / 100,
    description: decision.decisionSummary,
  });

  const totalDuration = Math.round((performance.now() - startTime) * 100) / 100;
  const analysisId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toLocaleTimeString("en-GB");

  // Step 7: Log to Security Audit Trail
  if (!options?.skipLog) {
    addSecurityLog({
      timestamp,
      source,
      attack_type: riskEval.primaryAttack,
      risk_score: riskEval.riskScore,
      action: decision.action,
      severity: riskEval.severity,
      preview: parseResult.extractedText.slice(0, 120),
      confidence: riskEval.confidence,
    });
  }

  return {
    id: analysisId,
    is_malicious: riskEval.isMalicious,
    attack_type: riskEval.primaryAttack,
    risk_score: riskEval.riskScore,
    action: decision.action,
    confidence: riskEval.confidence,
    reason: riskEval.reason,
    severity: riskEval.severity,
    detected_attacks: ruleScan.detectedMatrix,
    original_content: rawContent,
    extracted_text: parseResult.extractedText,
    sanitized_content: decision.sanitizedContent,
    input_source: source,
    analysis_timestamp: timestamp,
    execution_time_ms: totalDuration,
    pipeline_trace: pipelineTrace,
    metadata: {
      sentToAgent: decision.sentToAgent,
      redactedInstructionsCount: decision.redactedInstructions.length,
      ...parseResult.metadata,
    },
  };
}
