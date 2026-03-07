# Match Management and Lifecycle

This document specifies the functionality for the tournament match lifecycle.

## Match Lifecycle States
A match progresses through several states:
- **Open**: The match is eligible to be played but not yet assigned to a table.
- **InWaitingList**: The match has been planned for a specific table but is waiting for the table to become free.
- **Callable**: The match has been assigned to a free table, and the players are being called.
- **OnTable**: The players are at the table, and the match is in progress.
- **Finished**: The match has been completed, and the final result has been recorded.

## Player Calling
Matches that are assigned to a table but have not yet started are in the "Calling" state.
- **First Call**: Initial announcement for the players to proceed to the assigned table.
- **Second Call**: Follow-up announcement if players have not reported within a specific timeframe.
- **Third Call**: Final announcement before potential disqualification.
- **Referees**: A referee can be assigned to the match during the call.

## Match Planning (Supervisor)
Administrators use a "Match List" or "Supervisor View" to plan matches:
- **Playability**: The system checks if players are already playing on another table.
- **Priority**: Matches can be prioritized (e.g., semi-finals before finals).
- **Auto-start**: The system can automatically assign the next match from the list when a table becomes free.

## Result Entry
Results can be entered via:
- **Administrative Interface**: Manually entering the score (e.g., 3:0 or set-by-set results).
- **Table Manager App**: Referees enter set-by-set results on a mobile device/tablet.
- **QR Code Scanner**: Referees scan a QR code on the match sheet to quickly access the result entry form.

## API Endpoints (from Backend)
- `GET /api/match/all`: Retrieve all matches.
- `GET /api/match/open`: Retrieve only open matches.
- `POST /api/match/setResult/:matchId`: Submit the match result (sets).
- `POST /api/match/callPlayers/:matchId`: Trigger a player call.
- `POST /api/match/startMatch/:matchId/:tableId`: Officially start a match on a table.
