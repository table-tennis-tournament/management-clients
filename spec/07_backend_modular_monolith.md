# Backend Modular Monolith

This document specifies the target architecture for the **management-backend**: the migration of the legacy Scala/Play backend to a Kotlin/Spring Boot modular monolith. It is the implementation spec for the `boot-migration` work.

## 1. Context & Goals

The legacy backend (Scala 2.13, Play Framework, Pekko actors, Slick) is being replaced by a single Spring Boot 4.1 application written in Kotlin 2.3, structured with Spring Modulith 2.1. Goals:

- Replace the Scala/Pekko/Slick stack with Kotlin/Spring Boot/JdbcClient.
- Split the codebase into a small set of bounded contexts (modules) with enforced boundaries.
- Give each module an onion architecture so the domain stays framework-free and independently testable.
- Preserve the existing REST API surface so the three Angular frontends keep working unchanged.

## 2. Modules

The root package is `de.ttt.management`. Each direct sub-package is a Spring Modulith module.

| Module | Responsibility |
|---|---|
| `registration` | Players, clubs, doubles, disciplines and registration state (paid / active / seed). Register/unregister players. |
| `grouping` | Group standings after every result change. Group formation and seeding stay in mktt. A knockout winner moves on into the next match in `tournament`. |
| `tournament` | Match lifecycle and state machine, the Queue/MatchList, table assignment, results, caller (first/second/third call) and table-manager operations. |
| `settings` | System settings and printing (referee sheets, certificates). |
| `outbound` | The single WebSocket publisher; consumes domain events and pushes update events to five topics (`/topic/matches`, `tables`, `queue`, `players`, `settings`, ADR 0003). |
| `health` | Readiness checks for Actuator: the database, mktt's tables, Flyway's migrations and the WebSocket (section 7). Depends on no other module. |

### Boundaries

- The `registration` player is **not** the `tournament` player. Modules duplicate the aggregates they need; there is no class sharing across modules.
- `grouping` and `tournament` do not import `registration` domain types; they keep their own lightweight projections.

## 3. Onion Architecture per Module

Each module layers as follows, with dependencies pointing inward (`infrastructure → application → domain`):

```
<module>/
├── domain/            # aggregates, value objects, state enums, repository ports (interfaces only)
├── application/       # use-case orchestration, application services, event publication
└── infrastructure/
    ├── database/      # JdbcClient repository adapters (plain SQL)
    ├── web/           # REST controllers
    └── messaging/     # event listeners / publishers
```

Rules (enforced by `OnionArchitectureTests`, an ArchUnit test):

- `domain` must not depend on `application` or `infrastructure`, and must be framework-free (no `org.springframework.*` imports).
- `application` must not depend on `infrastructure`.
- Repository **ports** (interfaces named `*Repository`) live in `domain`; Jdbc adapters (classes named `Jdbc*`) live in `infrastructure.database`.

## 4. Persistence

- **JdbcClient + hand-written SQL only.** No JPA, no Hibernate.
- Repository interfaces live in `domain`; implementations in `infrastructure.database`.
- The legacy MySQL/MariaDB schema is kept, managed via Flyway migrations.
- Tests run against **H2 in MySQL mode** for fast startup.

## 5. Cross-Module Communication

- Modules communicate via Spring application events (`ApplicationEventPublisher` / `@EventListener`).
- Shared contracts (domain events such as `PlayerRegistered`, `MatchCompleted`) live in the publishing module's base package and are the only types other modules may import.
- `outbound` is the **only** component that publishes WebSocket messages; after the transaction commits it turns domain events into update events `{"type", "scope", "payload"}` on five STOMP topics (`/topic/matches`, `tables`, `queue`, `players`, `settings`) at the native WebSocket endpoint `/ttt-websocket` (ADR 0002, ADR 0003).

## 6. API Versioning

All REST endpoints are prefixed with `/api/v2` by a single global `PathMatchConfigurer.addPathPrefix("/api/v2", …)` (see `ApiVersionConfig`), so controllers keep the legacy path shape (`/match`, `/matchlist`, `/table`, `/players`, …). During the migration this let the legacy backend serve `/api/…` (v1) and this backend serve `/api/v2/…` (v2) in parallel behind a version-switching router; the legacy backend is no longer deployed. WebSocket (`/ttt-websocket`), actuator and library endpoints such as springdoc's `/v3/api-docs` are unaffected. Spring Boot 4's `spring.mvc.apiversion` remains available for version-specific controller mappings later.

## 7. Health and readiness

Actuator's probes, also served on the main port. Port 8080 is internal; nginx serves `/healthz` and proxies
`/readyz`, so `http://<host>/readyz` shows the readiness of the whole system.

