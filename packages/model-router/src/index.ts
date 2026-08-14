import type { ModelProvider } from "@ai-os/ai-core";

export interface ModelRequest {
  task: "planning" | "coding" | "reasoning" | "vision" | "fast" | "embedding";
  input: string;
}

export interface ModelSelection {
  providerId: string;
  modelId: string;
  reason: string;
}

export const providers: ModelProvider[] = [];

export function registerProvider(provider: ModelProvider): void {
  if (providers.some((item) => item.id === provider.id)) {
    throw new Error(`Provider already registered: ${provider.id}`);
  }
  providers.push(provider);
}

export function selectModel(request: ModelRequest): ModelSelection {
  if (providers.length === 0) {
    throw new Error("No AI model provider is configured");
  }

  const provider = providers[0];
  const modelId = provider.models[0];
  if (!modelId) throw new Error(`Provider ${provider.id} has no models`);

  return {
    providerId: provider.id,
    modelId,
    reason: `Initial deterministic routing for task: ${request.task}`
  };
}
