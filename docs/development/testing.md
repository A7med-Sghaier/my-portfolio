# Testing

## Quality commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
pnpm test:e2e
```

Run migration and seed against an isolated test database before end-to-end tests. The browser scenarios mutate data: they create a contact conversation and create/update/delete a project. Never run them against production. Command presence is not evidence of a passing checkout; retain the output from the exact commit being released.

When `DATABASE_URL` is absent, the local Playwright web server uses the same bundled PostgreSQL startup path as `pnpm dev`. Set `DATABASE_URL` explicitly to an isolated PostgreSQL database when preserving local development data matters. `E2E_API_PORT`, `E2E_PORTFOLIO_PORT`, and `E2E_ADMIN_PORT` can isolate the three test servers from an already-running development session.

## Test layers

- `packages/core` — schema acceptance/rejection and domain contracts
- `packages/db` — API client behavior, both migrations, frozen seed checksum/count parity, repository persistence, batched full-thread inbox reads, visibility, auth sessions, and content transactions
- `apps/api` — public/auth/admin HTTP behavior, split origin/CSRF boundaries, layered limits, shared PostgreSQL rate-limit storage, retention, and safe errors
- `packages/i18n` — 772-key locale parity, interpolation, formatting, preference persistence, and Arabic RTL direction
- `packages/ui` — primitive semantics and interaction behavior
- `apps/portfolio` — normalization, loaders/actions, content components, command palette, deterministic assistant, architecture diagram, locale paths, and SEO/structured data
- `apps/admin` — form safety, resource configuration, auth routing, thread-aware inbox filtering/sorting/export, resource workflows, and editor behavior
- `e2e` — browser journeys for the two independently served applications

The complete current file list is maintained in [the inventory](../inventory.md).

The default API unit run avoids opening an ephemeral listener because some restricted development sandboxes prohibit it. Run the same Supertest contract suite with real HTTP binding in CI or an unrestricted local shell:

```sh
pnpm --filter @portfolio/api test:integration
```

Security and parity regression coverage includes:

- `apps/api/tests/app.test.ts` for disjoint public/admin origin behavior, separate anonymous CSRF tokens, session-bound administrative CSRF, private/no-store responses, validation, and claim-reference issuance;
- `apps/api/tests/rate-limit-store.test.ts` for cross-instance counters, hashed keys, scope isolation, reset/decrement, and expiry purge;
- `packages/db/tests/database.test.ts` plus `seed-manifest.ts` for both migrations, frozen seed bytes/checksum, exact parent/child counts, private-record filtering, session revocation, ticket claims, imports, reset, and bounded retention;
- `packages/db/tests/client.test.ts` for separate public/admin CSRF caches;
- `apps/admin/src/lib/messages-view.test.ts` and `router-workflows.test.ts` for full-thread reply state, waiting sort, filters, portable/ZIP exports, bulk actions, CRUD/reorder, settings/reset/import, and integration failure routing;
- portfolio component/library tests for keyboard command navigation, content-derived assistant answers, architecture trace semantics, and locale-preserving paths.

## Manual release checks

At minimum, use keyboard-only navigation and verify:

- public navigation, all locales, Arabic RTL, theme switching, reduced motion, and a 404;
- project list/detail plus loading, empty, and API-error states;
- contact validation/submission and ticket lookup/reply without exposing another visitor's data;
- admin anonymous redirect, login failure/success, CRUD/reorder, inbox status/read/reply, backup import confirmation, reset confirmation, and logout;
- small mobile, tablet, desktop, and wide desktop layouts;
- console/network failures, cookie attributes, CORS, CSP, and cache headers.

Use an accessibility scanner as a supplement to—not a replacement for—semantic, focus, keyboard, contrast, and screen-reader review.
