import OpenAI from "openai";
import type { ChatMessage, LLMProvider, LLMRequest, LLMResponse, ToolCall } from "./contracts";

export interface OpenAIProviderOptions {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  project?: string;
  models: string[];
}

function toOpenAIMessage(message: ChatMessage): OpenAI.Chat.ChatCompletionMessageParam {
  if (message.role === "system") return { role: "system", content: message.content };
  if (message.role === "user") return { role: "user", content: message.content };
  if (message.role === "tool") {
    if (!message.toolCallId) throw new Error("Tool messages require toolCallId");
    return { role: "tool", tool_call_id: message.toolCallId, content: message.content };
  }
  return { role: "assistant", content: message.content };
}

export class OpenAIProvider implements LLMProvider {
  readonly id = "openai";
  readonly models: string[];
  private readonly client: OpenAI;

  constructor(options: OpenAIProviderOptions) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    this.client = new OpenAI({
      apiKey,
      baseURL: options.baseURL,
      organization: options.organization,
      project: options.project
    });
    this.models = options.models;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages.map(toOpenAIMessage),
      temperature: request.temperature,
      stream: false,
      tools: request.tools?.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }))
    });

    const choice = response.choices[0];
    if (!choice) throw new Error("OpenAI returned no choices");

    const toolCalls: ToolCall[] = (choice.message.tool_calls ?? [])
      .filter((call): call is OpenAI.Chat.ChatCompletionMessageFunctionToolCall => call.type === "function")
      .map((call) => ({ id: call.id, name: call.function.name, argumentsJson: call.function.arguments }));

    const finishReason = choice.finish_reason === "tool_calls"
      ? "tool_calls"
      : choice.finish_reason === "length"
        ? "length"
        : choice.finish_reason === "stop"
          ? "stop"
          : "unknown";

    return {
      id: response.id,
      model: response.model,
      content: choice.message.content ?? "",
      toolCalls,
      finishReason,
      usage: response.usage
        ? {
            inputTokens: response.usage.prompt_tokens,
            outputTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          }
        : undefined
    };
  }
}
