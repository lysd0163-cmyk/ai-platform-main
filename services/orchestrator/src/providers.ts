import { MultiModelRouter, OpenAIProvider } from "@ai-os/model-router";

export function createDefaultModelRouter(): MultiModelRouter {
  const router = new MultiModelRouter();
  const models = (process.env.AI_OS_OPENAI_MODELS ?? "gpt-5.5")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  router.register(new OpenAIProvider({
    models,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID
  }));

  return router;
}
