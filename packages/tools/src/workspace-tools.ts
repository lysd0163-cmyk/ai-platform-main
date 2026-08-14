import type { FileStore } from "@ai-os/workspace-engine";
import type { ToolDefinition } from "./index";

export function createWorkspaceTools(store: FileStore): ToolDefinition[] {
  return [
    {
      id: "workspace.list_files",
      name: "workspace_list_files",
      description: "List files in the current project workspace.",
      requiredPermissions: ["workspace:read"],
      parameters: { type: "object", properties: {} },
      execute: async () => store.list()
    },
    {
      id: "workspace.read_file",
      name: "workspace_read_file",
      description: "Read a UTF-8 text file from the current project workspace.",
      requiredPermissions: ["workspace:read"],
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      },
      execute: async (input) => {
        const { path } = input as { path: string };
        return { path, content: await store.read(path) };
      }
    },
    {
      id: "workspace.write_file",
      name: "workspace_write_file",
      description: "Create or replace a UTF-8 text file in the current workspace.",
      requiredPermissions: ["workspace:write"],
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, content: { type: "string" } },
        required: ["path", "content"]
      },
      execute: async (input) => {
        const { path, content } = input as { path: string; content: string };
        return store.write(path, content);
      }
    },
    {
      id: "workspace.delete_file",
      name: "workspace_delete_file",
      description: "Delete a file from the current workspace.",
      requiredPermissions: ["workspace:write"],
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      },
      execute: async (input) => {
        const { path } = input as { path: string };
        await store.delete(path);
        return { deleted: path };
      }
    }
  ];
}
