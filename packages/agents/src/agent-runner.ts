import type { LLMRequest, LLMResponse, ToolSchema, MultiModelRouter, ChatMessage } from "@ai-os/model-router";
import { executeTool, type ToolContext, type ToolDefinition } from "@ai-os/tools";

export interface AgentRunOptions {
  systemPrompt: string;
  userPrompt: string;
  modelTask?: "planning" | "coding" | "reasoning" | "vision" | "fast" | "embedding";
  preferredProviderId?: string;
  preferredModel?: string;
  maxToolRounds?: number;
  toolContext: ToolContext;
}

export interface AgentRunResult {
  response: LLMResponse;
  rounds: number;
  toolCallsExecuted: number;
}

export interface AgentEvent {
  type: "llm.requested" | "llm.completed" | "tool.requested" | "tool.completed" | "tool.rejected";
  timestamp: string;
  payload: Record<string, unknown>;
}

export type AgentEventListener = (event: AgentEvent) => void;

function toToolSchema(tool: ToolDefinition): ToolSchema {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters ?? { type: "object", properties: {} }
  };
}

export class AgentRunner {
  private readonly listeners = new Set<AgentEventListener>();

  constructor(
    private readonly router: MultiModelRouter,
    private readonly tools: ToolDefinition[] = []
  ) {}

  subscribe(listener: AgentEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async run(options: AgentRunOptions): Promise<AgentRunResult> {
    const maxRounds = options.maxToolRounds ?? 8;
    const messages: ChatMessage[] = [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt }
    ];

    let rounds = 0;
    let toolCallsExecuted = 0;
    let response!: LLMResponse;

    while (rounds < maxRounds) {
      rounds += 1;
      const request: Omit<LLMRequest, "model"> = { messages, tools: this.tools.map(toToolSchema) };

      this.emit({ type: "llm.requested", timestamp: new Date().toISOString(), payload: { round: rounds } });
      response = await this.router.complete(request, {
        task: options.modelTask ?? "reasoning",
        preferredProviderId: options.preferredProviderId,
        preferredModel: options.preferredModel,
        requireTools: this.tools.length > 0
      });
      this.emit({ type: "llm.completed", timestamp: new Date().toISOString(), payload: { round: rounds, finishReason: response.finishReason } });

      if (response.toolCalls.length === 0) return { response, rounds, toolCallsExecuted };

      messages.push({ role: "assistant", content: response.content, toolCalls: response.toolCalls });

      for (const call of response.toolCalls) {
        const tool = this.tools.find((candidate) => candidate.name === call.name);
        if (!tool) {
          this.emit({ type: "tool.rejected", timestamp: new Date().toISOString(), payload: { tool: call.name, reason: "Tool not registered" } });
          messages.push({ role: "tool", toolCallId: call.id, content: JSON.stringify({ error: "Tool not registered" }) });
          continue;
        }

        this.emit({ type: "tool.requested", timestamp: new Date().toISOString(), payload: { tool: call.name, callId: call.id } });
        try {
          const input = JSON.parse(call.argumentsJson) as unknown;
          const output = await executeTool(tool, input, options.toolContext);
          toolCallsExecuted += 1;
          this.emit({ type: "tool.completed", timestamp: new Date().toISOString(), payload: { tool: call.name, callId: call.id } });
          messages.push({ role: "tool", toolCallId: call.id, content: JSON.stringify(output) });
        } catch (error) {
          this.emit({ type: "tool.rejected", timestamp: new Date().toISOString(), payload: { tool: call.name, callId: call.id, reason: String(error) } });
          messages.push({ role: "tool", toolCallId: call.id, content: JSON.stringify({ error: String(error) }) });
        }
      }
    }

    throw new Error(`Agent exceeded maxToolRounds (${maxRounds})`);
  }

  private emit(event: AgentEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
