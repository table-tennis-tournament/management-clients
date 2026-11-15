# Match Management and Lifecycle

This document specifies the functionality for the tournament match lifecycle.

## Match Lifecycle States
A match progresses through several states (the backend `MatchState`, sent as `state` on every Match DTO):
- **Open**: The match is eligible to be played but neither queued nor assigned to a table.
- **InQueue**: The match is in the Queue and is started automatically when a table becomes free.
- **OnTable** (At Table): The match has been assigned to a table but has not started; its players are being called.
- **Started**: The match is being played.
- **Completed**: The match is over, and the final result has been recorded.
- **Finished**: The match is over without a played result (bye / walkover).

## Player Calling
Matches that are assigned to a table but have not yet started (OnTable) are called. The calls are not states: every Match DTO carries `callNumber` (0 = not called yet, 1-3 = first to third call).
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
