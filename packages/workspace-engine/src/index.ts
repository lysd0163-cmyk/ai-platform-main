export type FileKind = "file" | "directory";

export interface WorkspaceFile {
  path: string;
  kind: FileKind;
  size: number;
  updatedAt: string;
  content?: string;
}

export interface FileStore {
  list(): Promise<WorkspaceFile[]>;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<WorkspaceFile>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

function normalizePath(input: string): string {
  const path = input.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = path.split("/").filter(Boolean);
  const safe: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") throw new Error("Path traversal is not allowed");
    safe.push(part);
  }
  if (safe.length === 0) throw new Error("Path must not be empty");
  return safe.join("/");
}

function byteLength(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

export class InMemoryFileStore implements FileStore {
  private readonly files = new Map<string, string>();

  async list(): Promise<WorkspaceFile[]> {
    return [...this.files.entries()].map(([path, content]) => ({
      path,
      kind: "file",
      size: byteLength(content),
      updatedAt: new Date().toISOString()
    }));
  }

  async read(path: string): Promise<string> {
    const key = normalizePath(path);
    const content = this.files.get(key);
    if (content === undefined) throw new Error(`File not found: ${key}`);
    return content;
  }

  async write(path: string, content: string): Promise<WorkspaceFile> {
    const key = normalizePath(path);
    this.files.set(key, content);
    return { path: key, kind: "file", size: byteLength(content), updatedAt: new Date().toISOString() };
  }

  async delete(path: string): Promise<void> {
    const key = normalizePath(path);
    if (!this.files.delete(key)) throw new Error(`File not found: ${key}`);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(normalizePath(path));
  }
}

export interface WorkspaceSession {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  status: "active" | "closed";
}

export class WorkspaceSessionManager {
  private readonly sessions = new Map<string, WorkspaceSession>();

  create(projectId: string, userId: string): WorkspaceSession {
    const session: WorkspaceSession = {
      id: crypto.randomUUID(),
      projectId,
      userId,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(id: string): WorkspaceSession | undefined {
    return this.sessions.get(id);
  }

  close(id: string): WorkspaceSession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`Workspace session not found: ${id}`);
    session.status = "closed";
    return session;
  }
}