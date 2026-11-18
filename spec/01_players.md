# Player Management

This document specifies the functionality for managing players in the tournament registration software.

## Player Data
Each player in the system must have the following attributes:
- **ID**: Unique identifier.
- **First Name**: Player's first name.
- **Last Name**: Player's last name.
- **TTR (Table Tennis Rating)**: Numerical ranking value used for seeding.
- **Club**: The club the player belongs to.
- **Paid Status**: Boolean flag indicating if the player has paid the registration fee.
- **Active Status**: Boolean flag indicating if the player is currently participating.

## Registration
Players can be added to the tournament through the administrative interface.
- **Adding Players**: New players are registered with their name, club, and TTR. Players normally come from the mktt database; registering here is for late entries.
- **Active State**: Players can be marked as active or inactive. Only active players are eligible for match planning.
- **Paid State**: The system tracks whether a player has paid, per registration for a discipline. This is typically managed by the tournament secretary. The player list shows the registrations of singles disciplines that have no matches yet, i.e. before the draw.

## Doubles Formation
For double disciplines, players must be paired into teams (a **Double**). Doubles are formed in mktt; the backend reads them.
- **Pairing**: Two players are assigned to a "Double" team.
- **Eligibility**: Both players must be registered and active.
- **Disciplines**: A double team is registered for a specific double discipline (e.g., Men's Doubles, Mixed Doubles).

## API Endpoints

All paths are relative to the backend's `/api/v2` prefix (for example `GET /api/v2/players/all`). Commands answer
`{"success": true}`, or a 400 with `{"success": false, "message": ...}` when they are rejected. The OpenAPI description
is served by the backend itself (port 8080, not through nginx) at `/v3/api-docs`, with a Swagger UI at `/api-docs-ui`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/players` (also `/players/all`) | All players. |
| `GET` | `/players/{id}` | One player; 404 if unknown. |
| `GET` | `/players/type/{typeId}` | The players registered for a discipline. |
| `GET` | `/players/allTypePerPlayer` | Registrations (player, discipline, paid) of singles disciplines without matches. |
| `POST` | `/players` | Register a player. Body: `{"firstName", "lastName", "ttr", "sex", "clubId"}`; answers the player. |
| `POST` | `/players/{id}/unregister` | Remove a player. |
| `POST` | `/players/{id}/paid?paid={true\|false}` | Set the paid status of the **registration** `{id}` (not the player id). |
| `POST` | `/players/{id}/active/{true\|false}` | Set whether the player is active. |
| `GET` | `/players/load` | Service check, kept for the legacy clients. |

Changes are published on the `players` topic: `PLAYER_REGISTERED`, `PLAYER_UNREGISTERED`, `PLAYER_PAID`,
`PLAYER_ACTIVE_CHANGED` (see [Real-time Updates](06_live_updates.md)).
