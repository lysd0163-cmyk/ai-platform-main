import type { FileStore, WorkspaceFile, WorkspaceSession } from "@ai-os/workspace-engine";

export interface EditorDocument {
  path: string;
  version: number;
  content: string;
  language: string;
  dirty: boolean;
}

export interface PreviewTarget {
  id: string;
  type: "web" | "mobile" | "desktop" | "api";
  url?: string;
  status: "starting" | "running" | "stopped" | "failed";
}

export interface TerminalSession {
  id: string;
  workspaceSessionId: string;
  cwd?: string;
  status: "active" | "closed";
}

export interface IDEWorkspace {
  session: WorkspaceSession;
  files: FileStore;
  openDocuments: Map<string, EditorDocument>;
  terminals: Map<string, TerminalSession>;
  previews: Map<string, PreviewTarget>;
}

export class IDEWorkspaceManager {
  private readonly workspaces = new Map<string, IDEWorkspace>();

  create(session: WorkspaceSession, files: FileStore): IDEWorkspace {
    const workspace: IDEWorkspace = {
      session,
      files,
      openDocuments: new Map(),
      terminals: new Map(),
      previews: new Map()
    };
    this.workspaces.set(session.id, workspace);
    return workspace;
  }

  get(sessionId: string): IDEWorkspace | undefined {
    return this.workspaces.get(sessionId);
  }

  async openFile(sessionId: string, path: string, language = "plaintext"): Promise<EditorDocument> {
    const workspace = this.require(sessionId);
    const content = await workspace.files.read(path);
    const existing = workspace.openDocuments.get(path);
    const document: EditorDocument = {
      path,
      version: existing?.version ?? 1,
      content,
      language,
      dirty: false
    };
    workspace.openDocuments.set(path, document);
    return document;
  }

  async saveFile(sessionId: string, path: string, content: string): Promise<WorkspaceFile> {
    const workspace = this.require(sessionId);
    const document = workspace.openDocuments.get(path);
    if (document) {
      document.content = content;
      document.version += 1;
      document.dirty = false;
    }
    return workspace.files.write(path, content);
  }

  markDirty(sessionId: string, path: string, content: string): EditorDocument {
    const workspace = this.require(sessionId);
    const current = workspace.openDocuments.get(path) ?? {
      path,
      version: 0,
      content,
      language: "plaintext",
      dirty: true
    };
    current.content = content;
    current.version += 1;
    current.dirty = true;
    workspace.openDocuments.set(path, current);
    return current;
  }

  createTerminal(sessionId: string, cwd?: string): TerminalSession {
    const workspace = this.require(sessionId);
    const terminal: TerminalSession = {
      id: crypto.randomUUID(),
      workspaceSessionId: sessionId,
      cwd,
      status: "active"
    };
    workspace.terminals.set(terminal.id, terminal);
    return terminal;
  }

  closeTerminal(sessionId: string, terminalId: string): TerminalSession {
    const workspace = this.require(sessionId);
    const terminal = workspace.terminals.get(terminalId);
    if (!terminal) throw new Error(`Terminal not found: ${terminalId}`);
    terminal.status = "closed";
    return terminal;
  }

  registerPreview(sessionId: string, target: Omit<PreviewTarget, "id">): PreviewTarget {
    const workspace = this.require(sessionId);
    const preview: PreviewTarget = { id: crypto.randomUUID(), ...target };
    workspace.previews.set(preview.id, preview);
    return preview;
  }

  private require(sessionId: string): IDEWorkspace {
    const workspace = this.workspaces.get(sessionId);
    if (!workspace) throw new Error(`IDE workspace not found: ${sessionId}`);
    return workspace;
  }
}
