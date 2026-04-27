# management-clients

In this repository you will find four components for table tennis tournament management. All clients are designed as SPAs and use angular as js framework. Also they use [ngrx](https://ngrx.io/) for client site state management.

## admin-view

The [admin-view](./admin-view/README.md) is designed to manage the tournament flow. You can assign matches to tables, call matches, enter results. Also you get the option for a queue to let the tournament flow without interaction.

## result-view

The [result-view](./result-view/README.md) is designed to show current results of the tournament.

## tablemanager-view

The [tablemanager-view](./tablemanager-view/README.md) is designed to manage special tables. You can enter a result (set and match) for a specific table. You can request a second call for player if he doesn't appear.

## backend (Legacy)

The [backend](./backend/README.md) provides all functionality for the clients. It is a scala backend with play framework and a mariaDB.

## management-backend (Next-Gen)

The [management-backend](./management-backend/README.md) is the new Spring Boot 4.x (Kotlin) implementation following a modular monolith architecture with Spring Modulith.

## Architecture Documentation

- **[arc42 Architecture](./docs/arc42/architecture.adoc)** - Complete architecture documentation
- **[C4 Models](./docs/arc42/c4-models.adoc)** - System visualization and component diagrams

## Licensing

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for the full text.
