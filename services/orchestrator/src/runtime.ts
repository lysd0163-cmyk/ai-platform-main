import type {
  ApprovalRequest,
  ExecutionEvent,
  OrchestrationTask,
  RiskLevel,
  TaskStatus
} from "@ai-os/ai-core";

import type { TaskPlan, TaskPlanStep } from "./index";

export interface StepExecutionContext {
  task: OrchestrationTask;
  step: TaskPlanStep;
}

export interface StepExecutor {
  execute(context: StepExecutionContext): Promise<Record<string, unknown>>;
}

export interface ApprovalPolicy {
  requiresApproval(step: TaskPlanStep): boolean;
  riskFor(step: TaskPlanStep): RiskLevel;
}

export class DefaultApprovalPolicy implements ApprovalPolicy {
  requiresApproval(step: TaskPlanStep): boolean {
    return ["database", "devops", "security"].includes(step.agentId);
  }

  riskFor(step: TaskPlanStep): RiskLevel {
    if (step.agentId === "devops" || step.agentId === "database") return "high";
    if (step.agentId === "security" || step.agentId === "software-engineer") return "medium";
    return "low";
  }
}

export class ExecutionEventBus {
  private readonly events: ExecutionEvent[] = [];
  private readonly listeners = new Set<(event: ExecutionEvent) => void>();

  emit(event: ExecutionEvent): void {
    this.events.push(event);
    for (const listener of this.listeners) listener(event);
  }

  list(taskId: string): ExecutionEvent[] {
    return this.events.filter((event) => event.taskId === taskId);
  }

  subscribe(listener: (event: ExecutionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export class ApprovalManager {
  private readonly requests = new Map<string, ApprovalRequest>();

  create(taskId: string, stepId: string, reason: string, risk: RiskLevel): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `${taskId}:approval:${stepId}`,
      taskId,
      stepId,
      reason,
      risk,
      requestedAt: new Date().toISOString(),
      status: "pending"
    };
    this.requests.set(request.id, request);
    return request;
  }

  getForTask(taskId: string): ApprovalRequest[] {
    return [...this.requests.values()].filter((request) => request.taskId === taskId);
  }

  get(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  decide(id: string, approved: boolean, userId: string): ApprovalRequest {
    const request = this.requests.get(id);
    if (!request) throw new Error(`Approval not found: ${id}`);
    if (request.status !== "pending") throw new Error(`Approval already resolved: ${id}`);
    request.status = approved ? "approved" : "rejected";
    request.decidedBy = userId;
    request.decidedAt = new Date().toISOString();
    return request;
  }
}

export class TaskExecutionRuntime {
  constructor(
    private readonly executor: StepExecutor,
    private readonly approvalPolicy = new DefaultApprovalPolicy(),
    readonly events = new ExecutionEventBus(),
    readonly approvals = new ApprovalManager()
  ) {}

  async run(task: OrchestrationTask, plan: TaskPlan): Promise<TaskStatus> {
    return this.runFrom(task, plan, new Set());
  }

  async runFrom(task: OrchestrationTask, plan: TaskPlan, completed: Set<string>): Promise<TaskStatus> {
    if (task.status !== "waiting_approval") {
      this.emit(task, "task.started");
    }
    task.status = "running";
    const pending = plan.steps.filter((step) => !completed.has(step.id));

    while (pending.length > 0) {
      const readyIndex = pending.findIndex((step) => step.dependsOn.every((id) => completed.has(id)));
      if (readyIndex === -1) {
        task.status = "failed";
        this.emit(task, "task.failed", undefined, { reason: "Dependency cycle or blocked plan" });
        return task.status;
      }

      const [step] = pending.splice(readyIndex, 1);
      this.emit(task, "step.ready", step.id, { dependencies: step.dependsOn });

      if (this.approvalPolicy.requiresApproval(step)) {
        const existing = this.approvals.get(`${task.id}:approval:${step.id}`);
        if (!existing || existing.status !== "approved") {
          const approval = existing ?? this.approvals.create(
            task.id,
            step.id,
            `Approval required before ${step.agentId} executes this step.`,
            this.approvalPolicy.riskFor(step)
          );
          task.status = "waiting_approval";
          if (approval.status === "pending") {
            this.emit(task, "approval.requested", step.id, { approvalId: approval.id, risk: approval.risk });
          }
          return task.status;
        }
      }

      await this.executeStepWithRetry(task, step);
      completed.add(step.id);
    }

    task.status = "completed";
    task.updatedAt = new Date().toISOString();
    this.emit(task, "task.completed");
    return task.status;
  }

  async executeApprovedStep(task: OrchestrationTask, step: TaskPlanStep): Promise<void> {
    await this.executeStepWithRetry(task, step);
  }

  private async executeStepWithRetry(task: OrchestrationTask, step: TaskPlanStep): Promise<void> {
    for (;;) {
      try {
        this.emit(task, "step.started", step.id, { attempt: task.retryCount + 1 }, step.agentId);
        await this.executor.execute({ task, step });
        this.emit(task, "step.completed", step.id, undefined, step.agentId);
        return;
      } catch (error) {
        if (task.retryCount >= task.maxRetries) {
          task.status = "failed";
          this.emit(task, "step.failed", step.id, { error: String(error) }, step.agentId);
          this.emit(task, "task.failed", undefined, { failedStep: step.id });
          throw error;
        }
        task.retryCount += 1;
        task.status = "retrying";
        this.emit(task, "task.retrying", step.id, { retryCount: task.retryCount }, step.agentId);
        task.status = "running";
      }
    }
  }

  private emit(
    task: OrchestrationTask,
    type: ExecutionEvent["type"],
    stepId?: string,
    payload?: Record<string, unknown>,
    agentId?: string
  ): void {
    this.events.emit({
      id: `${task.id}:${type}:${Date.now()}`,
      taskId: task.id,
      type,
      timestamp: new Date().toISOString(),
      stepId,
      agentId,
      payload
    });
    task.updatedAt = new Date().toISOString();
  }
}
