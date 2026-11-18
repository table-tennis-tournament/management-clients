# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A table tennis tournament manager: a Kotlin/Spring Boot backend and three Angular 21 single-page applications.
The tournament database is prepared offline by **mktt**, a third-party tool; this system runs the tournament on it.

| Path | What | Notes |
|---|---|---|
| `management-backend/` | Kotlin 2.4, Spring Boot 4.1, Spring Modulith 2.1, Java 25 | The backend. Module rules: `management-backend/agents.md` |
| `admin-view/` | Angular SPA for the tournament administrator (dev port 4201) | standalone components, ngrx |
| `tablemanager-view/` | Angular SPA for a table manager (dev port 4200) | standalone components, ngrx |
| `result-view/` | Angular SPA, public result display (dev port 4202) | NgModules, ngrx |
| `backend/` | Legacy Scala/Play backend | Not built, tested or deployed. Read it only as a reference for logic not migrated yet (knockout placement, `writeNextKoMatch`) |
| `testdata/` | mktt database dumps | `create-saturday.sql`/`create-sunday.sql` seed `docker compose`; `create-tables.sql` seeds the admin-view and tablemanager-view e2e tests |
| `Dockerfile-clients`, `my_server_block.conf` | The one clients image | nginx serves `/admin-view`, `/result-view`, `/tablemanager-view` and proxies `/api/v2` and `/ttt-websocket` |
| `docs/arc42/` | Architecture (arc42 with C4-PlantUML diagrams) | `docs/adr/` holds the ADRs |

Read before changing behaviour:

- `GLOSSARY.md`: the domain language. Use its terms in code, docs and UI (**Take back**, not "stop"; **Side**, not "team").
- `docs/adr/`: why the schema, the WebSocket and the update events look the way they do.
- `docs/follow-ups.md` and `docs/test-improvement-plan.md`: known gaps and how the tests are built.
- `spec/`: functional specifications per area, with every `/api/v2` endpoint. The OpenAPI description is at
  `http://localhost:8080/v3/api-docs` (Swagger UI: `/api-docs-ui`).

## Commands

Backend (`cd management-backend`; there is no Maven wrapper, use `mvn`):

```bash
mvn test                                                   # all tests, H2 in MySQL mode
mvn test -DupdateExpected=true && git diff src/test/resources/expected   # re-record expected JSON, then review the diff
mvn test-compile org.pitest:pitest-maven:mutationCoverage  # mutation tests of the domain packages
mvn spring-boot:run -Dspring-boot.run.profiles=local       # starts management-backend/docker-compose.yml (MariaDB on 3307) and the backend
```

The `local` profile's database has no mktt tables, so most endpoints fail until a dump from `testdata/` is loaded.
For a seeded system use the root `docker compose` below.

Clients (`cd admin-view`, `result-view` or `tablemanager-view`): `npm start`, `npm run build`, `npm run lint`,
`npm run format:check`, `npm test` (Vitest), `npm run test:types`, `npm run e2e` (Playwright).
Vitest strips types without checking them, and its tests do not compile templates: after changing a spec run
`npm run test:types`, after changing a template run `npm run build`.

Full system: `docker compose up -d --build` starts MariaDB, CUPS, the backend (port 8080) and the clients image
(port 80). The e2e tests need this stack. The admin-view and tablemanager-view e2e setups replace the database with
`testdata/create-tables.sql`, and their teardown runs `docker compose down -v`, which deletes the database volume.

## Rules that are easy to break

- **mktt owns the schema.** Never alter mktt's tables (`matches`, `player`, `tables`, `type`, …). Backend-only state
  lives in `mgmt_`-prefixed sidecar tables created by Flyway (`management-backend/src/main/resources/db/migration`,
  ADR 0001). Tests get mktt's tables from the test-only migration `V50__mktt_schema.sql`.
- **Every state change publishes an update event.** REST lives under `/api/v2`. The `outbound` module is the only
  WebSocket publisher: it turns domain events into thin update events on five STOMP topics (`/topic/matches`,
  `tables`, `queue`, `players`, `settings`) at `/ttt-websocket`. Clients filter by the event's scope and re-fetch
  over REST (ADR 0002, ADR 0003). A new use case needs its domain event, its outbound mapping and an expected event
  file.
- **Shared client modules are identical copies.** `src/app/shared/update-events/`, `result-entry/` and
  `match-state/` exist in every client that uses them, byte for byte. Change all copies together.
- **Tests compare whole results.** Backend tests compare complete JSON bodies, events, database rows and objects
  (`ExpectedJson`, `DatabaseHelper`, fixed `Clock` and ids). Client specs reuse the backend's recorded events from
  `management-backend/src/test/resources/expected/events/`. A changed expected file is a behaviour change: review it.
- **One REST test class per root resource.** A new endpoint under `/api/v2/<resource>` gets its tests in
  `<Resource>ResourceIT` (extends `ResourceIT`), its expected files in `expected/<resource>/`, success and failure
  cases alike. After `-DupdateExpected=true` run the tests once more without it: recording never fails.
- **Unit tests are Vitest, e2e tests are Playwright.** No Karma, Jasmine or Protractor.
- **Tables have an id and a number.** They differ in real data. `/table/{nr}/lock` and `/match/matchtotable/{nr}`
  take the number; most other endpoints take the id.
