# Match Management and Lifecycle

This document specifies the functionality for the tournament match lifecycle.

## Match Lifecycle States
A match progresses through several states (the backend `MatchState`, sent as `state` on every Match DTO):
- **Open**: The match is eligible to be played but neither queued nor assigned to a table.
- **InQueue**: The match is in the Queue and is started automatically when a table becomes free.
- **OnTable** (At Table): The match has been assigned to a table but has not started; its players are being called.
- **Started**: The match is being played.
- **Completed**: The match is over, and the final result has been recorded.
- **Finished**: The match has been played and has left its table ("Frei"); its result is entered later.
- **Walkover**: The match is not played ("kampflos"): a Side did not appear, and the other wins it with 3:0 sets and 33:0 points.

## Player Calling
Matches at a table are called at the caller desk. The calls are not states. Every player of a match has their own
call count; every Match DTO carries `playerCalls` (`playerId`, `callNumber`, `requested`), `callNumber` (the highest of
its players: 0 = not called yet, 1-3 = first to third call), `requestedCallNumber` and `firstCallTime`.
- **First Call**: Assigning a match to a table puts it on the caller's list (`/matchaggregates/caller`). The caller
  announces it ("OK", `POST /match/call`): every player's call becomes 1 and the waiting time starts.
- **Second and Third Call**: When players have not appeared, the table manager ticks them and requests their next call
  (`POST /playercall/{matchId}` with their ids). The request waits on the caller's list (`/matchaggregates/secondCall` or
  `/thirdCall`, by the call it announces, naming only the requested players) until the caller announces it ("OK",
  `POST /playercall/announce`); then each requested player's call goes up by one. One request per match waits at a time;
  the Third call is a player's last. The table manager requests calls only for a match that has not started: once it is
  started, its call button is gone.
- **Waiting time**: the tablemanager, the Assign view and the caller's lists show the minutes since the first Call.
- Leaving the table (take back, reassignment, result, Frei) clears the calls. The administrator ends a match kampflos
  in the Assign view, usually after the Third call (see Walkover below).
- **Referees**: Assigning a referee during the call is not supported by the backend; the referee list stays empty.

## Match Planning (Supervisor)
Administrators use a "Match List" or "Supervisor View" to plan matches:
- **Playability**: A match is *playable* when both Sides are present and none of its players is in a match on a table, in any discipline (`isPlayable` on every Match DTO).
- **Queue**: Matches (or a group of matches) are added to the Queue at a position and can be moved or removed.
- **Second table**: A group of at least four players may play on two tables ("2.Tisch"). Its matches at a table then
  wait at a second, free table as well (`secondTableId`, `secondTableNumber` on the Match DTO). A match is started at
  one of its two tables and leaves the other; it cannot be started at a third.
- **Auto-start**: When the Queue is active, the system starts the first playable entry on a free table; an entry that shares a player with an earlier, unplayable entry waits.

## Take Back and Free
- **Take back**: A match on a table (assigned or being played) is taken back to Open; its call and its result are cleared, so it is played again from the start. The table manager's "Zurück" takes back a running match.
- **Free** ("Frei"): A played match leaves its table before its result is entered; it becomes Finished and waits in the
  administrator's result list. Entering the result completes it.
- **Walkover** ("Kampflos"): In the Assign view the administrator enters the result of the Side that was there, usually `0 0 0` (or `-0 -0 -0`), and ticks "Kampflos". The match becomes Walkover with that winner and result, leaves its table, counts in the group standings and moves its winner on in the knockout stage. When neither Side appeared, the administrator still names a winner; if that player misses the next knockout match too, it is entered kampflos in the same way. Result displays show "kampflos" for the winner instead of the Sets.

## Knockout Stage
A knockout match (group `999`) of the types Halbfinale (2) to Runde 0 (8) moves its winner on when its final result
is set, in the same transaction, as the legacy backend's `writeNextKoMatch` did. mktt numbers a knockout match
`round * 1000 + position`; the winner of match `nr` goes to match `((nr / 1000) - 1) * 1000 + ((nr % 1000) + 1) / 2`
of the same discipline, as its Side 1 when `nr` is odd and as its Side 2 when it is even. A doubles winner moves on
as its double. The Side is overwritten whenever a final result is set again, even when the next match is already
being played; taking a match back leaves the next match alone. Nothing moves on from the final (type 1), and a
missing next match is only logged. The next match is announced with `MATCH_SIDES_SET`.

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
| `POST` | `/match/free` | Free matches: they leave their table and wait for their result (Finished). Body: `[matchId, ...]`. |
| `POST` | `/match/updateResult/{id}` | Enter an interim result; the match keeps running. Body: sets. |
| `POST` | `/match/setResult/{id}` | Enter the final result and complete the match; `?kampflos=true` makes it a Walkover won with that result. Body: sets. |
| `POST` | `/match/call` | First call of matches. Body: `[matchId, ...]`. |
| `POST` | `/playercall/{matchId}` | Request the next call of the players who have not appeared. Body: `[playerId, ...]`. |
| `POST` | `/playercall/announce` | Announce the requested calls of matches. Body: `[matchId, ...]`. |
| `GET` | `/matchaggregates/caller`, `/secondCall`, `/thirdCall` | Per table, the first Calls to announce and the requested Second and Third calls, with `callNumber`, `firstCallTime` and the players to call. |
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
`MATCH_COMPLETED`, `MATCH_FREED`, `MATCH_TAKEN_BACK`, `MATCH_CALLED`, `MATCH_CALL_REQUESTED`, `MATCH_SIDES_SET`,
`MATCH_DELETED`) or, for the Queue, as
`MATCH_LIST_CHANGED` on the `queue` topic (see [Real-time Updates](06_live_updates.md)).
