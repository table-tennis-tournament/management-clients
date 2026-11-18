# Tournament Registration Software Specifications

This folder contains the functional specifications for the tournament registration and management software.

## Contents

1.  [**Player Management**](01_players.md) - Player registration, active status, paid status, and doubles formation.
2.  [**Discipline Management**](02_disciplines.md) - Discipline types, group phases, KO-systems, and rules.
3.  [**Table Management**](03_tables.md) - Physical table management and match assignment.
4.  [**Match Lifecycle**](04_matches.md) - Match states (Open to Finished), player calling, and result entry.
5.  [**Reporting and Printing**](05_reporting.md) - Referee sheets and printing; winning documents (Urkunden) stay with mktt.
6.  [**Real-time Updates**](06_live_updates.md) - WebSockets, Table Manager App, and Public Result View.
7.  [**Backend Modular Monolith**](07_backend_modular_monolith.md) - The Kotlin/Spring Boot backend: modules, onion architecture, persistence, event flow, and the migration log.

## Architecture Overview

The software consists of a Kotlin/Spring Boot backend (`management-backend`) and three Angular frontend clients. Tournament data (players, disciplines, groups and matches) is prepared offline in mktt. Every API section lists the endpoints under the backend's `/api/v2` prefix.
- **Admin View**: Central management interface for tournament directors.
- **Table Manager**: Specialized interface for referees at the tables to manage matches and enter results.
- **Result View**: Public-facing display for live results and upcoming matches.
