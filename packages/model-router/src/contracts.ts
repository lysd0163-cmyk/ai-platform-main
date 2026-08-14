export type ModelTask = "planning" | "coding" | "reasoning" | "vision" | "fast" | "embedding";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  argumentsJson: string;
}

export interface LLMRequest {
  model: string;
  messages: ChatMessage[];
  tools?: ToolSchema[];
  temperature?: number;
  stream?: boolean;
  metadata?: Record<string, string>;
}

export interface LLMResponse {
  id: string;
  model: string;
  content: string;
  toolCalls: ToolCall[];
  finishReason: "stop" | "tool_calls" | "length" | "unknown";
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMProvider {
  readonly id: string;
  readonly models: string[];
  complete(request: LLMRequest): Promise<LLMResponse>;
}

export interface RoutingContext {
  task: ModelTask;
  preferredProviderId?: string;
  preferredModel?: string;
  requireTools?: boolean;
}
