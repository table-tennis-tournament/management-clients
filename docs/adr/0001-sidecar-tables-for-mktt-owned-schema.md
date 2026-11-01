# Sidecar tables for state not owned by mktt

The Spring Boot backend shares one MariaDB schema with **mktt**, a third-party fat client that creates and owns most tables (`matches`, `player`, `tables`, `type`, …). mktt's schema may not be altered — adding a column breaks the fat client. So instead of `ALTER TABLE`-ing mktt tables to persist backend-only state (the original `matc_callstate`, `tabl_locked`, `play_active` columns), we store that state in dedicated `mgmt_`-prefixed **sidecar tables** keyed by the mktt primary key. Absence of a row means the default value: no call announced, table unlocked, player active.

## Considered Options

- **`ALTER TABLE` to add columns** — rejected: mutates mktt-owned schema, breaks the fat client.
- **Shadow/duplicate tables mirroring mktt** — rejected: duplicates data and invites drift.
- **Sidecar tables (`mgmt_match_call_state`, `mgmt_table_lock`, `mgmt_player_active`)** — chosen: additive, never touches mktt DDL, read via `LEFT JOIN` + `COALESCE`.

## Consequences

- Flyway only ever creates `mgmt_`-prefixed tables; the mktt schema is declared in a test-only migration (`V50__mktt_schema.sql`) so H2 tests have the base tables without Flyway owning them in production.
- Backend state lookups require a `LEFT JOIN` to the sidecar table; defaults are expressed with `COALESCE` (unlocked `0`, active `1`).
