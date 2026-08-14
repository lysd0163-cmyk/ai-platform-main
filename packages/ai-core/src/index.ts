export type ID = string;

export type AgentStatus = "idle" | "running" | "blocked" | "failed" | "completed";
export type TaskStatus = "queued" | "running" | "waiting_approval" | "retrying" | "completed" | "failed" | "cancelled";
export type RiskLevel = "low" | "medium" | "high";

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  risk: RiskLevel;
}

export interface AgentDefinition {
  id: ID;
  name: string;
  description: string;
  capabilities: AgentCapability[];
}

export interface ModelProvider {
  id: string;
  name: string;
  models: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  requiredPermissions: string[];
}

export interface AgentTask {
  id: ID;
  projectId: ID;
  objective: string;
  status: AgentStatus;
  assignedAgentId?: ID;
}

export interface Project {
  id: ID;
  name: string;
  description: string;
  workspaceId: ID;
  createdAt: string;
}

export interface Workspace {
  id: ID;
  name: string;
  organizationId: ID;
}

export interface MemoryRecord {
  id: ID;
  projectId: ID;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface OrchestrationTask {
  id: ID;
  projectId: ID;
  objective: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  maxRetries: number;
  retryCount: number;
}

export interface ApprovalRequest {
  id: ID;
  taskId: ID;
  stepId: string;
  reason: string;
  risk: RiskLevel;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  decidedBy?: ID;
  decidedAt?: string;
}

export interface ExecutionEvent {
  id: ID;
  taskId: ID;
  type:
    | "task.created"
    | "task.started"
    | "step.ready"
    | "step.started"
    | "step.completed"
    | "step.failed"
    | "approval.requested"
    | "approval.resolved"
    | "task.retrying"
    | "task.completed"
    | "task.failed"
    | "task.cancelled";
  timestamp: string;
  stepId?: string;
  agentId?: string;
  payload?: Record<string, unknown>;
}
