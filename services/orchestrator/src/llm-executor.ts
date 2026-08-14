import { AgentRunner } from "@ai-os/agents";
import { MultiModelRouter } from "@ai-os/model-router";
import type { ToolContext, ToolDefinition } from "@ai-os/tools";
import type { StepExecutor, StepExecutionContext } from "./runtime";

const PROMPTS: Record<string, string> = {
  business: "Act as a senior business analyst. Turn the objective into concrete requirements, constraints, assumptions, and acceptance criteria.",
  "ui-ux": "Act as a senior product designer. Produce actionable UX, information architecture, accessibility, and UI requirements.",
  "software-engineer": "Act as a senior software engineer. Produce implementation-ready architecture and code-oriented decisions. Never claim a file was modified unless a tool actually modified it.",
  database: "Act as a senior database architect. Produce safe schema, migration, indexing, and data integrity requirements.",
  testing: "Act as a senior test engineer. Produce a verification strategy, test cases, edge cases, and release gates.",
  security: "Act as an application security engineer. Identify attack surfaces, authorization boundaries, secrets risks, and remediation requirements.",
  documentation: "Act as a technical writer. Create concise, accurate documentation based only on evidence available in the project context.",
  devops: "Act as a senior DevOps engineer. Produce deployment, observability, rollback, and reliability requirements. Treat destructive operations as approval-gated."
};

export class LLMBackedStepExecutor implements StepExecutor {
  constructor(
    private readonly router: MultiModelRouter,
    private readonly tools: ToolDefinition[] = []
  ) {}

  async execute(context: StepExecutionContext): Promise<Record<string, unknown>> {
    const runner = new AgentRunner(this.router, this.tools);
    const result = await runner.run({
      systemPrompt: PROMPTS[context.step.agentId] ?? "Act as a specialized AI agent working on the assigned project task.",
      userPrompt: [
        `Project task: ${context.task.objective}`,
        `Current step: ${context.step.objective}`,
        `Step id: ${context.step.id}`,
        "Return a structured result suitable for the orchestrator and downstream agents."
      ].join("\n"),
      modelTask: context.step.agentId === "software-engineer" ? "coding" : "reasoning",
      maxToolRounds: 6,
      toolContext: {
        projectId: context.task.projectId,
        userId: "system-orchestrator",
        permissions: []
      } satisfies ToolContext
    });

    return {
      content: result.response.content,
      model: result.response.model,
      rounds: result.rounds,
      toolCallsExecuted: result.toolCallsExecuted,
      finishReason: result.response.finishReason,
      usage: result.response.usage
    };
  }
}
