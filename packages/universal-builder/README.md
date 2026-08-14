# Universal Builder

Phase 4 establishes the provider-neutral product-building layer.

## Input

A user supplies a project name, natural-language description, optional product types, and constraints.

## Pipeline

```text
user request
   ↓
Product Planner
   ↓
Product Spec
   ↓
Architecture Spec
   ↓
File Manifest
   ↓
Build Validation
   ↓
Orchestrator / Agent Runtime
```

The package intentionally does not write files, execute shell commands, deploy infrastructure, or call a model directly. Those side effects belong to the sandbox, tools, agents, and deployment layers added in later phases.

Supported product classifications:

- web
- api
- saas
- mobile
- desktop
- game
- ecommerce
- crm
- erp
- bot

The manifest is the contract between natural-language planning and later code generation/execution stages.
