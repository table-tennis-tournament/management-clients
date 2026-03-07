# Tournament Registration Software Specifications

This folder contains the functional specifications for the tournament registration and management software.

## Contents

1.  [**Player Management**](01_players.md) - Player registration, active status, paid status, and doubles formation.
2.  [**Discipline Management**](02_disciplines.md) - Discipline types, group phases, KO-systems, and rules.
3.  [**Table Management**](03_tables.md) - Physical table management and match assignment.
4.  [**Match Lifecycle**](04_matches.md) - Match states (Open to Finished), player calling, and result entry.
5.  [**Reporting and Printing**](05_reporting.md) - Generation of referee sheets and winning documents (Urkunden).
6.  [**Real-time Updates**](06_live_updates.md) - WebSockets, Table Manager App, and Public Result View.

## Architecture Overview

The software consists of a Scala Play backend and multiple Angular-based frontend clients:
- **Admin View**: Central management interface for tournament directors.
- **Table Manager**: Specialized interface for referees at the tables to manage matches and enter results.
- **Result View**: Public-facing display for live results and upcoming matches.
