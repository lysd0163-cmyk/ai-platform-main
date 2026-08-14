import type { BuilderRequest, ProductSpec, ProductType, ArchitectureSpec } from "./contracts";

const TYPE_HINTS: Record<ProductType, string[]> = {
  web: ["website", "web app", "dashboard", "portal"],
  api: ["api", "rest", "graphql", "backend service"],
  saas: ["saas", "subscription", "multi-tenant"],
  mobile: ["android", "ios", "mobile app", "phone"],
  desktop: ["desktop", "windows app", "mac app", "linux app"],
  game: ["game", "gaming", "multiplayer"],
  ecommerce: ["store", "shop", "ecommerce", "products", "cart"],
  crm: ["crm", "customers", "sales pipeline", "leads"],
  erp: ["erp", "inventory", "accounting", "procurement"],
  bot: ["bot", "telegram", "discord", "whatsapp", "chatbot"]
};

function detectTypes(text: string): ProductType[] {
  const value = text.toLowerCase();
  const matches = (Object.entries(TYPE_HINTS) as [ProductType, string[]][])
    .filter(([, hints]) => hints.some((hint) => value.includes(hint)))
    .map(([type]) => type);
  return matches.length ? matches : ["web"];
}

function architectureFor(types: ProductType[]): ArchitectureSpec {
  const hasMobile = types.includes("mobile");
  const hasDesktop = types.includes("desktop");
  return {
    frontend: types.includes("web") || types.includes("saas") || types.includes("ecommerce") || types.includes("crm") || types.includes("erp") ? "web-frontend" : undefined,
    backend: "service-backend",
    mobile: hasMobile ? "mobile-client" : undefined,
    desktop: hasDesktop ? "desktop-client" : undefined,
    database: "relational-database",
    api: "versioned-http-api",
    auth: "identity-and-access-layer",
    infrastructure: "containerized-runtime"
  };
}

export function planProduct(request: BuilderRequest): ProductSpec {
  if (!request.projectId.trim()) throw new Error("projectId is required");
  if (!request.name.trim()) throw new Error("name is required");
  if (!request.description.trim()) throw new Error("description is required");

  const detected = detectTypes(`${request.name} ${request.description}`);
  const types = [...new Set([...(request.requestedTypes ?? []), ...detected])];
  const primaryType = request.requestedTypes?.[0] ?? detected[0] ?? "web";

  return {
    projectId: request.projectId,
    name: request.name.trim(),
    description: request.description.trim(),
    primaryType,
    types,
    requirements: [
      "Functional requirements derived from the user request",
      "Non-functional requirements for reliability, security, and observability",
      "Automated test coverage for critical behavior",
      "Deployment and rollback readiness"
    ],
    constraints: request.constraints ?? [],
    architecture: architectureFor(types)
  };
}
