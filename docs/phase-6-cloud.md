# Phase 6 — Cloud, Deployment & Databases

## Delivered

- Provider-agnostic cloud resource contracts.
- Deployment lifecycle and rollback contract.
- Database provisioning/health abstractions for PostgreSQL, MySQL, MongoDB, and Redis.
- TLS enforcement for non-local database connections.
- Release manager that provisions cloud resources, databases, and deployments as one release operation and cleans up on failure.
- Local PostgreSQL and Redis development infrastructure.

## Production boundary

The adapters in this phase are intentionally provider-agnostic. `InMemory*Adapter` implementations are development/test adapters, not production cloud implementations. Production adapters can be added for AWS/GCP/Azure or another provider without changing the orchestration contracts.

No real cloud resource is provisioned by committing this code, and no production credentials are stored in Git.
