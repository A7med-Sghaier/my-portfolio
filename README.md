<div align="center">

<img src="./assets/banner.svg" width="100%" alt="Ahmed Sghaier — Portfolio Platform" />

<br/>

<a href="https://github.com/A7med-Sghaier/my-portfolio">
  <img src="https://readme-typing-svg.demolab.com?font=Segoe+UI&weight=600&size=20&pause=1000&color=2DD4BF&center=true&vCenter=true&width=760&lines=Public+portfolio+SPA+%C2%B7+API-driven+%C2%B7+no+mocked+data;React+18+%C2%B7+Vite+6+%C2%B7+Tailwind+4+%C2%B7+React+Router+7;Four+locales+%C2%B7+EN+%2F+DE+%2F+FR+%2F+AR+%C2%B7+full+RTL;Grounded+AI+assistant+%C2%B7+deterministic+fallback" alt="Public portfolio SPA — API-driven, four locales, grounded AI assistant with a deterministic fallback." />
</a>

<br/><br/>

[![CI](https://github.com/A7med-Sghaier/my-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/A7med-Sghaier/my-portfolio/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

![pnpm](https://img.shields.io/badge/pnpm_workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![i18n](https://img.shields.io/badge/EN_·_DE_·_FR_·_AR-2DD4BF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-3DA639?style=flat-square&logo=opensourceinitiative&logoColor=white)

</div>

The **public site** of a production personal platform: a React 18 single-page
application driven entirely by a live REST API, speaking **four languages**
(EN · DE · FR · AR) with **full RTL** support, and answering visitor questions
through a **grounded AI assistant** that degrades to a deterministic keyword
matcher rather than ever going dark. This repository also holds the shared
**design system**, **domain schemas**, **locale catalogues**, and **typed API
client** the platform is built from.

> [!NOTE]
> There is **no mocked runtime data**. Every page — profile, experience,
> projects, expertise, and UI copy — is fetched from the API at runtime, so what
> you see running locally is the same code path that serves production.

<div align="center"><img src="./assets/divider.svg" width="70%" alt="" /></div>

## Gallery

|                                                                                       |                                                                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Public portfolio** — aurora hero, cursor spotlight, live status console             | **Projects** — case-study grid driven by the API                                      |
| <img src="docs/images/portfolio-home.png" alt="Portfolio home" width="420">           | <img src="docs/images/portfolio-projects.png" alt="Projects grid" width="420">        |
| **Case study** — metrics, architecture, evidence, live GitHub sync                    | **Portfolio assistant** — grounded in published content only                          |
| <img src="docs/images/portfolio-project-detail.png" alt="Project detail" width="420"> | <img src="docs/images/portfolio-assistant.png" alt="Portfolio assistant" width="420"> |

<div align="center"><img src="./assets/divider.svg" width="70%" alt="" /></div>

## Architecture

```mermaid
flowchart LR
    B((Browser)) -->|HTTPS| P["portfolio SPA<br/>React 18 · nginx"]
    P -.->|"/api (same-origin)"| API["REST API<br/>private repository"]
    API --> DB[("PostgreSQL")]

    subgraph Shared["this repository"]
        direction TB
        C["packages/core<br/>zod schemas · domain types"]
        AC["packages/api-client<br/>typed browser client"]
        I["packages/i18n<br/>EN · DE · FR · AR"]
        U["packages/ui<br/>design system · Storybook"]
    end

    P --- Shared
```

| Workspace             | What it is                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/portfolio`      | Public site — React 18 + Vite + Tailwind 4, React Router 7 data routers, four locales, AI assistant, live AI Lab, motion system, command palette, PDF résumé export |
| `packages/core`       | Shared domain types and zod validation schemas — the contract at every boundary                                                                                     |
| `packages/api-client` | The typed browser API client. Zero runtime dependencies; imports only _types_ from `core`                                                                           |
| `packages/i18n`       | Locale catalogues and helpers, with a key-parity assertion guarding all four languages                                                                              |
| `packages/ui`         | Design-system primitives with Storybook coverage and accessibility addon                                                                                            |

### Why the client is its own package

`packages/api-client` is the seam between browser and server. It carries the
full typed surface of the API and **no runtime dependencies** — it imports only
types from `core`, so nothing server-side can leak into a browser bundle through
it. That property is what lets the public application and the private API live in
different repositories without either duplicating the contract.

### The assistant never goes dark

`POST /api/assistant/ask` returns a model answer grounded in the published
content the site already renders — draft, hidden, and private records are
filtered out before the model ever sees them. When the model errors or times
out, the endpoint returns `502` and the widget falls back to
`answerPortfolioQuestion`, a deterministic multilingual keyword matcher over the
same facts. The degraded path is a **designed** path, not an accident, and it is
covered by tests. Details in
[docs/architecture/portfolio-assistant.md](docs/architecture/portfolio-assistant.md).

<div align="center"><img src="./assets/divider.svg" width="70%" alt="" /></div>

## Quick start

Requirements: Node.js 20.11+ (22 LTS via `.nvmrc`) and pnpm 9.15.

```sh
pnpm install
pnpm dev
```

The site starts on `http://127.0.0.1:4173`.

Point it at an API with `VITE_API_URL` (see `apps/portfolio/.env.example`):

| Value             | Behaviour                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------ |
| _empty_ (default) | Calls go to the serving origin's `/api`; the dev server proxies to `VITE_API_PROXY_TARGET` |
| An absolute URL   | Calls go directly to that API                                                              |

Because the public endpoints are public, pointing `VITE_API_URL` at the live
production API renders the real site content on a fresh clone.

## Quality gates

```sh
pnpm lint            # ESLint across apps and packages
pnpm typecheck       # strict TypeScript everywhere
pnpm test            # Vitest unit suites
pnpm build           # production build
pnpm storybook       # design-system workbench
```

CI runs formatting, lint, typecheck, unit tests, the production build, and a
Storybook build on every push and pull request.

## Repository structure

```text
apps/portfolio        Public single-page application
packages/core         Domain types and zod schemas
packages/api-client   Typed browser API client
packages/i18n         EN · DE · FR · AR catalogues
packages/ui           Design-system components + Storybook
docs/architecture     Decision records and feature designs
docs/design           Design system, accessibility, responsive strategy
docker/nginx          Static-runtime server configuration
```

## Related

The REST API, the admin content studio, the PostgreSQL schema and migrations,
and the deployment pipeline live in a separate private repository. This
repository is consumed there as a submodule, and its container image is built
here and published to GHCR.

## Documentation

|                                                                                             |                                                               |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [ADR-001 — application architecture](docs/architecture/ADR-001-application-architecture.md) | [System overview](docs/architecture/system-overview.md)       |
| [Portfolio assistant](docs/architecture/portfolio-assistant.md)                             | [Content publishing](docs/architecture/content-publishing.md) |
| [Design system](docs/design/design-system.md)                                               | [Accessibility](docs/design/accessibility.md)                 |
| [Responsive strategy](docs/design/responsive-strategy.md)                                   | [Testing](docs/development/testing.md)                        |
| [Storybook](docs/development/storybook.md)                                                  |                                                               |

<div align="center">

<img src="./assets/divider.svg" width="50%" alt="" />

**Ahmed Sghaier** · Senior Full-Stack Engineer
[a7med-sghaier.app](https://a7med-sghaier.app) · [GitHub](https://github.com/A7med-Sghaier) · [LinkedIn](https://www.linkedin.com/in/ahmed-sghaier-449778137)

</div>

## License

Released under the [MIT License](LICENSE).
