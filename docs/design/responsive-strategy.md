# Responsive strategy

Both applications support a 320 px minimum viewport and use fluid layouts with Tailwind's mobile-first breakpoints.

## Public app

- The desktop primary navigation becomes a disclosure menu below the large breakpoint.
- Hero, metric, project, experience, and case-study grids collapse to a single readable column before adding columns as space permits.
- Content width is capped while page gutters remain fluid.
- Long case-study text, tags, URLs, and translated labels must wrap without horizontal page overflow.
- Resume styles include an A4-oriented print treatment that removes site chrome.

## Admin app

- The fixed desktop sidebar becomes a sheet navigation on smaller screens.
- Editors and settings fields collapse to one column; actions wrap rather than clip.
- Tables need a deliberate narrow-screen treatment for every added column—scrolling, stacking, or omission with an accessible alternative.
- Dialogs, bulk actions, filters, and message threads must remain usable by touch and keyboard at small sizes.

## Verification matrix

Exercise at least 320, 360, 768, 1024, and 1440 CSS pixels, plus 200%/400% zoom. Repeat with long German/French strings, Arabic RTL, large text, reduced motion, and both themes. Responsive screenshots are useful regression evidence but must be paired with interaction and overflow checks.
