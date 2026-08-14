# Production Deployment

## Required secrets

Never commit secrets. Configure them in the deployment platform:

- `OPENAI_API_KEY`
- database credentials/URLs
- cloud credentials
- integration OAuth secrets
- billing provider credentials
- identity/SSO credentials

## Release gates

A release is ready only when:

1. CI passes typecheck, tests, and lint.
2. Production secrets are configured through a secret manager.
3. Database migrations are reviewed and backed up.
4. Sandbox execution uses a hardened container/VM adapter, not the local process adapter.
5. Cloud, payment, identity, broker, and media adapters have been configured for the target environment.
6. Health checks and rollback are verified.
7. Audit logging and rate limits are enabled.
8. Observability and alerting are enabled.

## Deployment topology

Web -> API -> Orchestrator -> Agents/LLM -> Tools
                     |-> Database
                     |-> Workflow/MCP integrations
                     |-> Cloud/Deployment
                     |-> Billing/Enterprise

Long-running work should run through workers/queues rather than blocking HTTP requests.
