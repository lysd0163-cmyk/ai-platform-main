export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpResource { uri: string; name: string; mimeType?: string; }

export interface McpServerDefinition {
  id: string;
  name: string;
  version: string;
  tools: McpTool[];
  resources: McpResource[];
}

export interface McpTransport {
  callTool(serverId: string, toolName: string, input: Record<string, unknown>): Promise<unknown>;
  readResource(serverId: string, uri: string): Promise<unknown>;
}

export class McpRegistry {
  private readonly servers = new Map<string, McpServerDefinition>();
  register(server: McpServerDefinition): void {
    if (this.servers.has(server.id)) throw new Error(`MCP server already registered: ${server.id}`);
    this.servers.set(server.id, server);
  }
  get(id: string): McpServerDefinition | undefined { return this.servers.get(id); }
  list(): McpServerDefinition[] { return [...this.servers.values()]; }
  findTool(serverId: string, name: string): McpTool | undefined { return this.servers.get(serverId)?.tools.find((tool) => tool.name === name); }
}
