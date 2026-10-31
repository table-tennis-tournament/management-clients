# Real-time Updates and Public Display

This document specifies the functionality for real-time synchronization between the tournament server and its clients.

## WebSocket Synchronization

Clients receive *update events* over STOMP on a native WebSocket at `/ttt-websocket` (see ADR 0002 and ADR 0003); there is no SockJS fallback. An update event only says that something changed: clients re-fetch the affected state over REST.

Update events are published after the originating transaction commits, on five topics that follow the modules and use cases:

- `matches`: match assignment, start, results, completion, free, take back and deletion.
- `tables`: table lock and unlock.
- `queue`: changes to the ordered match list.
- `players`: player registration, payment and active state.
- `settings`: discipline colors.

The envelope is `{"type": "MATCH_COMPLETED", "scope": {"matchIds": [42], "typeIds": [8], "tableIds": [3]}, "payload": {...}}`. The *scope* names the part of the tournament the event refers to, so a client can ignore events that do not concern what it currently displays. admin-view listens to all five topics; tablemanager-view listens to `matches` and `tables`; the result view will listen to `matches` and `settings`.

There is no replay buffer. A client that may have missed events (after a reconnect) reloads the complete state it displays through REST.

## Table Manager Application

Referees use a specialized application to manage their assigned tables.

- **Table Overview**: See which matches are currently active on their table.
- **Call Players**: Start or repeat a call for players directly from the table.
- **Live Scoring**: Enter set-by-set results as they happen.
- **Complete Match**: Finalize the result and notify the central server.
- **Take Back**: Return a match from the table to the open state ("Zurück").
- **Auto-Update**: Reflect changes made in the central administration (for example a re-assigned match), and reload the tables after a reconnect.

## Result View (Public Display)

A public-facing application intended for display on monitors or projectors in the venue. It has no WebSocket subscription yet (see `docs/follow-ups.md`).

- **Live Results**: Shows currently active matches and their live scores (set-by-set).
- **Recent Results**: Lists the scores of the most recently finished matches.
- **Upcoming Matches**: Displays the next matches in the queue and their table assignments.
- **Discipline Overview**: Shows progress and standings for active disciplines.

## API Endpoints (from Backend)

- `GET /api/v2/tables?table_manager={id}`: tables and matches of one table manager, used for resynchronization.
- `GET /api/v2/match/typeid/{typeId}`: matches of a discipline, used by the result view.
- `GET /api/v2/match/played/all`: recently finished matches.
