# System overview

The platform has four operational units:

1. A static public React app on port `4173` in local development.
2. A static authenticated admin React app on port `4174`.
3. A Node/Express API on port `4100`.
4. PostgreSQL 16 on port `54329` locally.

Both browser apps use React Router data loaders/actions and the typed client from `@portfolio/api-client`. The API is the only component allowed to use the PostgreSQL repository. Shared Zod contracts define data at every boundary.

The recommended production routing pattern is:

```text
public origin /api/*  -> API service
admin origin  /api/*  -> API service
all other public paths -> public index.html
all other admin paths  -> admin index.html
```

This keeps cookies same-origin for each UI while preserving independent static deployments. The browser builds contain no database, operator, or integration secrets.

For decision rationale, use [ADR-001](ADR-001-application-architecture.md).
