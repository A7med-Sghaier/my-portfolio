# Storybook

The shared UI package owns Storybook because both applications consume the same primitives and tokens.

```sh
pnpm storybook
pnpm build-storybook
```

The development server uses port `6006`; the static artifact is written to `packages/ui/storybook-static` and is ignored by Git.

Current story modules:

- `foundations.stories.tsx` — color, typography, spacing, and surface foundations
- `primitives.stories.tsx` — buttons, badges, cards, fields, selects, and tables
- `overlays.stories.tsx` — dialogs and sheets
- `states.stories.tsx` — loading, empty, error, and alert states
- `motion.stories.tsx` — reveal, stagger, and count-up behavior

The accessibility addon is configured for component checks. Stories should cover light/dark, keyboard behavior, long content, RTL where relevant, reduced motion, and responsive widths before a shared component is considered stable.
