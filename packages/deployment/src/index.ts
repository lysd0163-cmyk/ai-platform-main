export type DeploymentStatus = "pending" | "building" | "deploying" | "healthy" | "failed" | "rolled_back";

export interface DeploymentArtifact {
  projectId: string;
  version: string;
  image?: string;
  entrypoint: string;
  environment: Record<string, string>;
}

export interface DeploymentRecord {
  id: string;
  artifact: DeploymentArtifact;
  status: DeploymentStatus;
  url?: string;
  createdAt: string;
}

export interface DeploymentAdapter {
  deploy(artifact: DeploymentArtifact): Promise<DeploymentRecord>;
  rollback(deploymentId: string): Promise<void>;
}

export class InMemoryDeploymentAdapter implements DeploymentAdapter {
  private readonly deployments = new Map<string, DeploymentRecord>();

  async deploy(artifact: DeploymentArtifact): Promise<DeploymentRecord> {
    const record: DeploymentRecord = {
      id: crypto.randomUUID(),
      artifact,
      status: "healthy",
      url: `https://${artifact.projectId}.local`,
      createdAt: new Date().toISOString()
    };
    this.deployments.set(record.id, record);
    return record;
  }

  async rollback(deploymentId: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) throw new Error(`Deployment not found: ${deploymentId}`);
    deployment.status = "rolled_back";
  }
}
