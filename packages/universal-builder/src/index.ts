export * from "./contracts";
export * from "./planner";
export * from "./manifest";
export * from "./validate";

import type { BuilderRequest, BuildResult } from "./contracts";
import { planProduct } from "./planner";
import { createManifest } from "./manifest";
import { validateBuild } from "./validate";

export function createBuildPlan(request: BuilderRequest): BuildResult {
  const spec = planProduct(request);
  const manifest = createManifest(spec);
  const issues = validateBuild(spec, manifest);
  return { spec, manifest, issues };
}