| Endpoint | Checks | Used by |
|---|---|---|
| `/livez`, `/actuator/health/liveness` | The process runs (`livenessState`). A failing database does not make it fail: a restart would not help. | restart policies |
| `/readyz`, `/actuator/health/readiness` | `readinessState`, `db`, `mkttSchema`, `flyway`, `webSocket` (below). 503 when one is DOWN. | the backend's Docker healthcheck, nginx `/readyz` |
| `/actuator/health` | All indicators, including `diskSpace` and `ping`. | |
| nginx `/healthz` | nginx runs. No backend involved. | the clients' Docker healthcheck |
| nginx `/readyz` | The backend's `/readyz` through the proxy; `managementBackend` DOWN (503) when the backend does not answer. | people, `deploy/check-ready.sh` |

The indicators live in the `health` module (`health.infrastructure`):

- `db`: a pooled connection is valid. Replaces Spring Boot's `db` indicator (`management.health.db.enabled: false`).
- `mkttSchema`: every mktt table the backend's SQL uses exists and can be read by the backend's user
  (`MkttSchemaHealthIndicator.REQUIRED_TABLES`; add a table there when a repository starts using it). Details count
  the matches, tables and players, to tell whether a tournament is loaded.
- `flyway`: no migration pending or failed. Details name the current version and the pending or failed migrations.
- `webSocket`: the simple broker and the STOMP endpoint (`/ttt-websocket`) run. Details count the open WebSocket
  sessions, i.e. the connected clients.

The three database checks extend `TimeBoxedHealthIndicator`: each answers within 2 s, and is DOWN with
`no answer within 2000 ms` instead of waiting the connection pool's 30 s while the database is down. The readiness
response therefore takes at most about 6 s; the probes allow 10 s.

`deploy/check-ready.sh [base-url]` checks the system from outside like a client: nginx, `/readyz`, the three apps and
a WebSocket handshake through nginx (101).

## 8. Tracer Bullet

The first vertical slice implemented end-to-end is the **match completion** flow in the `tournament` module:

1. Client calls `POST /api/v2/match/setResult/{id}` with a set body of `[points1, points2]` pairs, e.g. `[[11,5],[11,7],[11,3]]`.
2. `MatchService` loads the `TournamentMatch` aggregate, validates the result, determines the winner and transitions the match state to `Completed`, then persists it.
3. `MatchService` publishes a `MatchCompleted` domain event.
4. The `outbound` module's event listener consumes `MatchCompleted` and pushes `{"type": "MATCH_COMPLETED", "scope", "payload"}` to `/topic/matches`.

This slice exercises every layer (`domain` → `application` → `infrastructure.web`/`database`, plus `outbound.messaging`) and every test kind below.

### Domain model

- `MatchState` enum: `Open`, `InQueue`, `OnTable`, `Started`, `Completed`, `Finished`, `Walkover` (see `GLOSSARY.md`).
- `SetResult` value object encodes the per-set scoring rule (winner reaches 11, two-point lead from deuce) and the legacy `resultRaw` serialization.
- `TournamentMatch` aggregate with behaviour: `enterResult(sets)` (playing mode), `complete(sets)` (best-of-five winner → `Completed`), `start()`, `free()`, `takeBack()`.

## 9. Testing Strategy

| Kind | Class | What it verifies |
|---|---|---|
| ArchUnit | `OnionArchitectureTests` | Onion layering and repository port/adapter placement for every module. |
| Modulith verify | `ApplicationTests` | `ApplicationModules.verify()` — no illegal module dependencies. |
| Module integration | `*ModuleTest` (`@ApplicationModuleTest`) | Boots a single module; calls a REST endpoint and asserts the published domain event via `PublishedEvents`. |
| Full context + WebSocket | `UpdateTopicsIT`, `*OutboundIT` (`@SpringBootTest` + STOMP client) | A write operation produces the complete update event on its topic (compared with `expected/events/**`). |
| Scenario | `MatchLifecycleScenarioIT` | Full walkthrough against the running app: assign a match to a table, call it, enter set results, finish the game. |
| Domain unit | `TournamentMatchTest` | Pure unit tests of aggregate behaviour against real objects (no mocks). |
| Health | `HealthIT`, `HealthIndicatorsTest` | The liveness and readiness responses, complete; each indicator's DOWN state on a database of its own. |

Every REST endpoint gets a module-level integration test with H2. Complex domain logic is unit-tested against real objects only.

## 10. Current status & open work

### Done (slices shipped)

