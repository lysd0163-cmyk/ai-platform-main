import type { Project, Workspace } from "@ai-os/ai-core";

export interface ProjectRepository {
  createWorkspace(workspace: Workspace): Promise<Workspace>;
  createProject(project: Project): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly workspaces = new Map<string, Workspace>();
  private readonly projects = new Map<string, Project>();

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  async createProject(project: Project): Promise<Project> {
    if (!this.workspaces.has(project.workspaceId)) throw new Error("Workspace does not exist");
    this.projects.set(project.id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }
}
