import { type WorkflowDefinition, WorkflowEngine, InMemoryWorkflowStore, type WorkflowRuntime, type WorkflowStep } from "@ai-os/automation";
import type { IntegrationRegistry } from "@ai-os/integrations";
import type { McpRegistry, McpTransport } from "@ai-os/mcp";

export interface WorkflowServiceOptions {
  integrationRegistry: IntegrationRegistry;
  mcpRegistry: McpRegistry;
  mcpTransport?: McpTransport;
  agentExecutor?: (step: WorkflowStep, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export class WorkflowService {
  readonly store = new InMemoryWorkflowStore();
  readonly engine: WorkflowEngine;

  constructor(private readonly options: WorkflowServiceOptions) {
    const runtime: WorkflowRuntime = {
      executeStep: async (step, input) => {
        switch (step.type) {
          case "integration":
            return options.integrationRegistry.execute({ integrationId: String(step.config.integrationId), operation: String(step.config.operation ?? "execute"), input, userId: String(step.config.userId ?? "system") });
          case "agent":
            if (!options.agentExecutor) throw new Error("Agent executor is not configured");
            return options.agentExecutor(step, input);
          case "transform":
            return { ...input, ...(step.config.output as Record<string, unknown> | undefined) };
          case "http":
            return { queued: true, method: step.config.method ?? "POST", url: step.config.url ?? null };
          case "delay":
            return { delayedMs: Number(step.config.ms ?? 0) };
          case "condition":
            return { condition: Boolean(step.config.value) };
          default:
            throw new Error(`Unsupported workflow step: ${step.type}`);
        }
      }
    };
    this.engine = new WorkflowEngine(runtime, this.store);
  }

  register(workflow: WorkflowDefinition): WorkflowDefinition { return this.store.save(workflow); }
  run(workflowId: string, input: Record<string, unknown> = {}) { return this.engine.run(workflowId, input); }
}
