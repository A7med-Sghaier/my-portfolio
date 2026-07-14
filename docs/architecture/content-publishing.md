# Content publishing

## Visibility contract

The database is the content source of truth. Public queries enforce these rules in the repository:

- the primary profile must be `published`;
- projects must be both `published` and `public`;
- experience, education, expertise, hero metrics, performance metrics, and principles must be `published` and not hidden;
- services must be `published`, and the curated technology ecosystem is returned in its persisted order;
- persisted profile overrides are validated and merged over the published primary profile;
- only settings marked `is_public` are included in the public content response.

Draft, private, and hidden records remain available to authenticated administrative reads but never appear through public endpoints.

## Editing flow

1. Sign in to the admin application.
2. Create or update a record through its resource route.
3. Validate content, links, visibility, and sort order before publishing.
4. Verify the public route and locale after the mutation completes.
5. Export a content snapshot before destructive imports or a reset.

Resource writes are validated by the corresponding shared Zod schema. Multi-table project and expertise writes, reorders, imports, and resets use transactions where several statements must succeed together.

## Localization

The UI catalog provides 608 identical keys for `en`, `de`, `fr`, and `ar`. Arabic selects RTL document direction. Locale selection is represented by the `lang` query parameter and persisted as a non-sensitive preference.

Dynamic content uses English base records plus rows in `translations` for German, French, and Arabic fields. The repository overlays validated translated fields when a public request supplies `?locale=de`, `?locale=fr`, or `?locale=ar`; English is the fallback base.

## Content snapshots

The authenticated export/import API uses a versioned, schema-validated JSON snapshot. Imports support:

- `merge` — upsert matching identifiers and retain records not present in the snapshot;
- `replace` — replace the snapshot-managed content slices in one transaction.

Messages, message threads, admin users, sessions, password hashes, and environment secrets are never part of a content snapshot. See [backup and restore](../deployment/backup-and-restore.md) for the distinction between content exports and full database recovery.

The managed snapshot includes profiles and overrides, projects, experience, education, expertise, hero/performance metrics, principles, translations, services, technology ecosystem entries, and settings.
