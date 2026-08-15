import type { LLMProvider, LLMRequest, LLMResponse, RoutingContext } from "./contracts.js";

export class MultiModelRouter {
  private readonly providers = new Map<string, LLMProvider>();

  register(provider: LLMProvider): void {
    if (this.providers.has(provider.id)) throw new Error(`Provider already registered: ${provider.id}`);
    this.providers.set(provider.id, provider);
  }

  listProviders(): string[] {
    return [...this.providers.keys()];
  }

  choose(context: RoutingContext): LLMProvider {
    if (context.preferredProviderId) {
      const preferred = this.providers.get(context.preferredProviderId);
      if (!preferred) throw new Error(`Unknown provider: ${context.preferredProviderId}`);
      return preferred;
    }

    const capable = [...this.providers.values()].filter((provider) =>
      context.requireTools ? provider.models.length > 0 : true
    );
    if (capable.length === 0) throw new Error("No model provider is configured");
    return capable[0];
  }

  chooseModel(provider: LLMProvider, preferredModel?: string): string {
    if (preferredModel && provider.models.includes(preferredModel)) return preferredModel;
    const model = provider.models[0];
    if (!model) throw new Error(`Provider ${provider.id} has no registered models`);
    return model;
  }

  async complete(request: Omit<LLMRequest, "model">, context: RoutingContext): Promise<LLMResponse> {
    const provider = this.choose(context);
    const model = this.chooseModel(provider, context.preferredModel);
    return provider.complete({ ...request, model });
  }
}
