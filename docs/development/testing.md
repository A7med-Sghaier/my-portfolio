# Testing

## Quality commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

Command presence is not evidence of a passing checkout; retain the output from the exact commit being released.

## Test layers

- `packages/core` — schema acceptance/rejection and domain contracts
- `packages/api-client` — typed request construction and separate public/admin CSRF caches
- `packages/i18n` — locale key parity across the four locales, interpolation, formatting, preference persistence, and Arabic RTL direction
- `packages/ui` — primitive semantics and interaction behavior
- `apps/portfolio` — normalization, loaders/actions, content components, command palette, deterministic assistant fallback, architecture diagram, locale paths, and SEO/structured data

Every new UI string must be added to all four message files in `packages/i18n/src/messages/`, and the exact key-count assertion in `packages/i18n/src/i18n.test.tsx` must be bumped to match. That assertion is the parity guard — a key added to one locale and forgotten in another fails the suite.

The API, the admin studio, the PostgreSQL layer, and the end-to-end browser journeys live in a separate private repository and are covered by its own suites.

## Manual release checks

At minimum, use keyboard-only navigation and verify:

- public navigation, all locales, Arabic RTL, theme switching, reduced motion, and a 404;
- project list/detail plus loading, empty, and API-error states;
- contact validation/submission and ticket lookup/reply without exposing another visitor's data;
- the assistant's degraded path — with the API returning `502 assistant_failed`, the widget must still answer from the grounded keyword matcher;
- small mobile, tablet, desktop, and wide desktop layouts;
- console/network failures, cookie attributes, CORS, CSP, and cache headers.

Use an accessibility scanner as a supplement to—not a replacement for—semantic, focus, keyboard, contrast, and screen-reader review.
