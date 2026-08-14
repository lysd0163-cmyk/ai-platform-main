import { builtinAgents, getAgent } from "@ai-os/agents";
import type { AgentTask } from "@ai-os/ai-core";

export interface TaskPlanStep {
  id: string;
  agentId: string;
  objective: string;
  dependsOn: string[];
}

export interface TaskPlan {
  taskId: string;
  steps: TaskPlanStep[];
}

export function planTask(task: AgentTask): TaskPlan {
  const steps: TaskPlanStep[] = [
    { id: `${task.id}:analyze`, agentId: "business", objective: `Analyze objective: ${task.objective}`, dependsOn: [] },
    { id: `${task.id}:design`, agentId: "ui-ux", objective: "Design the product experience and interface requirements.", dependsOn: [`${task.id}:analyze`] },
    { id: `${task.id}:architecture`, agentId: "software-engineer", objective: "Define the technical architecture and implementation plan.", dependsOn: [`${task.id}:analyze`] },
    { id: `${task.id}:data`, agentId: "database", objective: "Design data models and persistence requirements.", dependsOn: [`${task.id}:architecture`] },
    { id: `${task.id}:implementation`, agentId: "software-engineer", objective: "Implement the planned project.", dependsOn: [`${task.id}:design`, `${task.id}:architecture`, `${task.id}:data`] },
    { id: `${task.id}:test`, agentId: "testing", objective: "Validate the implementation with automated tests.", dependsOn: [`${task.id}:implementation`] },
    { id: `${task.id}:security`, agentId: "security", objective: "Perform security review and identify release blockers.", dependsOn: [`${task.id}:implementation`] },
    { id: `${task.id}:docs`, agentId: "documentation", objective: "Generate and update project documentation.", dependsOn: [`${task.id}:test`, `${task.id}:security`] },
    { id: `${task.id}:deploy`, agentId: "devops", objective: "Prepare deployment after validation gates pass.", dependsOn: [`${task.id}:docs`] }
  ];

  for (const step of steps) {
    if (!getAgent(step.agentId)) throw new Error(`Unknown agent: ${step.agentId}`);
  }
  return { taskId: task.id, steps };
}

export function listAgents() {
  return builtinAgents;
}
