# 🔐 Security Policy

Security is a top priority for TabbleLab.

Because TabbleLab executes database queries and manages connection configurations,
we take vulnerabilities extremely seriously.

## 🛡 Supported Versions

We currently provide security updates for:

| Version | Supported |
|----------|------------|
| v0.x     | ✅ Yes     |
| < v0.x   | ❌ No      |

Only the latest minor version is actively maintained.

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT open a public GitHub issue**.

Instead, report it responsibly by emailing:

security@tabblelab.com  
(or open a private security advisory via GitHub)

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

You will receive a response within **72 hours**.

## 🔒 Security Principles

TabbleLab follows these core principles:

### 1️⃣ Secure by Default
- Query timeout enabled
- Row limits enabled
- No multi-statement execution by default
- Optional Safe Mode (blocks destructive statements)

### 2️⃣ No Plain-Text Credential Storage
Database credentials must:
- Be encrypted at rest
- Never be logged
- Never be exposed to the frontend

### 3️⃣ Controlled Query Execution
- Queries must respect execution time limits
- Queries must respect row limits
- Cancellation must be supported when possible
- Destructive statements may be restricted in Safe Mode

### 4️⃣ Minimal Attack Surface
- No unnecessary exposed endpoints
- Input validation on all API routes
- Strong typing (TypeScript strict mode)
- Dependency updates monitored

### 5️⃣ Self-Hosted Model

TabbleLab is designed to be self-hosted.

Users are responsible for:
- Securing their infrastructure
- Configuring network access to databases
- Managing environment variables securely

TabbleLab does not operate a hosted service by default.

## 🧪 Security Review Process

When a vulnerability is reported:

1. The issue is acknowledged within 72 hours
2. A patch is developed privately
3. A new release is prepared
4. A public advisory is published

We aim to fix critical vulnerabilities within 7 days whenever possible.

## 🔍 Scope

Security concerns include (but are not limited to):

- Remote code execution
- SQL injection vulnerabilities
- Credential leaks
- Privilege escalation
- Unsafe query execution
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Dependency vulnerabilities

## 🧰 Dependency Management

TabbleLab uses automated dependency scanning.

Contributors must:
- Avoid introducing vulnerable packages
- Prefer well-maintained libraries
- Justify large or security-sensitive dependencies

## 🤝 Responsible Disclosure

We believe in responsible disclosure.

We ask researchers to:
- Give us reasonable time to fix issues
- Avoid public disclosure before a patch is available
- Act in good faith

We appreciate security researchers and will publicly credit contributors who responsibly disclose vulnerabilities (unless anonymity is requested).

## ❤️ Thank You

Security is a shared responsibility.

If you help us keep TabbleLab secure,
you are helping protect developers and their data.

Thank you for contributing to a safer open-source ecosystem.
