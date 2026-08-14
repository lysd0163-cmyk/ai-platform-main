# AI Operating System Platform

A modular AI operating system for building, running, automating, and operating digital products.

## Phases 1-8

The foundation, multi-agent runtime, LLM runtime, Universal Builder, IDE/Sandbox, Cloud/Deployment/Databases, Automation/Integrations/MCP, and Security/Enterprise/Billing layers are implemented as modular contracts and development runtimes.

## Phase 9 — Trading Platform
- Provider-neutral MT4 / MT5 / TradingView / generic broker contracts
- OHLCV and order domain models
- Risk engine with per-trade, daily-loss, and open-position controls
- Backtest result model and performance summarizer
- Strategy contract for future AI/EAs

## Phase 10 — AI Media + Research Studio
- Source/search provider contract
- Research request/report model
- Citation-aware claim model
- Uncertainty tracking
- Image/audio/video/music/3D/document media job contracts
- Provider-neutral media adapters

## Phase 11 — Marketplace + Plugins + SDK
- Agent/plugin/template/theme/workflow/integration/model marketplace package model
- Versioned package registry
- Plugin manifest validation
- Permission restrictions for packages
- TypeScript SDK client for API consumers
- Stable package boundaries for future language SDKs

## Phase 12 — Integration + Testing + Hardening + Production Release
- Integration registry and webhook contract
- Production release gates
- Typecheck / unit / security / config / migration / smoke gate model
- Release readiness evaluator
- GitHub Actions CI for typechecking and release smoke checks
- Production release checklist
- Explicit separation between development adapters and production-grade infrastructure

## Architecture

```text
apps/
  web/                 Future platform UI
  api/                 Future public API
packages/
  ai-core/             Core contracts
  agents/              Agent definitions + LLM runner
  model-router/        Provider-neutral router + OpenAI adapter
  tools/               Tool contracts + workspace tools
  universal-builder/   Natural-language planning + build manifests
  workspace-engine/    Project filesystem + sessions
  ide-core/            Editor/terminal/preview protocol
  cloud/               Cloud resource abstraction
  deployment/          Deployment/release contracts
  database/            Database provider/migration abstractions
  automation/          Workflow engine
  integrations/        Integration registry + webhook contracts
  mcp/                 MCP registry
  security/            RBAC, secrets and audit primitives
  enterprise/          Organizations, memberships and SSO contracts
  billing/             Plans, subscriptions, usage and invoicing
  trading/             Trading/risk/backtest core
  research-studio/     Research and multimodal media core
  marketplace/         Marketplace + plugin contracts
  sdk/                 TypeScript SDK client
  production-core/     Release gates and production readiness
services/
  orchestrator/        Planning + runtime + LLM execution
  sandbox/             Command guard + sandbox jobs
  workflow/            Automation/integration runtime
  deployment/          Deployment engine boundary
```

## Security principles
1. Never commit `OPENAI_API_KEY` or any secret.
2. Tools require explicit permissions.
3. High-risk operations remain approval-gated.
4. Model providers are adapters; business logic does not depend on one provider.
5. Long-running tasks are observable and resumable.
6. External side effects stay behind explicit tool/service boundaries.
7. The local sandbox adapter is a development adapter, not production-grade isolation; production execution must use hardened container/VM infrastructure.
8. Trading live execution must remain behind explicit broker adapters and risk controls.
9. Marketplace packages must declare permissions and be validated before installation.
10. Production release is blocked until configured quality gates pass.

## Roadmap
Phase 1: Core foundation — complete
Phase 2: Multi-agent orchestration — complete
Phase 3: LLM runtime — complete
Phase 4: Universal builder — complete
Phase 5: IDE and sandbox — complete
Phase 6: Cloud/deployment/data — complete
Phase 7: Automation/MCP/integrations — complete
Phase 8: Security/enterprise/billing — complete
Phase 9: Trading platform — complete
Phase 10: AI media/research — complete
Phase 11: Marketplace/SDK/plugins — complete
Phase 12: Integration, hardening, and production release — implementation complete; production deployment still requires real provider adapters, environment configuration, and CI execution in the target infrastructure.
