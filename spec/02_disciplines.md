# Discipline Management

This document specifies the functionality for managing tournament disciplines.

## Discipline Attributes
Each discipline (e.g., Men's Single, Women's Double) has several attributes:
- **Name**: Human-readable name (e.g., "Herren A"). mktt names a singles discipline and its doubles discipline alike; the backend shows the doubles one as "Herren A-Doppel".
- **Kind**: Type of discipline (1 = Single, 2 = Double).
- **Active State**: Only active disciplines are shown in the match planning and results views.
- **System**: The tournament system used (e.g., "Groups then KO", "Direct KO").
- **TTR Range**: Minimum and maximum TTR allowed for registration.
- **Gender/Age**: Restrictions on who can register.

## Tournament Systems
- **Group Phase (Round-robin)**: Players are divided into groups (e.g., 4 players each). Every player plays against every other player in the group.
- **KO Phase**: A single-elimination bracket is formed based on the results of the group phase or direct registration.
- **KO Size**: The size of the KO bracket (e.g., 16, 32, 64).

## Discipline Management
- **Creation**: Disciplines and their rules are created in mktt.
- **Registration**: Players or doubles are registered for specific disciplines (in mktt; late entries in the admin view).
- **Grouping**: mktt assigns players to groups and creates the group and KO matches.
- **Seeding**: Players are seeded in groups or the KO bracket based on their TTR, in mktt.
- **Standings**: After every result change of a group match (a result, a correction, a take back), the backend ranks the group by its matches with a result (matches won, then set difference, then points won) and writes the places to mktt's `playerpergroup`. A match freed from its table counts once its result is entered. The places are current while the group is still being played; mktt draws the knockout stage from them.
- **Disciplines a player is in**: Every player in a match response carries `types`, the ids of the disciplines the player is still in, sorted. admin-view's supervisor view shows them as small squares in the discipline colors next to the player's name. A doubles team's players are in its discipline. Per discipline:
  - without matches: a registered player is in;
  - with a knockout stage (any match of group `999`): a player is in while they have a match without a result, so a knockout loss takes them out;
  - otherwise: a player is in while they have a match without a result, while their group is not finished, or when they finished their group within its qualifying places (`playgroups.Grou_QualPos`, 2 when it is not a number).

  The disciplines' `active` flag does not matter.
- **Colors**: Each discipline can get a background and a text color, used by the admin view to mark its matches.
- **Short name**: Each discipline can get a short name of at most 30 characters (e.g. "J18 B" for "Jungen 18 B 1201-1400"), set in the admin view's settings. The admin view's table cards show it instead of the full name. mktt's `type` table has no column for it, so it is stored in the sidecar table `mgmt_type_short_name`.
- **KO placement**: Writing the winner of a KO match into the next KO match is not migrated from the legacy backend yet.

## API Endpoints

All paths are relative to the backend's `/api/v2` prefix (for example `GET /api/v2/players/all`). Commands answer
`{"success": true}`, or a 400 with `{"success": false, "message": ...}` when they are rejected. The OpenAPI description
is served by the backend itself (port 8080, not through nginx) at `/v3/api-docs`, with a Swagger UI at `/api-docs-ui`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/types/all` | All disciplines of the tournament module, doubles named "…-Doppel". |
| `GET` | `/types/open/all` | The active disciplines (used by the result view). |
| `GET` | `/disciplines` | All disciplines of the registration module. |
| `GET` | `/disciplines/active` | The active disciplines of the registration module. |
| `DELETE` | `/match/type/{id}` | Delete all matches of a discipline. |
| `GET` | `/disciplines/colors` | The colors of all disciplines: `{"<typeId>": {"bgColor", "textColor"}}`. |
| `POST` | `/disciplines/{id}/color` | Set the colors of one discipline. Body: `{"bgColor", "textColor"}`, each a CSS color of at most 7 characters. |
| `PUT` | `/disciplines/colors` | Set the colors of several disciplines. Body: the map of `GET /disciplines/colors`. |
| `GET` | `/disciplines/short-names` | The short names of the disciplines that have one: `{"<typeId>": "<shortName>"}`. |
| `PUT` | `/disciplines/{id}/short-name` | Set the short name of one discipline. Body: `{"shortName"}`, trimmed, at most 30 characters; a blank one removes it. |

Color changes are published on the `settings` topic as `DISCIPLINE_COLORS_CHANGED`, short name changes as
`DISCIPLINE_SHORT_NAME_CHANGED`.
