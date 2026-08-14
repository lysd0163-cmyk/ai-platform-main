import type { ID } from "@ai-os/ai-core";

export type TriggerType = "manual" | "webhook" | "schedule" | "event";
export type StepType = "http" | "agent" | "transform" | "condition" | "delay" | "integration";

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: Record<string, unknown>;
  dependsOn: string[];
}

export interface WorkflowDefinition {
  id: ID;
  name: string;
  projectId: ID;
  enabled: boolean;
  trigger: { type: TriggerType; config: Record<string, unknown> };
  steps: WorkflowStep[];
}

export interface WorkflowRun {
  id: ID;
  workflowId: ID;
  status: "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled";
  startedAt: string;
  finishedAt?: string;
  outputs: Record<string, unknown>;
}

export interface WorkflowRuntime {
  executeStep(step: WorkflowStep, input: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export class InMemoryWorkflowStore {
  private readonly workflows = new Map<string, WorkflowDefinition>();
  private readonly runs = new Map<string, WorkflowRun>();

  save(workflow: WorkflowDefinition): WorkflowDefinition {
    this.validate(workflow);
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  get(id: string): WorkflowDefinition | undefined { return this.workflows.get(id); }
  list(projectId: string): WorkflowDefinition[] { return [...this.workflows.values()].filter((w) => w.projectId === projectId); }

  createRun(workflowId: string): WorkflowRun {
    if (!this.workflows.has(workflowId)) throw new Error(`Workflow not found: ${workflowId}`);
    const run: WorkflowRun = { id: `${workflowId}:${Date.now()}`, workflowId, status: "queued", startedAt: new Date().toISOString(), outputs: {} };
    this.runs.set(run.id, run);
    return run;
  }

  getRun(id: string): WorkflowRun | undefined { return this.runs.get(id); }

  private validate(workflow: WorkflowDefinition): void {
    const ids = new Set<string>();
    for (const step of workflow.steps) {
      if (ids.has(step.id)) throw new Error(`Duplicate workflow step: ${step.id}`);
      ids.add(step.id);
      for (const dependency of step.dependsOn) if (!workflow.steps.some((candidate) => candidate.id === dependency)) throw new Error(`Unknown dependency: ${dependency}`);
    }
  }
}

export class WorkflowEngine {
  constructor(private readonly runtime: WorkflowRuntime, private readonly store: InMemoryWorkflowStore) {}

  async run(workflowId: string, input: Record<string, unknown> = {}): Promise<WorkflowRun> {
    const workflow = this.store.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    const run = this.store.createRun(workflowId);
    run.status = "running";
    try {
      const completed = new Set<string>();
      let context = { ...input };
      while (completed.size < workflow.steps.length) {
        const step = workflow.steps.find((candidate) => !completed.has(candidate.id) && candidate.dependsOn.every((id) => completed.has(id)));
        if (!step) throw new Error("Workflow dependency cycle or blocked step");
        if (step.type === "condition" && step.config.enabled === false) {
          completed.add(step.id);
          continue;
        }
        const output = await this.runtime.executeStep(step, context);
        run.outputs[step.id] = output;
        context = { ...context, ...output };
        completed.add(step.id);
      }
      run.status = "completed";
    } catch (error) {
      run.status = "failed";
      run.outputs.error = String(error);
    }
    run.finishedAt = new Date().toISOString();
    return run;
  }
}

export interface CronSchedule { expression: string; timezone?: string; }
export function validateCronSchedule(schedule: CronSchedule): void {
  if (!schedule.expression.trim()) throw new Error("Cron expression is required");
}
