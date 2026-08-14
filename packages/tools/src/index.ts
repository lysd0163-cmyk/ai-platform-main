export interface ToolContext {
  projectId: string;
  userId: string;
  permissions: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  requiredPermissions: string[];
  parameters?: Record<string, unknown>;
  execute(input: unknown, context: ToolContext): Promise<unknown>;
}

export function canExecute(tool: ToolDefinition, context: ToolContext): boolean {
  return tool.requiredPermissions.every((permission) => context.permissions.includes(permission));
}

export async function executeTool(tool: ToolDefinition, input: unknown, context: ToolContext): Promise<unknown> {
  if (!canExecute(tool, context)) {
    throw new Error(`Permission denied for tool: ${tool.id}`);
  }
  return tool.execute(input, context);
}
