import type { AgentDefinition } from "@ai-os/ai-core";

export const builtinAgents: AgentDefinition[] = [
  { id: "orchestrator", name: "Orchestrator", description: "Plans work and coordinates specialized agents.", capabilities: [] },
  { id: "software-engineer", name: "Software Engineer", description: "Builds and modifies application code.", capabilities: [{ id: "code", name: "Code generation", description: "Create and modify software.", risk: "medium" }] },
  { id: "ui-ux", name: "UI/UX Agent", description: "Designs accessible product interfaces.", capabilities: [{ id: "design", name: "Interface design", description: "Design user experiences and interfaces.", risk: "low" }] },
  { id: "database", name: "Database Agent", description: "Designs schemas, migrations, queries, and data models.", capabilities: [{ id: "database", name: "Database operations", description: "Design and validate data architecture.", risk: "high" }] },
  { id: "devops", name: "DevOps Agent", description: "Builds deployment and infrastructure plans.", capabilities: [{ id: "deploy", name: "Deployment", description: "Prepare and operate deployments.", risk: "high" }] },
  { id: "security", name: "Security Agent", description: "Reviews security posture and risks.", capabilities: [{ id: "security-review", name: "Security review", description: "Identify and mitigate security issues.", risk: "high" }] },
  { id: "testing", name: "Testing Agent", description: "Creates and runs test strategies.", capabilities: [{ id: "testing", name: "Testing", description: "Design and execute software tests.", risk: "medium" }] },
  { id: "documentation", name: "Documentation Agent", description: "Maintains technical documentation.", capabilities: [{ id: "docs", name: "Documentation", description: "Generate and maintain documentation.", risk: "low" }] },
  { id: "business", name: "Business Analyst", description: "Turns product goals into requirements and plans.", capabilities: [{ id: "analysis", name: "Business analysis", description: "Analyze requirements and workflows.", risk: "low" }] }
];

export function getAgent(id: string): AgentDefinition | undefined {
  return builtinAgents.find((agent) => agent.id === id);
}

export * from "./agent-runner";
