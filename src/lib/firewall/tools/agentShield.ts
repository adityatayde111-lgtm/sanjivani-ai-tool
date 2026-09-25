/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Agent Shield Sandbox Tool (Simulated Protected Agent)
 *
 * Demonstrates real-time agent protection by intercepting incoming messages
 * before they reach the agent execution environment.
 */

import { processFirewallScan } from "../index";
import { SecurityAnalysisResult } from "../types";

export interface AgentChatMessage {
  id: string;
  sender: "user" | "agent" | "firewall";
  text: string;
  timestamp: string;
  firewallVerdict?: "ALLOW" | "SANITIZE" | "BLOCK";
  attackType?: string;
  riskScore?: number;
}

export interface AgentShieldChatResponse {
  firewallResult: SecurityAnalysisResult;
  agentResponse?: string;
  blocked: boolean;
  messageLog: AgentChatMessage[];
}

export async function processAgentShieldChat(
  userMessage: string,
  history: AgentChatMessage[] = []
): Promise<AgentShieldChatResponse> {
  const timestamp = new Date().toLocaleTimeString("en-GB");
  const userMsgId = `msg-${Date.now()}-u`;

  const updatedHistory: AgentChatMessage[] = [
    ...history,
    {
      id: userMsgId,
      sender: "user",
      text: userMessage,
      timestamp,
    },
  ];

  // 1. Intercept at Firewall Perimeter
  const firewallResult = await processFirewallScan(userMessage, "user_text");

  if (firewallResult.action === "BLOCK") {
    // Attack detected: Firewall halts execution. Agent is completely shielded!
    const firewallMsg: AgentChatMessage = {
      id: `msg-${Date.now()}-fw`,
      sender: "firewall",
      text: `⛔ [SECURITY INTERCEPTION] Blocked at perimeter by Sanjivani Firewall.\nThreat Detected: ${firewallResult.attack_type} (Risk: ${firewallResult.risk_score}/100).\nThe AI Agent was shielded and never received this untrusted payload. Zero upstream tokens spent.`,
      timestamp,
      firewallVerdict: "BLOCK",
      attackType: firewallResult.attack_type,
      riskScore: firewallResult.risk_score,
    };

    updatedHistory.push(firewallMsg);

    return {
      firewallResult,
      blocked: true,
      messageLog: updatedHistory,
    };
  }

  // 2. If Clean or Sanitized, Agent safely responds
  let agentReply = "";
  const effectivePrompt = firewallResult.sanitized_content || userMessage;

  if (effectivePrompt.toLowerCase().includes("summarize") || effectivePrompt.toLowerCase().includes("report")) {
    agentReply = "Certainly! Based on the quarterly sales data, regional revenues grew by 18.4% with primary contributions from the enterprise cloud and AI infrastructure segments.";
  } else if (effectivePrompt.toLowerCase().includes("quantum")) {
    agentReply = "Quantum computing uses quantum bits (qubits) that can exist in superposition (0 and 1 simultaneously), allowing it to solve specific complex computational problems exponentially faster than classical computers.";
  } else if (effectivePrompt.toLowerCase().includes("hello") || effectivePrompt.toLowerCase().includes("hi")) {
    agentReply = "Hello! I am the Sanjivani AI Assistant. I operate behind the PromptGuard Security Firewall to ensure all interactions remain safe, private, and verified. How can I assist you today?";
  } else {
    agentReply = `I have received your request: "${effectivePrompt.slice(0, 80)}...". Processing was safely verified and authorized by the Sanjivani Security Gateway.`;
  }

  const agentMsg: AgentChatMessage = {
    id: `msg-${Date.now()}-a`,
    sender: "agent",
    text: agentReply,
    timestamp,
    firewallVerdict: firewallResult.action,
    attackType: firewallResult.attack_type,
    riskScore: firewallResult.risk_score,
  };

  updatedHistory.push(agentMsg);

  return {
    firewallResult,
    agentResponse: agentReply,
    blocked: false,
    messageLog: updatedHistory,
  };
}
