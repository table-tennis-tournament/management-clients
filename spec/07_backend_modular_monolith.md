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
| `grouping` | Group formation, seeding and knockout placement. **Scaffolded only** — implemented in a later iteration. |
| `tournament` | Match lifecycle and state machine, the Queue/MatchList, table assignment, results, caller (first/second/third call) and table-manager operations. |
| `settings` | System settings and printing (referee sheets, certificates). |
| `outbound` | The single WebSocket publisher; consumes domain events and pushes to `/topic/updates`. |

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
- `outbound` is the **only** component that publishes WebSocket messages; it listens for domain events and pushes `{"type": ..., "payload": ...}` to `/topic/updates` over STOMP/SockJS.

## 6. API Versioning

All REST endpoints are prefixed with `/api/v2` by a single global `PathMatchConfigurer.addPathPrefix("/api/v2", …)` (see `ApiVersionConfig`), so controllers keep the legacy path shape (`/match`, `/matchlist`, `/table`, `/players`, …). This lets the legacy backend serve `/api/…` (v1) and this backend serve `/api/v2/…` (v2) in parallel behind a version-switching router. WebSocket (`/ttt-websocket`) and actuator endpoints are unaffected. Spring Boot 4's `spring.mvc.apiversion` remains available for version-specific controller mappings later.

## 7. Tracer Bullet

The first vertical slice implemented end-to-end is the **match completion** flow in the `tournament` module:

1. Client calls `POST /api/v2/match/setResult/{id}` with a set body of `[points1, points2]` pairs, e.g. `[[11,5],[11,7],[11,3]]`.
2. `MatchService` loads the `TournamentMatch` aggregate, validates the result, determines the winner and transitions the match state to `Completed`, then persists it.
3. `MatchService` publishes a `MatchCompleted` domain event.
4. The `outbound` module's event listener consumes `MatchCompleted` and pushes `{"type": "MATCH_COMPLETED", ...}` to `/topic/updates`.

This slice exercises every layer (`domain` → `application` → `infrastructure.web`/`database`, plus `outbound.messaging`) and every test kind below.

### Domain model

- `MatchState` enum: `Open`, `InQueue`, `OnTable`, `Started`, `Completed`, `Finished` (see `GLOSSARY.md`).
- `SetResult` value object encodes the per-set scoring rule (winner reaches 11, two-point lead from deuce) and the legacy `resultRaw` serialization.
- `TournamentMatch` aggregate with behaviour: `enterResult(sets)` (playing mode), `complete(sets)` (best-of-five winner → `Completed`), `start()`, `free()`, `takeBack()`.

## 8. Testing Strategy

| Kind | Class | What it verifies |
|---|---|---|
| ArchUnit | `OnionArchitectureTests` | Onion layering and repository port/adapter placement for every module. |
| Modulith verify | `ApplicationTests` | `ApplicationModules.verify()` — no illegal module dependencies. |
| Module integration | `*ModuleTest` (`@ApplicationModuleTest`) | Boots a single module; calls a REST endpoint and asserts the published domain event via `PublishedEvents`. |
| Full context + WebSocket | `*OutboundIT` (`@SpringBootTest` + STOMP client) | A write operation produces the correct WebSocket message on `/topic/updates`. |
| Scenario | `MatchLifecycleScenarioIT` | Full walkthrough against the running app: assign a match to a table, call it, enter set results, finish the game. |
| Domain unit | `TournamentMatchTest` | Pure unit tests of aggregate behaviour against real objects (no mocks). |

Every REST endpoint gets a module-level integration test with H2. Complex domain logic is unit-tested against real objects only.

## 9. Current status & open work

### Done (slices shipped)

