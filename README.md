# AI Operating System Platform

A modular AI operating system for building, running, automating, and operating digital products.

## Phase 1 — Core Foundation
- Modular monorepo architecture
- AI orchestration domain model
- Agent registry and capabilities
- Provider/model abstraction
- Tool abstraction with permissions
- Project/workspace model
- Memory and knowledge interfaces
- Security boundaries and configuration conventions

## Phase 2 — Multi-Agent Runtime
- Task lifecycle and resumability
- Dependency-aware execution
- Event bus
- Approval gates
- Retry handling
- Task manager
- Specialized agent registry

## Phase 3 — LLM Runtime
- Provider-neutral LLM contracts
- Multi-model router
- OpenAI provider adapter
- Secure `OPENAI_API_KEY` environment handling
- Tool schemas and permission-aware execution
- Multi-round tool-calling agent loop
- LLM/agent events for observability
- Orchestrator bootstrap for LLM-backed steps

## Phase 4 — Universal Builder
- Natural-language product planner
- Automatic product-type detection
- Web / API / SaaS / mobile / desktop / game / ecommerce / CRM / ERP / bot classifications
- Provider-neutral architecture specification
- Build-stage model
- Generated file manifest
- Required service and environment contracts
- Build validation for duplicate files, missing entrypoints, tests, and security artifacts
- Clean boundary between planning and later side-effectful code generation/execution

## Phase 5 — IDE and Sandbox
- Workspace filesystem abstraction
- Path traversal protection
- Persistent workspace sessions
- Editor documents with versions and dirty state
- Terminal sessions
- Preview target lifecycle
- Permission-aware workspace tools for agents
- Sandbox command allowlist
- Shell chaining, substitution, and redirection blocked by default
- Timeout-aware local execution adapter
- Queueable sandbox jobs and execution results
- Provider-neutral `SandboxAdapter` boundary for future containerized isolation

## Phase 6 — Cloud, Deployment and Databases
- Cloud provider abstraction
- Resource provisioning contracts
- Deployment lifecycle and rollback contracts
- Release manager
- PostgreSQL / MySQL / MongoDB / Redis adapters
- Database provisioning, health and migration contracts
- Local development infrastructure adapters

## Phase 7 — Automation, Integrations and MCP
- Workflow definitions and dependency-aware execution
- Manual, webhook, schedule and event triggers
- HTTP, agent, transform, delay, condition and integration steps
- Workflow run lifecycle
- Pluggable integration registry
- REST/webhook/OAuth/custom integration contracts
- MCP server registry
- MCP tool/resource contracts
- Workflow service runtime

## Phase 8 — Security, Enterprise and Billing
- RBAC roles and permissions
- Secrets metadata and encrypted-at-rest requirement
- Audit log core
- Organizations, workspaces and memberships
- SSO contracts for SAML/OIDC
- Enterprise authorization boundary
- Plans and subscriptions
- Usage metering
- Invoices and payment-provider boundary

## Architecture

```text
apps/
  web/                 Future platform UI
  api/                 Future public API
packages/
  ai-core/             Core domain contracts
  agents/              Agent definitions + LLM agent runner
  model-router/        Provider-neutral router + OpenAI adapter
  tools/               Tool contracts + permission checks + workspace tools
  universal-builder/   Natural-language product planning + build manifests
  workspace-engine/    Project filesystem + workspace sessions
  ide-core/            Editor/terminal/preview workspace protocol
  cloud/               Cloud provider resource abstraction
  deployment/          Deployment/release contracts
  database/            Database provider/migration abstractions
  automation/          Workflow engine
  integrations/        External integration registry
  mcp/                 MCP server/tool/resource registry
  security/            RBAC, secrets and audit primitives
  enterprise/          Organizations, workspaces, memberships and SSO
  billing/             Plans, subscriptions, usage and invoicing
  memory/              Memory/knowledge contracts
  projects/            Project/workspace contracts
services/
  orchestrator/        Planning + runtime + LLM execution
  sandbox/             Command guard + sandbox job runtime
  workflow/            Automation/integration runtime
  deployment/          Deployment engine boundary
infrastructure/
  docker/              Container infrastructure
  database/            Container/database infrastructure
```

## Security principles
1. Never commit `OPENAI_API_KEY` or any secret.
2. Tools require explicit permissions.
3. High-risk operations remain approval-gated.
4. Model providers are adapters; business logic does not depend on one provider.
5. Long-running tasks are observable and resumable.
6. External side effects stay behind explicit tool/service boundaries.
7. The local sandbox adapter is a development adapter, not a claim of production-grade isolation; production execution must use a hardened container/VM backend behind the same `SandboxAdapter` interface.
8. Billing and identity providers remain adapter boundaries; credentials are never stored in source control.

## Roadmap
Phase 1: Core foundation — complete
Phase 2: Multi-agent orchestration — complete
Phase 3: LLM runtime — complete
Phase 4: Universal builder — complete
Phase 5: IDE and sandbox — complete
Phase 6: Cloud/deployment/data — complete
Phase 7: Automation/MCP/integrations — complete
Phase 8: Security/enterprise/billing — complete
Phase 9: Trading platform
Phase 10: AI media/research
Phase 11: Marketplace/SDK/plugins
Phase 12: Integration, hardening, and production release
