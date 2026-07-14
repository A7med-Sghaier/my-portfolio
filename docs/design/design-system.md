# Design system

Shared UI lives in `packages/ui`; both applications import its public exports and `@portfolio/ui/styles.css`.

## Foundations

`packages/ui/src/styles.css` defines semantic OKLCH tokens for background, foreground, cards, muted surfaces, signal colors, destructive/success/warning states, borders, inputs, charts, focus rings, radii, shadows, and display/sans/mono fonts. Light and dark values use the same semantic names. RTL swaps to Arabic-capable font tokens and mirrors directional icons.

## Component layers

- Primitives: `Button`, `Badge`, `TechTag`, `Card`, `Input`, `Textarea`, `Select`, `Table`, and `Alert`
- Form composition: `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`
- Overlays: `Dialog` and `Sheet` families
- States: `Skeleton` and `PageState`
- Layout: `PageContainer`, `Section`, `SectionHeading`, `Panel`, metric components, `ActionLink`, and `GridBackdrop`
- Motion: `Reveal`, `Stagger`, `StaggerItem`, `CountUp`, duration/easing tokens

Application-specific components stay inside their app: public content cards/timelines/SEO and admin shell/editor/message/settings views are not general-purpose primitives.

## Contribution rules

- Reuse a semantic token before adding a raw color or shadow.
- Add a shared component only when both apps can use the same behavior and API.
- Keep accessible names, keyboard behavior, focus, error association, RTL, and reduced motion part of the component contract.
- Prefer composition over a large set of unrelated boolean props.
- Add or update a test and Storybook state for meaningful shared behavior.
- Treat `src/index.ts` as the supported package API; avoid cross-package deep imports.

See [Storybook](../development/storybook.md) for the current story inventory.
