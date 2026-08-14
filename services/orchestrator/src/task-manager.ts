import type { OrchestrationTask, TaskStatus } from "@ai-os/ai-core";
import { planTask, type TaskPlan } from "./index";
import { TaskExecutionRuntime, type StepExecutor } from "./runtime";

export class InMemoryTaskManager {
  private readonly tasks = new Map<string, OrchestrationTask>();
  private readonly plans = new Map<string, TaskPlan>();
  readonly runtime: TaskExecutionRuntime;

  constructor(executor: StepExecutor) {
    this.runtime = new TaskExecutionRuntime(executor);
  }

  create(input: { id: string; projectId: string; objective: string; maxRetries?: number }): OrchestrationTask {
    if (this.tasks.has(input.id)) throw new Error(`Task already exists: ${input.id}`);
    const now = new Date().toISOString();
    const task: OrchestrationTask = {
      id: input.id,
      projectId: input.projectId,
      objective: input.objective,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      maxRetries: input.maxRetries ?? 2,
      retryCount: 0
    };
    const plan = planTask({ id: input.id, projectId: input.projectId, objective: input.objective, status: "idle" });
    this.tasks.set(task.id, task);
    this.plans.set(task.id, plan);
    this.runtime.events.emit({
      id: `${task.id}:created`,
      taskId: task.id,
      type: "task.created",
      timestamp: now
    });
    return task;
  }

  get(id: string): OrchestrationTask | undefined {
    return this.tasks.get(id);
  }

  getPlan(id: string): TaskPlan | undefined {
    return this.plans.get(id);
  }

  events(id: string) {
    return this.runtime.events.list(id);
  }

  approvals(id: string) {
    return this.runtime.approvals.getForTask(id);
  }

  async run(id: string): Promise<TaskStatus> {
    const task = this.requireTask(id);
    const plan = this.requirePlan(id);
    return this.runtime.run(task, plan);
  }

  async approve(id: string, approvalId: string, userId: string): Promise<TaskStatus> {
    const task = this.requireTask(id);
    const approval = this.runtime.approvals.decide(approvalId, true, userId);
    if (approval.taskId !== task.id) throw new Error("Approval belongs to another task");
    this.runtime.events.emit({
      id: `${task.id}:approval-resolved:${Date.now()}`,
      taskId: task.id,
      type: "approval.resolved",
      stepId: approval.stepId,
      timestamp: new Date().toISOString(),
      payload: { approvalId: approval.id, decision: "approved", decidedBy: userId }
    });
    task.status = "running";
    return this.runFromApproval(task, approval.stepId);
  }

  reject(id: string, approvalId: string, userId: string): TaskStatus {
    const task = this.requireTask(id);
    const approval = this.runtime.approvals.decide(approvalId, false, userId);
    if (approval.taskId !== task.id) throw new Error("Approval belongs to another task");
    this.runtime.events.emit({
      id: `${task.id}:approval-resolved:${Date.now()}`,
      taskId: task.id,
      type: "approval.resolved",
      stepId: approval.stepId,
      timestamp: new Date().toISOString(),
      payload: { approvalId: approval.id, decision: "rejected", decidedBy: userId }
    });
    task.status = "failed";
    this.runtime.events.emit({
      id: `${task.id}:failed:${Date.now()}`,
      taskId: task.id,
      type: "task.failed",
      timestamp: new Date().toISOString(),
      payload: { reason: "Approval rejected", stepId: approval.stepId }
    });
    return task.status;
  }

  cancel(id: string): TaskStatus {
    const task = this.requireTask(id);
    if (["completed", "failed", "cancelled"].includes(task.status)) return task.status;
    task.status = "cancelled";
    task.updatedAt = new Date().toISOString();
    this.runtime.events.emit({
      id: `${task.id}:cancelled:${Date.now()}`,
      taskId: task.id,
      type: "task.cancelled",
      timestamp: task.updatedAt
    });
    return task.status;
  }

  private async runFromApproval(task: OrchestrationTask, approvedStepId: string): Promise<TaskStatus> {
    const plan = this.requirePlan(task.id);
    const approvedIndex = plan.steps.findIndex((step) => step.id === approvedStepId);
    if (approvedIndex < 0) throw new Error(`Approved step not found: ${approvedStepId}`);

    const step = plan.steps[approvedIndex];
    await this.runtime["executeWithRetry"](task, step);
    const remainder = plan.steps.slice(approvedIndex + 1);
    const resumePlan = { taskId: task.id, steps: remainder };
    const statuses = await this.runtime.run(task, resumePlan);
    return statuses;
  }

  private requireTask(id: string): OrchestrationTask {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    return task;
  }

  private requirePlan(id: string): TaskPlan {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Task plan not found: ${id}`);
    return plan;
  }
}
