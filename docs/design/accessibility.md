# Accessibility

The implementation targets WCAG 2.2 AA, but conformance must be verified against each release and deployed response.

## Implemented foundations

- Public and admin shells provide skip links and stable main landmarks.
- Route changes move focus to the main heading/content region.
- Focus-visible outlines are defined globally and are not removed from controls.
- Native form labels, validation feedback, live status/error regions, and disabled/pending states are used where applicable.
- Dialog, select, and sheet behavior builds on accessible primitives.
- Navigation exposes active/expanded state and has a keyboard-operable mobile form.
- Color tokens have light/dark pairs; status UI combines text with color/icon treatment.
- Global reduced-motion media queries minimize animation and smooth scrolling.
- The locale provider updates document `lang` and `dir`; Arabic uses RTL layout and language-appropriate font tokens.

## Required verification

For public and admin applications:

1. Navigate every route and form with keyboard only.
2. Check focus order, visible focus, dialog focus trap/return, and route-change focus.
3. Review headings, landmarks, labels, errors, tables, link names, image alternatives, and live announcements with a screen reader.
4. Test 200% and 400% zoom, small widths, long translations, Arabic RTL, dark mode, high contrast, and reduced motion.
5. Run the component accessibility addon and browser scanner; triage every violation manually.
6. Confirm contrast with rendered fonts and real states, including disabled and destructive controls.

Automated results detect regressions but do not establish conformance on their own.
