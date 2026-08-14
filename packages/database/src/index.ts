export type DatabaseEngine = "postgresql" | "mysql" | "mongodb" | "redis";

export interface DatabaseInstance {
  id: string;
  engine: DatabaseEngine;
  version: string;
  host: string;
  port: number;
  database: string;
  encrypted: boolean;
}

export interface DatabaseAdapter {
  provision(instance: DatabaseInstance): Promise<DatabaseInstance>;
  destroy(id: string): Promise<void>;
  healthCheck(id: string): Promise<boolean>;
}

export class InMemoryDatabaseAdapter implements DatabaseAdapter {
  private readonly instances = new Map<string, DatabaseInstance>();

  async provision(instance: DatabaseInstance) {
    this.instances.set(instance.id, instance);
    return instance;
  }

  async destroy(id: string) {
    this.instances.delete(id);
  }

  async healthCheck(id: string) {
    return this.instances.has(id);
  }
}

export interface Migration {
  id: string;
  up: string;
  down: string;
}

export interface DatabaseConnectionConfig {
  url: string;
  engine: DatabaseEngine;
  ssl: boolean;
}

export function validateConnection(config: DatabaseConnectionConfig): void {
  if (!config.url.trim()) throw new Error("Database URL is required");
  if (!config.ssl && !config.url.includes("localhost") && !config.url.includes("127.0.0.1")) {
    throw new Error("TLS is required for non-local database connections");
  }
}
