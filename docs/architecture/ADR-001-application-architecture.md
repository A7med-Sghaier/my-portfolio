# ADR-001: Split browser applications behind one API

- Status: accepted
- Decision date: 2026-07-13

## Context

The public portfolio optimizes for discoverability, fast anonymous reads, responsive presentation, localization, and contact conversion. The administration surface optimizes for authenticated editing, inbox workflows, and operational safeguards. They have different release, cache, security-header, and failure-isolation needs, while sharing the same content model.

## Decision

Use a pnpm workspace with:

- two independent React 18/Vite/React Router 7 applications;
- one Express API as the only browser-to-data boundary;
- one plain PostgreSQL database;
- shared core contracts, API client, translations, and UI primitives.

Each browser app produces its own static artifact. In production, each origin proxies `/api` to the API so credentialed requests remain same-origin. The API can be deployed separately from either browser app.

## Consequences

Benefits:

- public and administrative code do not ship in the same browser bundle;
- either UI can be released, cached, scaled, or rolled back independently;
- authentication and data policy live in one server boundary;
- shared packages prevent contract and visual drift without coupling app routing.

Costs:

- three runtime services plus PostgreSQL must be operated;
- SPA hosting needs history fallbacks and `/api` reverse proxies;
- shared package build order matters for packages that expose compiled output;
- database migrations must remain compatible with independently released clients.

## Guardrails

- Browser code never receives server secrets or database credentials.
- Administrative authorization is enforced by the API, not by route hiding.
- Public queries return only published, visible records.
- Package dependencies flow from apps to shared packages, never from shared packages back to apps.
