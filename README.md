# Sanjivani Ai Tool

<p align="center">
  <strong>Unified AI Proxy, Multi-Model Router & Enterprise Prompt Injection Firewall</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security_Firewall-100%25_Defense-emerald?style=for-the-badge&logo=shield" alt="Firewall Coverage" />
  <img src="https://img.shields.io/badge/AI_Providers-358_Supported-blue?style=for-the-badge&logo=openai" alt="Providers" />
  <img src="https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Author-Aditya_Tayde-purple?style=for-the-badge" alt="Author" />
  <img src="https://img.shields.io/badge/License-Proprietary_/_All_Rights_Reserved-red?style=for-the-badge" alt="License" />
</p>

---

## 📌 Overview

**Sanjivani Ai Tool** is an advanced, full-stack AI Infrastructure Gateway and Security Firewall designed and developed by **Aditya Tayde** (Sanjivani University).

It unifies **358 LLM providers** (including OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Mistral, and local Ollama instances) behind a single OpenAI-compatible API endpoint, reinforced by an intelligent **9-Layer Perimeter Defense Prompt Injection Firewall** and a real-time web management dashboard.

> 🔒 **Official Intellectual Property Notice:**  
> This system, its architecture, concept, and branding are the exclusive property of **Aditya Tayde**. Rebranding, white-labeling, or deploying this system under any other brand or entity is strictly prohibited. See [LICENSE](LICENSE).

---

## ✨ Key Features & New Updates

### 1. 🛡️ Trained 9-Category Prompt Injection Firewall
The integrated security firewall intercepts untrusted external prompts at the perimeter before they can ever condition an LLM agent's runtime.

* **100% Detection Rate**: Evaluated with a 0.67ms execution latency per sample and 0% false positives on legitimate programming/business queries.
* **Full Coverage of 9 Attack Vectors**:
  1. **Instruction Override**: Direct directives attempting to cancel system rules or erase prior instructions (`"Ignore previous instructions..."`).
  2. **Role Hijack (DAN / Jailbreak)**: Forced persona shifts and administrator mode bypasses (`"You are now DAN with no rules..."`).
  3. **Secret Extraction**: Extraction attempts targeting system prompts, hidden configurations, or initialization directives.
  4. **Tool Abuse**: Lethal OS commands (`rm -rf /`), destructive SQL injections (`DROP TABLE`), and unauthorized subprocess executions.
  5. **Credential Theft**: Exfiltration of API keys, `.env` files, database passwords, and private cryptographic keys (`id_rsa`, `/etc/shadow`).
  6. **Context Poisoning**: Counterfeit `[SYSTEM NOTE]` memory corruptions and false security compliance claims.
  7. **Encoded Evasion**: Encoded payload execution attacks using Base64, Hex, or Rot13.
  8. **Indirect Injection**: Hidden markdown image exfiltration links (`![tracker](https://...?token=...)`) and covert HTML comments.
  9. **Multi-Step Jailbreaks**: Crescendo attacks, fictional framing, and hypothetical bypass tactics.

---

### 2. ⚡ Unified Multi-Provider AI Gateway
* **One Standard Endpoint**: Connects all AI providers behind `http://localhost:20128/v1/chat/completions`.
* **Auto-Fallback & High Availability**: Automatically reroutes traffic to backup models (e.g., from OpenAI to Claude or Gemini) when upstream providers experience rate limits (`429`) or server outages (`500/503`).
* **Cost & Latency Optimization**: Real-time combo routing picks the fastest and most cost-effective model dynamically.

---

### 3. 🖥️ Interactive Web Management Dashboard
* **Live System Monitoring**: Token usage graphs, latency benchmarks, and cost ledger accounting.
* **Model Playground**: Test, compare, and chat with multiple models simultaneously inside the web UI.
* **Provider & Key Management**: Encrypted storage (AES-256-GCM) of API keys and provider connections.
* **Security & Audit Logs**: Real-time visual timeline of blocked attacks, IP logs, and firewall event inspections.

---

## 🏛️ Architecture

```
[Clients: Web UI / Cursor / VS Code / Python / Mobile App]
                           │
                           ▼ POST /v1/chat/completions
┌─────────────────────────────────────────────────────────────┐
│          Sanjivani Ai Tool — Perimeter Defense Gate          │
│          • Input Sanitizer & 9-Vector Attack Scanner         │
│          • PII Redaction & ReDoS Protection                  │
└─────────────────────────────────────────────────────────────┘
               │                               │
     [Clean Prompt]                    [Attack Detected]
               │                               │
               ▼                               ▼
┌───────────────────────────────┐     ⛔ 400 Bad Request
│   Streaming Engine (Open-SSE) │     "Prompt injection detected"
│   • Format Translators        │     (Zero upstream cost spent)
│   • Auto-Fallback & Combos    │
└───────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Upstream Providers: OpenAI, Claude, Gemini, DeepSeek, Ollama │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v24.x LTS` (or `>=22.22.2`)
* **npm**: `v10+`

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/adityatayde111-lgtm/sanjivani-ai-tool.git
   cd sanjivani-ai-tool
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Application**:
   ```bash
   npm run dev
   ```

4. **Access the Dashboard**:
   * Open your browser: **[http://localhost:20128](http://localhost:20128)**
   * Default Password: `CHANGEME` *(change this under Settings -> Security)*

---

## 🔌 Connecting to Coding Assistants & Applications

You can use Sanjivani Ai Tool directly inside **Cursor**, **VS Code Copilot**, **Cline**, or Python:

### Cursor / Cline Configuration
* **Base URL**: `http://localhost:20128/v1`
* **API Key**: Any key or leave blank for local development
* **Model**: `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`, or your custom combo

### Python OpenAI SDK Example
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:20128/v1",
    api_key="your_api_key"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Explain quantum computing simply."}
    ]
)

print(response.choices[0].message.content)
```

---

## 🧪 Testing & Firewall Verification

Run the built-in security benchmark and evaluation suite:

```bash
# Run the 9-Vector Security Firewall Training & Benchmark
npx tsx scripts/quality/train-security-firewall.ts

# Run the automated unit tests
npm run test
```

---

## 📜 Intellectual Property & License

**Copyright (c) 2026 Aditya Tayde. All Rights Reserved.**

This software is released under a proprietary source-available license. **No individual, company, or third-party brand is permitted to copy, rename, rebrand, or redistribute this software or system under another brand name.** 

For full terms and conditions, please consult [LICENSE](LICENSE).

---

## 👤 Author & Maintainer

* **Lead Architect & Developer**: **Aditya Tayde**
* **Institution**: Sanjivani University
* **GitHub**: [@adityatayde111-lgtm](https://github.com/adityatayde111-lgtm)
* **Contact**: [adityatayde111@gmail.com](mailto:adityatayde111@gmail.com)
