import type { CloudAdapter, CloudProject } from "@ai-os/cloud";
import type { DatabaseAdapter, DatabaseInstance } from "@ai-os/database";
import type { DeploymentAdapter, DeploymentArtifact, DeploymentRecord } from "@ai-os/deployment";

export interface ReleaseRequest {
  cloud: CloudProject;
  databases: DatabaseInstance[];
  artifact: DeploymentArtifact;
}

export interface ReleaseResult {
  deployment: DeploymentRecord;
  databaseIds: string[];
  cloudId: string;
}

export class ReleaseManager {
  constructor(
    private readonly cloud: CloudAdapter,
    private readonly database: DatabaseAdapter,
    private readonly deployments: DeploymentAdapter
  ) {}

  async release(request: ReleaseRequest): Promise<ReleaseResult> {
    const cloud = await this.cloud.provision(request.cloud);
    const databases: string[] = [];

    try {
      for (const instance of request.databases) {
        await this.database.provision(instance);
        databases.push(instance.id);
      }

      const deployment = await this.deployments.deploy(request.artifact);
      return { deployment, databaseIds: databases, cloudId: cloud.id };
    } catch (error) {
      for (const id of databases) await this.database.destroy(id);
      await this.cloud.destroy(request.cloud.id);
      throw error;
    }
  }
}
