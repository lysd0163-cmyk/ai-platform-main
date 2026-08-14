# AI OS Release Checklist

Before production release:

- typecheck passes
- unit tests pass
- security review passes
- environment/config validation passes
- database migrations are reviewed
- smoke tests pass
- secrets are externalized
- high-risk tools remain approval-gated
- production sandbox uses hardened isolation
- external providers are configured with real adapters
- rollback path is verified
