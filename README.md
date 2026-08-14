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
  memory/              Memory/knowledge contracts
  projects/            Project/workspace contracts
  security/            Security primitives/contracts
  shared/              Shared types and utilities
services/
  orchestrator/        Planning + runtime + LLM execution
  sandbox/             Command guard + sandbox job runtime
  workflow/            Automation engine boundary
  deployment/          Deployment engine boundary
infrastructure/
  docker/              Container infrastructure
  database/            Database infrastructure
```

## Security principles

1. Never commit `OPENAI_API_KEY` or any secret.
2. Tools require explicit permissions.
3. High-risk operations remain approval-gated.
4. Model providers are adapters; business logic does not depend on one provider.
5. Long-running tasks are observable and resumable.
6. External side effects stay behind explicit tool/service boundaries.
7. The local sandbox adapter is a development adapter, not a claim of production-grade isolation; production execution must use a hardened container/VM backend behind the same `SandboxAdapter` interface.

## Roadmap

Phase 1: Core foundation — complete
Phase 2: Multi-agent orchestration — complete
Phase 3: LLM runtime — complete
Phase 4: Universal builder — complete
Phase 5: IDE and sandbox — complete
Phase 6: Memory/RAG/knowledge
Phase 7: Cloud/deployment/data
Phase 8: Automation/MCP/integrations
Phase 9: Security/enterprise/billing
Phase 10: Trading platform
Phase 11: AI media/research
Phase 12: Marketplace/SDK/plugins
Phase 13: Integration, hardening, and production release
