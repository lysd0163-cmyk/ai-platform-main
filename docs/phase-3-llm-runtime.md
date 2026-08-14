# Phase 3 — LLM Runtime

## Runtime path

```text
Orchestrator
    ↓
AgentRunner
    ↓
MultiModelRouter
    ↓
LLMProvider
    ↓
OpenAIProvider
    ↓
OpenAI API
```

Tool execution flows back through:

```text
LLM tool call
    ↓
Tool registry
    ↓
Permission check
    ↓
Tool execution
    ↓
Tool result
    ↓
Next LLM round
```

## Configuration

Set `OPENAI_API_KEY` only in the runtime environment. Never commit it.

Optional variables:

- `OPENAI_ORG_ID`
- `OPENAI_PROJECT_ID`
- `AI_OS_OPENAI_MODELS` (comma-separated model IDs)

## Safety behavior

The Agent Runner limits tool-call rounds. Every tool has explicit required permissions. The orchestrator can add approval gates around high-risk steps before execution.

## Current scope

This phase provides the provider abstraction, OpenAI adapter, model routing, multi-round tool loop, events, and orchestration bootstrap. It deliberately does not claim sandbox execution, cloud deployment, or production persistence yet; those are later phases.