- Onion modules (`registration`, `grouping`, `tournament`, `settings`, `outbound`) + ArchUnit/Modulith verification.
- Tracer: match `setResult`/`updateResult` end-to-end — `SetResult` scoring rules, `TournamentMatch` state machine (`start`/`free`/`takeBack`/`enterResult`/`complete`), `MatchCompleted`/`MatchStarted`/`MatchFreed`/`MatchTakenBack`/`MatchResultUpdated` events → `outbound` WebSocket.
- API versioning: global `/api/v2` prefix (`ApiVersionConfig`), controllers on legacy path shapes (`/match`, `/matchlist`, `/table`, `/players`, `/disciplines`, `/settings`, `/printer`); stray `registration` match cluster removed.
- Queue/MatchList (`tournament`): persisted via Flyway `V2__match_list.sql` + `MatchListRepository`/`JdbcMatchListRepository`; match-state integration (`InQueue` via `matc_waitinglist`, `TournamentMatch.queue()`/`dequeue()`); `MatchListChanged` domain event → `outbound` (`MATCH_LIST_CHANGED`); `AutoStartService` replaces the `/matchlist/auto-start` stub (starts the next queued match on each free table).
- Caller / call state (`tournament`): `CallState` (`None`/`FirstCall`/`SecondCall`/`ThirdCall`) persisted via `matc_callstate` (Flyway `V3__match_call_state.sql`); `TournamentMatch.call()`/`callAgain()`; `callMatches`/`playercall/{id}` and `matchaggregates/caller|secondCall|thirdCall` (grouped by `matc_tabl_id`, with player/discipline names joined) implemented; `MatchCalled` event → `outbound` (`MATCH_CALLED`).
- Table (`tournament`): `isLocked` persisted (`tabl_locked`, Flyway `V4__table_locked.sql`); `lockTable`/`unlockTable` write the flag and `getFreeTables` excludes locked/occupied tables (keys off `matc_tabl_id`, not the removed `match_on_table`); `getByTablemanager` migrates the hardcoded manager→table-number mapping and returns `TableManagerTableInfo` (`table_id`/`table_number`/`table_manager_id`/`matches` with players, result games, `stage`, `classification`, legacy `state`); assignment split: `setMatchToTable` now assigns (`TournamentMatch.assign()` → `MatchState.OnTable`, `MatchAssigned` event → `MATCH_ASSIGNED`) instead of starting, while `/match/start/{id}/{tableId}` remains `Started`.
- Auto-start heuristics (`tournament`): `AutoStartHeuristic` (pure domain object) replicates the legacy `filterFirst`/`isPossibleMatch` player-blocking logic — a queued match is only started when both sides are present and no player is already in a blocking match (assigned or started); `TournamentMatch.isBlocking`/`isPlayable`; free tables iterated odd-then-even.
- Walkover (`tournament`): `TournamentMatch.free()` transitions to `MatchState.Finished` (was `Completed`) and persists `matc_kampflos`; `takeBack()`/`complete()`/`enterResult()` clear the flag; `toMatch` reads `matc_kampflos`; the table-manager `state` mapping reports `Finished`.
- Call aggregates name (`tournament`): `matchaggregates/*` `name` is now the matchtype name plus the group name (e.g. `Gruppenspiel 01 `), matching the legacy `getMatchAggregateNameFromMatch` (matchtype and group names joined in `findByCallState`).
- Doubles resolution (`tournament`): `TournamentMatch` now models each side as a list of players (`players1`/`players2`); the repository resolves raw ids via the `doubles` table (`>= 100000` → two member player ids) and the `player` table for names/TTR, so `matchaggregates/*`, the table-manager view and `isPlayable`/`AutoStartHeuristic` blocking all see individual players for doubles.
- `TournamentMatchController` stubs: `load-new` → `GET /match/loadnew` (stateless no-op); `allmatchtable` → lists current `{matchId, tableId}` assignments; `matchtosecondtable/{tableName}` → assigns via `setMatchToTable`; `remove/{tableId}` → un-assigns matches (`removeFromTable` clears `matc_tabl_id`/`matc_isplaying`/`matc_callstate`).
- Settings/print (`settings`): real PDF generation via `openhtmltopdf` (`PdfGenerator` port → `OpenHtmlPdfGenerator`) rendering a Schirizettel template from a `MatchPrintInfo` read model (`MatchPrintRepository`/`JdbcMatchPrintRepository`, resolves singles and doubles names); real QR codes via ZXing (`QrCodeGenerator` → `ZxingQrCodeGenerator`); real printer enumeration via `PrintServiceLookup` (`PrinterGateway` → `SystemPrinterGateway`); `printpdf/{id}` returns a real PDF (404 for unknown match).
- 109 tests green (`cd management-backend && mvn test`).

### Open work (next slices)

- **Grouping**: skeleton only — group formation and `PlayerPerGroup` standings (`updatePlayerPerGroup`: sort by matchesWon → setsDiff → pointsWon) not yet migrated.
- **Registration**: `setPlayerActiveState` does not persist the active flag yet.
- **Ops**: frontends still call `/api/match/…` (v1) — the `/api/v2` router/proxy switch (nginx) is not yet wired; swagger-ui reachability under the prefix unverified.
- **`isMatchPlaying`** is kept (dead for now) — user intends to use it later.
- **Physical print jobs**: `print`/`printAll` still log rather than dispatch to a real printer (selected printer + `printOnStart` are tracked but no `DocPrintJob` is created).

### Handoff note

All completed slices up to and including the settings/print slice are implemented, green (109 tests) and committed. Remaining work is the "Open work" list above — the large item left is **Grouping**; **Registration `setPlayerActiveState`** mirrors a legacy no-op (no `active` column exists) and needs clarification before implementation.
