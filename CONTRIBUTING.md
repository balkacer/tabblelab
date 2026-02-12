# 🤝 Contributing to TabbleLab

First of all — thank you for considering contributing to TabbleLab 🧪

TabbleLab is an open-source SQL laboratory built for modern developers.
We welcome contributions of all kinds: code, documentation, design, security reviews, testing and ideas.

## 📌 Code of Conduct

Be respectful.  
Be constructive.  
Be collaborative.

We aim to build a welcoming and inclusive community. Harassment, discrimination or toxic behavior will not be tolerated.

## 🚀 Ways to Contribute

You can contribute in multiple ways:

### 🐛 Report Bugs
- Open a GitHub Issue
- Clearly describe:
  - What happened
  - Expected behavior
  - Steps to reproduce
  - Screenshots (if applicable)

### 💡 Suggest Features
- Check existing issues first
- Clearly explain the problem the feature solves
- Avoid feature bloat — TabbleLab prioritizes clarity and minimalism

### 🧑‍💻 Submit Code

We follow a modular architecture. Before submitting a PR:

1. Open an issue describing the change (unless it’s a small fix)
2. Fork the repository
3. Create a feature branch
4. Write clear commits
5. Submit a Pull Request

## 🏗 Project Structure

```
├── apps/
│   ├── web/        → Frontend (React + TypeScript)
│   └── api/        → Backend (NestJS)
└── packages/
    ├── database-core/  → Driver abstraction layer
    ├── ui/             → Shared UI components
    └── types/          → Shared types
```

## 🧠 Development Setup

### Requirements

- Node.js 20+
- pnpm
- Docker (optional but recommended)

### Install dependencies

```bash
pnpm install
```

### Run backend

```bash
pnpm dev:api
```

### Run frontend

```bash
pnpm dev:web
```

## 🎯 Development Guidelines

### Code Style
- TypeScript everywhere
- Strict typing enabled
- Avoid any
- Keep functions small and readable
- Prefer composition over inheritance

### UI Principles

TabbleLab is:
- Minimal
- Modern
- Fast
- Clean

Avoid unnecessary UI complexity.
Every feature must justify its existence.

### Security Principles

Security is a top priority.

When contributing:
- Never log credentials
- Respect query timeouts
- Respect row limits
- Avoid introducing unsafe SQL execution patterns
- Discuss changes affecting query execution before implementing

If you discover a security vulnerability:
Please do **NOT** open a public issue.
Instead, email: security@tabblelab.com

## 🧪 Database Drivers

Drivers must implement the common interface defined in:

```
packages/database-core
```

Each driver must:
- Handle connection lifecycle
- Support timeout
- Support cancellation (if possible)
- Normalize query results

We encourage community-driven drivers.

## 🧾 Commit Convention

Use clear and descriptive commits.

Recommended format:
```
feat: add MySQL driver support
fix: prevent multiple statement execution
refactor: improve query engine abstraction
docs: update README
```

## 🧭 Pull Request Checklist

Before submitting a PR, ensure:
- Code builds without errors
- No TypeScript warnings
- Feature matches project vision
- No sensitive data exposed
- Clear PR description

## 🗺 Roadmap Alignment

TabbleLab follows a structured roadmap.

If your contribution introduces a major change:
Please discuss it first in an issue.

We want to grow intentionally — not chaotically.

## 🧑‍🚀 First-Time Contributors

Look for issues labeled:
- good first issue
- help wanted
- documentation
- security

We’re happy to guide you.

## ❤️ Thank You

Open-source thrives because of people like you.

TabbleLab is not just a tool —
it’s a shared laboratory for developers worldwide.

Let’s build something great together.
