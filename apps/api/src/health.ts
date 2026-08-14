export interface HealthStatus {
  status: "ok" | "degraded";
  version: string;
  timestamp: string;
}

export function health(version = "0.1.0"): HealthStatus {
  return { status: "ok", version, timestamp: new Date().toISOString() };
}
