import { z } from "zod";
import {
  processFirewallScan,
  redactSensitiveData,
  runRedTeamFuzzing,
  generateCanaryToken,
  inspectResponseForCanary,
  InputSourceType,
} from "../../src/lib/firewall/index.ts";

export const FirewallScanInputSchema = z.object({
  content: z.string().describe("The untrusted text or document content to analyze"),
  source: z.enum(["user_text", "pdf", "web_url", "image_ocr", "json_api", "email"]).optional().default("user_text"),
  url: z.string().optional().describe("Optional URL if scanning web content"),
});

export const RedactPiiInputSchema = z.object({
  text: z.string().describe("Input text to redact credit cards, API keys, and sensitive PII from"),
});

export const RedTeamFuzzInputSchema = z.object({
  prompt: z.string().describe("Base prompt to evaluate against 8 adversarial attack mutations"),
});

export const CanaryGenerateInputSchema = z.object({
  label: z.string().optional().default("Primary Agent Canary").describe("Label for the canary honeytoken"),
});

export const firewallTools = {
  sanjivani_firewall_scan: {
    name: "sanjivani_firewall_scan",
    description: "Scan untrusted prompt, document, or web text against 9 prompt injection attack categories with risk scoring (0-100) and allow/sanitize/block decision.",
    scopes: ["read:firewall"],
    inputSchema: FirewallScanInputSchema,
    handler: async (args: z.infer<typeof FirewallScanInputSchema>) => {
      const result = await processFirewallScan(args.content, args.source as InputSourceType, {
        url: args.url,
      });

      return {
        id: result.id,
        is_malicious: result.is_malicious,
        attack_type: result.attack_type,
        risk_score: result.risk_score,
        action: result.action,
        confidence: result.confidence,
        reason: result.reason,
        severity: result.severity,
        sanitized_content: result.sanitized_content,
        execution_time_ms: result.execution_time_ms,
        detected_attacks_count: result.detected_attacks.filter((a) => a.detected).length,
      };
    },
  },

  sanjivani_redact_pii: {
    name: "sanjivani_redact_pii",
    description: "Data Loss Prevention (DLP) tool to detect and redact credit card numbers, API keys, passwords, and PII from prompts before sending to an LLM.",
    scopes: ["read:firewall"],
    inputSchema: RedactPiiInputSchema,
    handler: async (args: z.infer<typeof RedactPiiInputSchema>) => {
      const result = redactSensitiveData(args.text);
      return {
        sanitizedText: result.sanitizedText,
        detectedCount: result.detectedCount,
        detectedTypes: result.detectedTypes,
        findingsCount: result.findings.length,
      };
    },
  },

  sanjivani_redteam_fuzz: {
    name: "sanjivani_redteam_fuzz",
    description: "Automated adversarial red-team fuzzer that generates 8 attack mutations against a prompt to test perimeter defense resilience.",
    scopes: ["write:firewall"],
    inputSchema: RedTeamFuzzInputSchema,
    handler: async (args: z.infer<typeof RedTeamFuzzInputSchema>) => {
      const scorecard = await runRedTeamFuzzing(args.prompt);
      return {
        targetPrompt: scorecard.targetPrompt,
        totalMutations: scorecard.totalMutations,
        blockedMutations: scorecard.blockedMutations,
        interceptionRate: `${scorecard.interceptionRate}%`,
        overallGrade: scorecard.overallGrade,
        averageRiskScore: scorecard.averageRiskScore,
        mutationsSummary: scorecard.mutations.map((m) => ({
          name: m.name,
          detectedAttack: m.detectedAttack,
          riskScore: m.riskScore,
          action: m.action,
          blocked: m.blocked,
        })),
      };
    },
  },

  sanjivani_canary_generate: {
    name: "sanjivani_canary_generate",
    description: "Generate cryptographic canary honeytokens to embed into system prompts for detecting prompt exfiltration and leakage.",
    scopes: ["read:firewall"],
    inputSchema: CanaryGenerateInputSchema,
    handler: async (args: z.infer<typeof CanaryGenerateInputSchema>) => {
      const canary = generateCanaryToken(args.label);
      return {
        canaryToken: canary.token,
        label: canary.label,
        systemInstructionSnippet: canary.systemInstructionSnippet,
      };
    },
  },
};
