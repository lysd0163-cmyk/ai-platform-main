export type ID = string;

export type AgentStatus = "idle" | "running" | "blocked" | "failed" | "completed";

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  risk: "low" | "medium" | "high";
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
