# AI Operating System Platform

A modular AI Operating System foundation for building, running, automating, and operating digital products.

## Status

**Phases 1–12 implemented at the architecture/core-runtime level.**

The repository contains the platform foundation, multi-agent runtime, LLM integration, Universal Builder, IDE/Sandbox boundaries, Cloud/Deployment/Database abstractions, Automation/Integrations/MCP, Security/Enterprise/Billing, Trading, AI Media/Research, Marketplace/Plugins/SDK, and production release gates.

The current release path validates the repository through install, typecheck, tests, lint, and build. Docker deployment images are also configured for environments where a generated pnpm lockfile is not yet committed.

This is intentionally provider-neutral: real cloud, database, broker, payment, identity, media, and hardened sandbox adapters are configured per deployment environment rather than hard-coded into the core.

## Platform layers

- **AI Core:** agents, orchestration, memory, model routing, tool calling
- **Universal Builder:** natural-language product planning and build manifests
- **Developer Environment:** workspace filesystem, editor protocol, terminal, preview, sandbox boundary
- **Cloud:** resource provisioning, deployments, databases, rollback contracts
- **Automation:** workflows, triggers, integrations, MCP
- **Enterprise:** RBAC, organizations, workspaces, SSO contracts, audit, billing
- **Trading:** broker/provider contracts, risk controls, strategies, backtest models
- **Research & Media:** research reports, source-aware claims, multimodal job contracts
- **Marketplace:** plugins, agents, templates, themes, workflows, integrations, models
- **SDK:** TypeScript API client boundary
- **Production:** CI, release gates, security policy, deployment requirements

## Production completion gates

Before public production launch, the target environment must provide:

1. Real provider credentials through a managed secret store.
2. Hardened container/VM execution behind the SandboxAdapter.
3. Real cloud/database/payment/identity/broker/media adapters as required.
4. Successful CI typecheck, tests, lint, security and smoke checks.
5. Reviewed database migrations and backups.
6. Observability, rate limiting, audit logging and alerting.
7. Verified health checks, rollback and disaster-recovery procedures.

## Security

- Never commit secrets such as `OPENAI_API_KEY`.
- Tools use explicit permissions; high-risk operations require approval.
- External side effects remain behind service/tool boundaries.
- Production execution must not use the local-process sandbox.
- Live trading remains behind explicit broker adapters and risk controls.
- Marketplace packages must declare and pass permission validation.

See `DEPLOYMENT.md` and `SECURITY.md` for the final release requirements.
