export type IntegrationKind = "rest" | "webhook" | "oauth" | "database" | "messaging" | "storage" | "custom";

export interface IntegrationDefinition {
  id: string;
  name: string;
  kind: IntegrationKind;
  baseUrl?: string;
  scopes?: string[];
  secretRefs: string[];
}

export interface IntegrationRequest {
  integrationId: string;
  operation: string;
  input: Record<string, unknown>;
  userId: string;
}

export interface IntegrationAdapter {
  readonly id: string;
  execute(request: IntegrationRequest): Promise<Record<string, unknown>>;
}

export class IntegrationRegistry {
  private readonly definitions = new Map<string, IntegrationDefinition>();
  private readonly adapters = new Map<string, IntegrationAdapter>();

  register(definition: IntegrationDefinition, adapter: IntegrationAdapter): void {
    if (this.definitions.has(definition.id)) throw new Error(`Integration already registered: ${definition.id}`);
    if (adapter.id !== definition.id) throw new Error("Integration adapter id mismatch");
    this.definitions.set(definition.id, definition);
    this.adapters.set(definition.id, adapter);
  }

  list(): IntegrationDefinition[] { return [...this.definitions.values()]; }
  get(id: string): IntegrationDefinition | undefined { return this.definitions.get(id); }

  async execute(request: IntegrationRequest): Promise<Record<string, unknown>> {
    const adapter = this.adapters.get(request.integrationId);
    if (!adapter) throw new Error(`Integration not configured: ${request.integrationId}`);
    return adapter.execute(request);
  }
}

export class GenericWebhookAdapter implements IntegrationAdapter {
  readonly id: string;
  constructor(id: string, private readonly send: (request: IntegrationRequest) => Promise<Record<string, unknown>>) { this.id = id; }
  execute(request: IntegrationRequest) { return this.send(request); }
}
