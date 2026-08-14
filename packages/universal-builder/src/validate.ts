import type { BuildManifest, BuildValidationIssue, ProductSpec } from "./contracts";

export function validateBuild(spec: ProductSpec, manifest: BuildManifest): BuildValidationIssue[] {
  const issues: BuildValidationIssue[] = [];
  const paths = new Set<string>();

  for (const file of manifest.files) {
    if (paths.has(file.path)) {
      issues.push({ severity: "error", code: "DUPLICATE_FILE", message: `Duplicate generated path: ${file.path}`, path: file.path });
    }
    paths.add(file.path);
  }

  if (manifest.files.length < 4) {
    issues.push({ severity: "error", code: "EMPTY_MANIFEST", message: "Builder produced an unexpectedly small project manifest" });
  }

  if ((spec.types.includes("web") || spec.types.includes("saas")) && !manifest.files.some((file) => file.path.includes("App.tsx"))) {
    issues.push({ severity: "error", code: "MISSING_WEB_ENTRY", message: "Web project has no application entrypoint" });
  }

  if (!manifest.environmentVariables.includes("DATABASE_URL")) {
    issues.push({ severity: "warning", code: "NO_DATABASE_CONFIG", message: "No database configuration variable is declared" });
  }

  if (!manifest.files.some((file) => file.stage === "testing")) {
    issues.push({ severity: "error", code: "NO_TESTS", message: "Every generated project must include automated tests" });
  }

  if (!manifest.files.some((file) => file.stage === "security")) {
    issues.push({ severity: "error", code: "NO_SECURITY_REVIEW", message: "Every generated project must include security review artifacts" });
  }

  return issues;
}
