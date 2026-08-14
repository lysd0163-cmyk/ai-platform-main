# Security Policy

## Rules

- Secrets must only be supplied through environment variables or a managed secret store.
- High-risk tools require explicit permissions and approval.
- Production code execution must use hardened isolation.
- External webhooks and integrations must validate authentication/signatures before processing.
- Billing, identity, and broker actions must be idempotent where possible.
- Audit logs must record security-sensitive actions without storing secret values.
- Production deployments must use least-privilege credentials and encrypted transport.

## Reporting

Do not disclose security vulnerabilities publicly before remediation. Use a private security reporting channel configured by the repository owner.
