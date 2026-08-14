export type ProductType =
  | "web"
  | "api"
  | "saas"
  | "mobile"
  | "desktop"
  | "game"
  | "ecommerce"
  | "crm"
  | "erp"
  | "bot";

export type BuildStage =
  | "requirements"
  | "architecture"
  | "scaffold"
  | "implementation"
  | "testing"
  | "security"
  | "documentation"
  | "release";

export interface BuilderRequest {
  projectId: string;
  name: string;
  description: string;
  requestedTypes?: ProductType[];
  constraints?: string[];
}

export interface ProductSpec {
  projectId: string;
  name: string;
  description: string;
  primaryType: ProductType;
  types: ProductType[];
  requirements: string[];
  constraints: string[];
  architecture: ArchitectureSpec;
}

export interface ArchitectureSpec {
  frontend?: string;
  backend?: string;
  mobile?: string;
  desktop?: string;
  database?: string;
  api?: string;
  auth?: string;
  infrastructure?: string;
}

export interface FileManifestEntry {
  path: string;
  purpose: string;
  stage: BuildStage;
  generatedBy: string;
}

export interface BuildManifest {
  projectId: string;
  productType: ProductType;
  stages: BuildStage[];
  files: FileManifestEntry[];
  requiredServices: string[];
  environmentVariables: string[];
}

export interface BuildValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
}

export interface BuildResult {
  spec: ProductSpec;
  manifest: BuildManifest;
  issues: BuildValidationIssue[];
}
