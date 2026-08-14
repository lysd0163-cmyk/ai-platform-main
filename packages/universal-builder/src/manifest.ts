import type { BuildManifest, FileManifestEntry, ProductSpec } from "./contracts";

function commonFiles(spec: ProductSpec): FileManifestEntry[] {
  return [
    { path: "README.md", purpose: "Project documentation and run instructions", stage: "documentation", generatedBy: "documentation" },
    { path: "package.json", purpose: "Workspace package metadata", stage: "scaffold", generatedBy: "software-engineer" },
    { path: "src/config.ts", purpose: "Validated runtime configuration", stage: "scaffold", generatedBy: "software-engineer" },
    { path: "tests/smoke.test.ts", purpose: "Critical path smoke test", stage: "testing", generatedBy: "testing" },
    { path: "docs/architecture.md", purpose: "Architecture decisions and boundaries", stage: "architecture", generatedBy: "documentation" },
    { path: "security/threat-model.md", purpose: "Threat model and security assumptions", stage: "security", generatedBy: "security" }
  ];
}

export function createManifest(spec: ProductSpec): BuildManifest {
  const files = commonFiles(spec);

  if (["web", "saas", "ecommerce", "crm", "erp"].some((type) => spec.types.includes(type as ProductSpec["primaryType"]))) {
    files.push(
      { path: "src/web/App.tsx", purpose: "Primary web application shell", stage: "implementation", generatedBy: "software-engineer" },
      { path: "src/web/routes.ts", purpose: "Application route map", stage: "implementation", generatedBy: "software-engineer" }
    );
  }

  if (spec.types.includes("api") || spec.architecture.backend) {
    files.push(
      { path: "src/server/index.ts", purpose: "Backend application entrypoint", stage: "implementation", generatedBy: "software-engineer" },
      { path: "src/server/health.ts", purpose: "Readiness and health checks", stage: "implementation", generatedBy: "devops" }
    );
  }

  if (["mobile"].some((type) => spec.types.includes(type as ProductSpec["primaryType"]))) {
    files.push({ path: "mobile/App.tsx", purpose: "Mobile application entrypoint", stage: "implementation", generatedBy: "software-engineer" });
  }

  if (spec.types.includes("desktop")) {
    files.push({ path: "desktop/main.ts", purpose: "Desktop application entrypoint", stage: "implementation", generatedBy: "software-engineer" });
  }

  if (spec.types.includes("game")) {
    files.push({ path: "game/src/game.ts", purpose: "Game runtime entrypoint", stage: "implementation", generatedBy: "software-engineer" });
  }

  if (spec.types.includes("bot")) {
    files.push({ path: "src/bot/index.ts", purpose: "Bot integration entrypoint", stage: "implementation", generatedBy: "software-engineer" });
  }

  return {
    projectId: spec.projectId,
    productType: spec.primaryType,
    stages: ["requirements", "architecture", "scaffold", "implementation", "testing", "security", "documentation", "release"],
    files,
    requiredServices: ["database", "identity", "observability"],
    environmentVariables: ["DATABASE_URL", "AUTH_SECRET", "PUBLIC_APP_URL"]
  };
}
