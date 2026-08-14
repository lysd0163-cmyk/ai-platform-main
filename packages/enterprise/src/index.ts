import type { Permission, Role, Rbac } from "@ai-os/security";

export interface Organization { id: string; name: string; slug: string; planId: string; }
export interface Workspace { id: string; organizationId: string; name: string; slug: string; }
export interface Membership { userId: string; organizationId: string; role: Role; permissions: Permission[]; active: boolean; }
export interface SsoConfiguration { organizationId: string; provider: "saml" | "oidc"; enabled: boolean; issuer?: string; clientId?: string; }

export class EnterpriseDirectory {
  private readonly organizations = new Map<string, Organization>();
  private readonly workspaces = new Map<string, Workspace>();
  private readonly memberships: Membership[] = [];
  private readonly sso = new Map<string, SsoConfiguration>();

  createOrganization(input: Organization): Organization { this.organizations.set(input.id, input); return input; }
  createWorkspace(input: Workspace): Workspace {
    if (!this.organizations.has(input.organizationId)) throw new Error("Organization does not exist");
    this.workspaces.set(input.id, input); return input;
  }
  addMember(input: Membership): Membership {
    if (!this.organizations.has(input.organizationId)) throw new Error("Organization does not exist");
    this.memberships.push(input); return input;
  }
  listMembers(organizationId: string): Membership[] { return this.memberships.filter((m) => m.organizationId === organizationId && m.active); }
  configureSso(config: SsoConfiguration): void { this.sso.set(config.organizationId, config); }
  getSso(organizationId: string): SsoConfiguration | undefined { return this.sso.get(organizationId); }
  authorize(userId: string, organizationId: string, permission: Permission, rbac: Rbac): void {
    const member = this.memberships.find((m) => m.userId === userId && m.organizationId === organizationId && m.active);
    if (!member) throw new Error("Active organization membership required");
    if (!member.permissions.includes(permission)) throw new Error(`Membership permission missing: ${permission}`);
    rbac.require(member.role, permission);
  }
}
