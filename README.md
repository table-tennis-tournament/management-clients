# management-clients

In this repository you will find four components for table tennis tournament management. The three clients are single-page applications (SPAs) built with Angular 21 and use [ngrx](https://ngrx.io/) for client-side state management. The backend is a Scala application on Play Framework 3.0.x with a MariaDB.

## admin-view

The [admin-view](./admin-view/README.md) is designed to manage the tournament flow. You can assign matches to tables, call matches, enter results. Also you get the option for a queue to let the tournament flow without interaction.

## result-view

The [result-view](./result-view/README.md) is designed to show current results of the tournament, including a live bracket view for the knockout stage.

## tablemanager-view

The [tablemanager-view](./tablemanager-view/README.md) is designed to manage special tables. You can enter a result (set and match) for a specific table. You can request a second call for player if he doesn't appear.

## backend

The [backend](./backend/README.md) provides all functionality for the clients. It is a scala backend with play framework and a mariaDB.

## Architecture Documentation

- **[arc42 Architecture](./docs/arc42/architecture.adoc)** - Complete architecture documentation with embedded C4 diagrams (context, container and component levels)
- **[Glossary](./GLOSSARY.md)** - Canonical domain language of the system

## Licensing

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for the full text.
