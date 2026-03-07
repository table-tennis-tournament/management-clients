# Real-time Updates and Public Display

This document specifies the functionality for real-time synchronization between the tournament server and its clients.

## WebSocket Synchronization
The system uses WebSockets (via SockJS) to push real-time updates to all connected clients (Admin, Table Manager, Result View).
- **Update Types**:
  - `UpdateMatches`: Notify clients of changes in match data or status.
  - `UpdateTable`: Notify clients of changes to table occupancy or status.
  - `UpdateMatchList`: Update the planned match list/queue.
  - `UpdateTableManager`: Specific updates for the referee's Table Manager application.
- **Latency**: Updates are pushed immediately upon any data change in the backend.

## Table Manager Application
Referees use a specialized application to manage their assigned tables.
- **Table Overview**: See which matches are currently active on their table.
- **Call Players**: Start or repeat a call for players directly from the table.
- **Live Scoring**: Enter set-by-set results as they happen.
- **Complete Match**: Finalize the result and notify the central server.
- **Auto-Update**: The application reflects changes made in the central administration (e.g., a match being re-assigned).

## Result View (Public Display)
A public-facing application intended for display on monitors or projectors in the venue.
- **Live Results**: Shows currently active matches and their live scores (set-by-set).
- **Recent Results**: Lists the scores of the most recently finished matches.
- **Upcoming Matches**: Displays the next matches in the queue and their table assignments.
- **Discipline Overview**: Shows progress and standings for active disciplines.

## API Endpoints (from Backend)
- `GET /api/sockjs`: WebSocket endpoint for real-time updates.
- `GET /api/match/played`: Retrieve recently finished matches for the result view.
- `GET /api/match/open`: Retrieve upcoming matches for the result view.
