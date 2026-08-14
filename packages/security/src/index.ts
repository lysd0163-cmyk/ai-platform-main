export type Role = "owner" | "admin" | "developer" | "viewer" | "billing";
export type Permission = "project:read" | "project:write" | "project:deploy" | "secrets:read" | "secrets:write" | "billing:read" | "billing:write" | "org:admin" | "audit:read";

export interface Policy { role: Role; permissions: Permission[]; }
export interface SecretRef { id: string; name: string; provider: "env" | "vault" | "external"; encrypted: boolean; }
export interface AuditEvent { id: string; actorId: string; action: string; resource: string; timestamp: string; metadata: Record<string, unknown>; }

export class Rbac {
  private readonly policies = new Map<Role, Set<Permission>>();
  constructor(policies: Policy[] = []) { for (const policy of policies) this.policies.set(policy.role, new Set(policy.permissions)); }
  allow(role: Role, permission: Permission): boolean { return this.policies.get(role)?.has(permission) ?? false; }
  require(role: Role, permission: Permission): void { if (!this.allow(role, permission)) throw new Error(`Permission denied: ${role} -> ${permission}`); }
}

export class AuditLog {
  private readonly events: AuditEvent[] = [];
  append(event: AuditEvent): void { this.events.push(event); }
  list(limit = 100): AuditEvent[] { return this.events.slice(-limit); }
}

export class SecretStore {
  private readonly refs = new Map<string, SecretRef>();
  register(ref: SecretRef): void { if (!ref.encrypted) throw new Error("Secrets must be encrypted at rest"); this.refs.set(ref.id, ref); }
  get(id: string): SecretRef | undefined { return this.refs.get(id); }
  list(): SecretRef[] { return [...this.refs.values()]; }
}

export function requireStrongSecret(name: string, value: string): void {
  if (!value || value.length < 16) throw new Error(`Secret ${name} is too short`);
}
