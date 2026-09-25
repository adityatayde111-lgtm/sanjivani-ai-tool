/**
 * Sanjivani Ai Tool — PromptGuard AI: Agentic Prompt Injection Firewall
 * Core Domain Types & Normalized Schemas
 *
 * Author: Aditya Tayde (Sanjivani University)
 * Target Certifications: D2 (Reliability) & F3 (9 Attack Categories)
 */

export type AttackType =
  | "Instruction Override"
  | "Role Change"
  | "Secret Extraction"
  | "Tool Abuse"
  | "Credential Theft"
  | "Context Poisoning"
  | "Multi-Step Jailbreak"
  | "Encoded Instructions"
  | "Indirect Prompt Injection"
  | "Safe / None";

export type InputSourceType =
  | "user_text"
  | "pdf"
  | "web_url"
  | "image_ocr"
  | "json_api"
  | "email"
  | "markdown"
  | "code";

export type FirewallAction = "ALLOW" | "SANITIZE" | "BLOCK";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AttackMatrixItem {
  attack_type: AttackType;
  detected: boolean;
  score: number;
  severity: SeverityLevel;
  details: string;
}

export interface PipelineStep {
  name: string;
  status: "passed" | "flagged" | "bypassed";
  duration_ms: number;
  description: string;
}

export interface SecurityAnalysisResult {
  id: string;
  is_malicious: boolean;
  attack_type: AttackType;
  risk_score: number; // 0 - 100
  action: FirewallAction; // ALLOW | SANITIZE | BLOCK
  confidence: number; // 0.0 - 1.0
  reason: string;
  severity: SeverityLevel;
  detected_attacks: AttackMatrixItem[];
  original_content: string;
  extracted_text: string;
  sanitized_content?: string;
  input_source: InputSourceType;
  analysis_timestamp: string;
  execution_time_ms: number;
  pipeline_trace: PipelineStep[];
  highlight_spans?: Array<{ start: number; end: number; match: string; category: AttackType }>;
  threat_radar?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  source: InputSourceType;
  attack_type: AttackType;
  risk_score: number;
  action: FirewallAction;
  severity: SeverityLevel;
  preview: string;
  confidence: number;
}

export interface FirewallAnalytics {
  total_scans: number;
  safe_inputs: number;
  suspicious_inputs: number;
  blocked_inputs: number;
  average_risk_score: number;
  most_common_attack: AttackType;
  attack_distribution: Record<AttackType, number>;
  source_distribution: Record<InputSourceType, number>;
}

export interface DemoScenario {
  id: string;
  title: string;
  categoryNumber: number;
  source: InputSourceType;
  input: string;
  expected_attack: AttackType;
  expected_action: FirewallAction;
  description: string;
}