This list records each slice as it was shipped; later slices changed some details. Current state: update events on
five topics instead of `/topic/updates` (ADR 0003), the backend's own tables in the Flyway migrations
`V1`–`V7` under `src/main/resources/db/migration`, and the test counts in `docs/test-improvement-plan.md`.

- Onion modules (`registration`, `grouping`, `tournament`, `settings`, `outbound`, `health`) + ArchUnit/Modulith verification.
- Tracer: match `setResult`/`updateResult` end-to-end — `SetResult` scoring rules, `TournamentMatch` state machine (`start`/`free`/`takeBack`/`enterResult`/`complete`), `MatchCompleted`/`MatchStarted`/`MatchFreed`/`MatchTakenBack`/`MatchResultUpdated` events → `outbound` WebSocket.
- API versioning: global `/api/v2` prefix (`ApiVersionConfig`), controllers on legacy path shapes (`/match`, `/matchlist`, `/table`, `/players`, `/disciplines`, `/settings`, `/printer`); stray `registration` match cluster removed.
- Queue/MatchList (`tournament`): persisted via Flyway `V2__match_list.sql` + `MatchListRepository`/`JdbcMatchListRepository`; match-state integration (`InQueue` via `matc_waitinglist`, `TournamentMatch.queue()`/`dequeue()`); `MatchListChanged` domain event → `outbound` (`MATCH_LIST_CHANGED`); `AutoStartService` replaces the `/matchlist/auto-start` stub (starts the next queued match on each free table).
- Caller / calls (`tournament`): per-player calls (`PlayerCall`) in `mgmt_player_call` and the first-call time in `mgmt_match_call` (Flyway `V8__mgmt_player_call.sql`, replacing `mgmt_match_call_state`); `TournamentMatch.call(now)`/`requestCall(playerIds)`/`announceRequestedCall()`; `match/call`, `playercall/{id}`, `playercall/announce` and `matchaggregates/caller|secondCall|thirdCall` (grouped by `matc_tabl_id`); `MatchCalled` → `MATCH_CALLED`, `MatchCallRequested` → `MATCH_CALL_REQUESTED`.
- Table (`tournament`): `isLocked` persisted (`tabl_locked`, Flyway `V4__table_locked.sql`); `lockTable`/`unlockTable` write the flag and `getFreeTables` excludes locked/occupied tables (keys off `matc_tabl_id`, not the removed `match_on_table`); `getByTablemanager` migrates the hardcoded manager→table-number mapping and returns `TableManagerTableInfo` (`table_id`/`table_number`/`table_manager_id`/`matches` with players, result games, `stage`, `classification`, legacy `state`); assignment split: `setMatchToTable` now assigns (`TournamentMatch.assign()` → `MatchState.OnTable`, `MatchAssigned` event → `MATCH_ASSIGNED`) instead of starting, while `/match/start/{id}/{tableId}` remains `Started`.
- Auto-start heuristics (`tournament`): `AutoStartHeuristic` (pure domain object) replicates the legacy `filterFirst`/`isPossibleMatch` player-blocking logic — a queued match is only started when both sides are present and no player is already in a blocking match (assigned or started); `TournamentMatch.isBlocking`/`isPlayable`; free tables iterated odd-then-even.
- Free and walkover (`tournament`): `TournamentMatch.free()` marks the match played without a result (`Finished`, the result is entered later); `complete(sets, kampflos = true)` persists `matc_kampflos` with the winner and result (`Walkover`); `takeBack()`, a `complete()` without it and `enterResult()` clear the flag.
- Second table (`tournament`): the tables a match waits at are rows of `mgmt_matchtable`; `assignSecondTable()` adds one, `start()` at either table removes the other, `leaveOneTable()` ("Entfernen") removes one of two.
- Call aggregates name (`tournament`): `matchaggregates/*` `name` is now the matchtype name plus the group name (e.g. `Gruppenspiel 01 `), matching the legacy `getMatchAggregateNameFromMatch` (matchtype and group names joined in `findByCallState`).
- Doubles resolution (`tournament`): `TournamentMatch` now models each side as a list of players (`players1`/`players2`); the repository resolves raw ids via the `doubles` table (`>= 100000` → two member player ids) and the `player` table for names/TTR, so `matchaggregates/*`, the table-manager view and `isPlayable`/`AutoStartHeuristic` blocking all see individual players for doubles.
- `TournamentMatchController` stubs: `load-new` → `GET /match/loadnew` (stateless no-op); `allmatchtable` → lists current `{matchId, tableId}` assignments; `matchtosecondtable/{tableName}` → assigns via `setMatchToTable`; `remove/{tableId}` → un-assigns matches (`removeFromTable` clears `matc_tabl_id`/`matc_isplaying`/`matc_callstate`).
- Settings/print (`settings`): real PDF generation via Flying Saucer (`PdfGenerator` port → `FlyingSaucerPdfGenerator`) rendering a Schirizettel template from a `MatchPrintInfo` read model (`MatchPrintRepository`/`JdbcMatchPrintRepository`, resolves singles and doubles names); real QR codes via ZXing (`QrCodeGenerator` → `ZxingQrCodeGenerator`); real printer enumeration via `PrintServiceLookup` (`PrinterGateway` → `SystemPrinterGateway`); `printpdf/{id}` returns a real PDF (404 for unknown match).
- Registration active flag (`registration`): `Player.active` persisted via `play_active` (Flyway `V5__player_active.sql`, default active); `setPlayerActiveState` now writes the flag.
- v1/v2 switch: both backends run side by side (`backend:9000`, `management-backend:8080`) with nginx routing `/api/` → old and `/api/v2/` + `/ttt-websocket*` → new; the three frontends share an `apiVersion` localStorage key, an `HTTP_INTERCEPTOR` rewrites `/api` → `/api/v2` in v2 mode, and a temporary **legacy raw-SockJS endpoint** in the `outbound` module (`/ttt-websocket-legacy`) re-emits full v1 payloads (`UpdateMatches`/`UpdateTable`/`UpdateMatchList`/`UpdateTableManager`) so the existing clients work unchanged; toggles in admin settings, tablemanager menu and result header (experimental). `management-backend-ci.yml`/Dockerfile fixed (layertools removed, `latest` tag).
- Grouping standings (`grouping`): `GroupStandingsCalculator` (pure) replicates `updatePlayerPerGroup` — tallies completed matches into matches/sets/points won+lost, ranks by `matchesWon` → `setsDiff` → `pointsWon`, assigns `position`; `GroupingService` listens to `MatchCompleted`, `MatchResultUpdated` and `MatchTakenBack` and persists the standings of the match's group to `playerpergroup` after every change, counting the matches with a winner (`PlayerPerGroupRepository`/`GroupMatchRepository`).
- Disciplines a player is in (`tournament`): `DisciplineParticipation` (pure) decides from `ParticipationFacts` (matches, `playerpergroup` places with `Grou_QualPos`, registrations, doubles teams; `JdbcParticipationFactsRepository`) which disciplines each player is still in; `JdbcTournamentMatchRepository` sets `TournamentPlayer.types` on every loaded match, as the legacy `getPlayerTypes` did.
- Physical print jobs (`settings`): `printMatch`/`printAll` now dispatch the A6 referee-sheet PDF to a CUPS printer via `lpr -P <printer> -o media=A6` (`LprPrinterGateway`); the default printer is configurable (`management.printer.default-name` / `DEFAULT_PRINTER`), the selected printer is in-memory, and `printOnStart` (default off) prints a match when it is assigned (`@EventListener MatchAssigned`). A self-contained **CUPS sidecar** (`cups/Dockerfile`) runs `cupsd` with a `topdf` "print-to-file" backend (real network printer via `CUPS_PRINTER_URI`/`CUPS_PRINTER_NAME`), wired into `docker-compose.yml` (`cups` service + `cups-output` volume, backend `CUPS_SERVER=cups` + `cups-client` in the image).
- STOMP migration (`outbound` + clients): the legacy raw-SockJS shim (`LegacyOutboundService`/`LegacyReadRepository`/`LegacyWebSocket*`, `/ttt-websocket-legacy`) is removed; the STOMP endpoint `/ttt-websocket` is registered natively (no `.withSockJS()`) and pushes thin events `{"type","payload"}` to `/topic/updates`; admin-view and tablemanager-view use `@stomp/stompjs` (native WebSocket) and re-fetch state from REST on each event. Integration tests (`OutboundModuleIT`, `TournamentOutboundIT`, `MatchLifecycleOutboundIT`) connect a native `StandardWebSocketClient` and assert the event `type`+`payload`.
- 116 tests green (`cd management-backend && mvn test`).

### Open work (next slices)

- **Grouping (formation)**: group *formation* and seeding remain offline (mktt). The knockout placement (`writeNextKoMatch`) is migrated to `tournament` (`MatchService.setResult`).
- **`isMatchPlaying`** is kept (dead for now) — user intends to use it later.

### Handoff note

All completed slices up to and including the STOMP migration are implemented, green (116 tests + all three frontend builds) and committed. Remaining work is the "Open work" list above — the large item is **grouping formation/knockout placement**.
