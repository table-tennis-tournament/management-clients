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
- **Referees**: Assigning a referee during the call is not supported by the backend; the referee list stays empty.

## Match Planning (Supervisor)
Administrators use a "Match List" or "Supervisor View" to plan matches:
- **Playability**: A match is *playable* when both Sides are present and none of its players is in a match on a table, in any discipline (`isPlayable` on every Match DTO).
- **Queue**: Matches (or a group of matches) are added to the Queue at a position and can be moved or removed.
- **Auto-start**: When the Queue is active, the system starts the first playable entry on a free table; an entry that shares a player with an earlier, unplayable entry waits.

## Take Back and Free
- **Take back**: A match on a table (assigned or being played) is taken back to Open; its call and its result are cleared, so it is played again from the start. The table manager's "Zurück" takes back a running match.
- **Free**: A match is finished without a played result (walkover); it becomes Finished and leaves its table.

## Result Entry
A Set is won with 11 points and a lead of two; a Match is won by the first Side to win three Sets (best of five).
An interim result keeps the match running; a final result completes it. Results can be entered via:
- **Administrative Interface**: Manually entering the score (e.g., 3:0 or set-by-set results).
- **Table Manager App**: Referees enter set-by-set results on a mobile device/tablet.
- **QR Code Scanner**: Referees scan a QR code on the match sheet to quickly access the result entry form.

## API Endpoints

All paths are relative to the backend's `/api/v2` prefix (for example `GET /api/v2/players/all`). Commands answer
`{"success": true}`, or a 400 with `{"success": false, "message": ...}` when they are rejected. The OpenAPI description
is served by the backend itself (port 8080, not through nginx) at `/v3/api-docs`, with a Swagger UI at `/api-docs-ui`.

Sets are sent as `[[pointsSide1, pointsSide2], ...]`, for example `[[11,5],[11,7],[11,3]]`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/match/all` | All matches. |
| `GET` | `/match/{id}` | One match. |
| `GET` | `/match/typeid/{typeId}` | The matches of a discipline (result view). |
| `GET` | `/match/open/all`, `/match/open/typeid/{typeId}` | Matches that are not played yet. |
| `GET` | `/match/played/all`, `/match/played/typeid/{typeId}` | Played matches. |
| `POST` | `/match/start/{id}/{tableId}` | Start a match on the table with the **id** `{tableId}`. |
| `POST` | `/match/takeBack/{id}` | Take back a running match (the table manager's "Zurück"). `/match/stop/{id}` is its deprecated alias. |
| `POST` | `/match/takeBack` | Take back matches. Body: `[matchId, ...]`. |
| `POST` | `/match/free` | Free matches (walkover). Body: `[matchId, ...]`. |
| `POST` | `/match/updateResult/{id}` | Enter an interim result; the match keeps running. Body: sets. |
| `POST` | `/match/setResult/{id}` | Enter the final result and complete the match. Body: sets. |
| `POST` | `/match/call` | First call of matches. Body: `[matchId, ...]`. |
| `POST` | `/playercall/{matchId}` | Next call (second, then third) of a match. |
| `GET` | `/matchaggregates/caller`, `/secondCall`, `/thirdCall` | The matches at a table per call, for the caller view. |
| `DELETE` | `/match/{id}` | Delete a match. |
| `GET` | `/match/loadnew` | Kept for the legacy clients; does nothing. |
| `GET` | `/matchlist/all` | The Queue: `[{"uuid", "matchIds", "asGroup", "position"}]`. |
| `GET` | `/matchlist/next` | The entry auto-start would start next (none while the Queue is inactive). |
| `POST` | `/matchlist/add` | Add to the Queue. Body: `{"matchIds", "asGroup", "position"}`; only Open matches are added. |
| `POST` | `/matchlist/move/{uuid}/{position}` | Move a Queue entry. |
| `DELETE` | `/matchlist/{uuid}` | Remove a Queue entry; its matches become Open. |
| `POST` | `/matchlist/active/{true\|false}` | Switch auto-start on or off. |
| `POST` | `/matchlist/auto-start` | Start the next playable Queue entry now. |

Every change is published on the `matches` topic (`MATCH_ASSIGNED`, `MATCH_STARTED`, `MATCH_RESULT_UPDATED`,
`MATCH_COMPLETED`, `MATCH_FREED`, `MATCH_TAKEN_BACK`, `MATCH_CALLED`, `MATCH_DELETED`) or, for the Queue, as
`MATCH_LIST_CHANGED` on the `queue` topic (see [Real-time Updates](06_live_updates.md)).
