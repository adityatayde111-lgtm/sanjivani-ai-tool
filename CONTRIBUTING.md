# Contributing to Sanjivani Ai Tool

Thank you for your interest in contributing to **Sanjivani Ai Tool**! This project is maintained by **Aditya Tayde** (Sanjivani University).

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: `>=22.22.2 <23` or `>=24.0.0 <27` (recommended: Node 24 LTS)
- **npm**: 10+
- **Git**

### Clone & Install

```bash
git clone https://github.com/adityatayde111-lgtm/sanjivani-ai-tool.git
cd sanjivani-ai-tool
npm install
```

### Starting the Development Server

```bash
npm run dev
```

The web dashboard and API gateway will be live at:
**[http://localhost:20128](http://localhost:20128)** (Default password: `CHANGEME`)

---

## 🧪 Testing and Quality Checks

Before submitting pull requests or committing code, run the standard validation checks:

```bash
# Verify TypeScript types
npm run typecheck:core

# Run unit tests
npm run test

# Run Security Firewall training benchmark (evaluates all 9 attack categories)
npx tsx scripts/quality/train-security-firewall.ts

# Run security firewall unit tests
node --import tsx/esm tests/unit/security-firewall-modules.test.ts
```

---

## 🛡️ Guidelines & Code Style

1. **Brand Identity**:
   - The application name is **Sanjivani Ai Tool**. Maintain this branding across all documentation, UI components, and API responses.
2. **Security & Prompt Injection Firewall**:
   - Never weaken the 9 attack detection categories in `src/shared/utils/inputSanitizer.ts`.
   - All input parsers and scanners must be bounded to prevent ReDoS or infinite loops.
3. **Database Rules**:
   - Always access SQLite through the domain modules in `src/lib/db/`.
   - Never write raw SQL inside route handlers.
4. **Code Quality**:
   - Use 2 spaces for indentation.
   - Run typechecks to ensure zero compilation warnings or errors.

---

## 📬 Reporting Bugs & Submitting Features

- **GitHub Issues**: [https://github.com/adityatayde111-lgtm/sanjivani-ai-tool/issues](https://github.com/adityatayde111-lgtm/sanjivani-ai-tool/issues)
- **Direct Inquiries**: Contact Aditya Tayde at `adityatayde111@gmail.com`

---

## 📜 Legal & License Notice

All contributions submitted to this repository become part of the **Sanjivani Ai Tool** project under its proprietary source-available license. Third-party rebranding or unauthorized redistribution is strictly prohibited under the terms of the project [LICENSE](LICENSE).
