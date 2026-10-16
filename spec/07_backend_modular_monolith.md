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

## 6. Tracer Bullet

The first vertical slice implemented end-to-end is the **match completion** flow in the `tournament` module:

1. Client calls `POST /api/tournament/match/setResult/{id}` with a result body (`resultRaw`, `sets1`, `sets2`).
2. `MatchService` loads the `TournamentMatch` aggregate, validates the result, determines the winner and transitions the match state to `Completed`, then persists it.
3. `MatchService` publishes a `MatchCompleted` domain event.
4. The `outbound` module's event listener consumes `MatchCompleted` and pushes `{"type": "MATCH_COMPLETED", ...}` to `/topic/updates`.

This slice exercises every layer (`domain` → `application` → `infrastructure.web`/`database`, plus `outbound.messaging`) and every test kind below.

### Domain model

- `MatchState` enum: `Open`, `InQueue`, `OnTable`, `Started`, `Completed`, `Finished` (see `GLOSSARY.md`).
- `TournamentMatch` aggregate with behaviour: `complete(result)` validates the set result and transitions to `Completed`, recording winner, sets and result.

## 7. Testing Strategy

| Kind | Class | What it verifies |
|---|---|---|
| ArchUnit | `OnionArchitectureTests` | Onion layering and repository port/adapter placement for every module. |
| Modulith verify | `ApplicationTests` | `ApplicationModules.verify()` — no illegal module dependencies. |
| Module integration | `*ModuleTest` (`@ApplicationModuleTest`) | Boots a single module; calls a REST endpoint and asserts the published domain event via `PublishedEvents`. |
| Full context + WebSocket | `*OutboundIT` (`@SpringBootTest` + STOMP client) | A write operation produces the correct WebSocket message on `/topic/updates`. |
| Scenario | `MatchLifecycleScenarioIT` | Full walkthrough against the running app: assign a match to a table, call it, enter set results, finish the game. |
| Domain unit | `TournamentMatchTest` | Pure unit tests of aggregate behaviour against real objects (no mocks). |

Every REST endpoint gets a module-level integration test with H2. Complex domain logic is unit-tested against real objects only.
