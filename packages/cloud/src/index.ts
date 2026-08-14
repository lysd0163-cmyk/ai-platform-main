export type CloudProvider = "aws" | "gcp" | "azure" | "generic";

export interface ResourceSpec {
  cpu: number;
  memoryMb: number;
  replicas: number;
}

export interface CloudProject {
  id: string;
  name: string;
  provider: CloudProvider;
  region: string;
  resources: ResourceSpec;
}

export interface StorageSpec {
  name: string;
  sizeGb: number;
  encrypted: boolean;
}

export interface CloudAdapter {
  provision(project: CloudProject): Promise<{ id: string; status: "provisioned" }>;
  destroy(projectId: string): Promise<void>;
}

export class InMemoryCloudAdapter implements CloudAdapter {
  private readonly projects = new Map<string, CloudProject>();

  async provision(project: CloudProject) {
    this.projects.set(project.id, project);
    return { id: project.id, status: "provisioned" as const };
  }

  async destroy(projectId: string) {
    this.projects.delete(projectId);
  }
}
