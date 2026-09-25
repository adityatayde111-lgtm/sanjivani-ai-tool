import React from "react";
import type { Metadata } from "next";
import FirewallDashboardClient from "./FirewallDashboardClient";

export const metadata: Metadata = {
  title: "PromptGuard AI — Agentic Prompt Injection Firewall | Sanjivani Ai Tool",
  description: "Enterprise Prompt Injection Firewall protecting AI agents from direct and indirect prompt injection attacks.",
};

export default function FirewallPage() {
  return <FirewallDashboardClient />;
}
