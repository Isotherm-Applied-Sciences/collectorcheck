# Security Policy

This document outlines the security practices, reporting procedures, and expectations for contributors and users of CollectorCheck, the open‑source receipt verification gateway maintained by Isotherm Applied Sciences Inc.

CollectorCheck is designed with a minimal, deterministic architecture to ensure transparency, auditability, and reliability. Security is a core priority for all maintainers and contributors.

---

## Supported Versions

The following versions of CollectorCheck receive security updates:

- v1.x — Active support
- v2.x — Planned future support

Pre‑release or experimental branches may not receive security patches.

---

## Security Principles

CollectorCheck follows these guiding principles:

- Local‑first processing  
- No cloud dependency  
- Transparent verification logic  
- Minimal attack surface  
- Deterministic behavior  
- No hidden data collection  
- No external network calls during verification  
- Clear separation of backend and frontend concerns  

These principles reduce risk and make the system easier to audit.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately.

### How to report:
Send an email to the maintainers:

security@isotherm.dev  
(If this address is not yet active, use the GitHub private vulnerability reporting feature.)

### What to include:
- Description of the issue  
- Steps to reproduce  
- Expected vs actual behavior  
- Any relevant logs or screenshots  
- Potential impact  
- Suggested fix (optional)

We will acknowledge receipt within 72 hours.

---

## Private Vulnerability Reporting (GitHub)

CollectorCheck supports GitHub’s **Private Vulnerability Reporting** feature.

You can submit a confidential report directly through the repository’s Security tab.  
This ensures responsible disclosure and protects users while fixes are prepared.

---

## Security Patch Process

When a vulnerability is confirmed:

1. The issue is logged privately.
2. A patch is developed in a protected branch.
3. The fix is tested against regression and security cases.
4. A security release is prepared.
5. Release notes are published.
6. The patch is merged into main.

Critical issues may result in an immediate hotfix release.

---

## Secure Development Guidelines

Contributors must follow these practices:

- Never commit secrets, API keys, or credentials.
- Use environment variables for sensitive configuration.
- Avoid adding external dependencies without discussion.
- Validate all input in backend routes.
- Sanitize file uploads.
- Avoid dynamic code execution.
- Keep
