# management-clients

Table tennis tournament management: a backend and three single-page applications (SPAs) that run a tournament on a database prepared offline by the tournament tool mktt. The backend is a Kotlin/Spring Boot modular monolith with MariaDB; the clients are Angular 21 applications using [ngrx](https://ngrx.io/) for client-side state. Clients receive live updates over STOMP on a WebSocket and re-fetch what changed over REST.

## management-backend

The [management-backend](./management-backend/README.md) provides the REST API (under `/api/v2`), the live update events (STOMP on `/ttt-websocket`), PDF referee sheets and printing. It is a Spring Boot 4 application written in Kotlin and structured as a modular monolith with Spring Modulith.

## admin-view

The [admin-view](./admin-view/README.md) is designed to manage the tournament flow. You can assign matches to tables, call matches, enter results and manage players and settings. A queue lets the tournament run without interaction.

## result-view

The [result-view](./result-view/README.md) is designed to show current results of the tournament, including a live bracket view for the knockout stage. It updates on its own when a result changes.

## tablemanager-view

The [tablemanager-view](./tablemanager-view/README.md) is designed to manage the tables of one table manager. You can start a match, enter a result (set and match), call the players again if they don't appear and take a match back.

## backend (legacy)

The [backend](./backend/README.md) is the former Scala/Play backend. It is no longer built, tested or deployed; it stays in the repository as a reference for logic that is not migrated yet.

## Running the system

```bash
docker compose up -d --build
```

This starts MariaDB (seeded with `testdata/create-saturday.sql` and `create-sunday.sql`), a CUPS print server, the backend on port 8080 and the clients on port 80: `http://localhost/admin-view/`, `/result-view/` and `/tablemanager-view/`. All three clients ship in one nginx image built from `Dockerfile-clients`.

For development, start each client with `npm start` (admin-view on 4201, result-view on 4202, tablemanager-view on 4200); it proxies `/api/v2` and `/ttt-websocket` to the backend on 8080.

## Architecture Documentation

The documentation is published on GitHub Pages: **<https://table-tennis-tournament.github.io/management-clients/>** ([arc42 architecture](https://table-tennis-tournament.github.io/management-clients/arc42/architecture.html)), rebuilt on every push to `main` and every `v*` tag.

- **[arc42 Architecture](./docs/arc42/architecture.adoc)** - Architecture documentation with embedded C4 diagrams (context, container, component and dynamic)
- **[Architecture decisions](./docs/adr/)** - ADRs
- **[Glossary](./GLOSSARY.md)** - Canonical domain language of the system
- **[Specifications](./spec/README.md)** - Functional specifications per area

## Licensing

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for the full text.
