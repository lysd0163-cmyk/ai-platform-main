import type { AgentDefinition } from "@ai-os/ai-core";

export interface DelegationRequest {
  taskId: string;
  objective: string;
  preferredAgentId?: string;
  requiredCapabilities?: string[];
  risk?: "low" | "medium" | "high";
}

export interface DelegationDecision {
  agentId: string;
  score: number;
  reasons: string[];
}

export function selectAgent(request: DelegationRequest, agents: AgentDefinition[]): DelegationDecision {
  if (agents.length === 0) throw new Error("No agents are registered");

  const ranked = agents.map((agent) => {
    let score = 0;
    const reasons: string[] = [];

    if (agent.id === request.preferredAgentId) {
      score += 100;
      reasons.push("preferred agent match");
    }

    for (const capability of request.requiredCapabilities ?? []) {
      if (agent.capabilities.some((item) => item.id === capability || item.name.toLowerCase() === capability.toLowerCase())) {
        score += 20;
        reasons.push(`capability match: ${capability}`);
      }
    }

    if (request.risk && agent.capabilities.some((capability) => capability.risk === request.risk)) {
      score += 5;
      reasons.push(`risk fit: ${request.risk}`);
    }

    return { agentId: agent.id, score, reasons };
  });

  ranked.sort((a, b) => b.score - a.score || a.agentId.localeCompare(b.agentId));
  const winner = ranked[0];
  if (!winner) throw new Error("Unable to select an agent");
  return winner;
}

export function createDelegationPlan(requests: DelegationRequest[], agents: AgentDefinition[]): DelegationDecision[] {
  return requests.map((request) => selectAgent(request, agents));
}
