import { LLMBackedStepExecutor } from "./llm-executor";
import { createDefaultModelRouter } from "./providers";
import type { ToolDefinition } from "@ai-os/tools";

export function createLLMBackedExecutor(tools: ToolDefinition[] = []): LLMBackedStepExecutor {
  return new LLMBackedStepExecutor(createDefaultModelRouter(), tools);
}
