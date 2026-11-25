# Table Management

This document specifies the functionality for managing tournament tables.

## Table Attributes
- **ID**: Internal unique identifier.
- **Table Number**: The physical table number in the venue. It differs from the ID; the endpoints say which of the two they take.
- **Locked**: A locked table is not used for assignments or the automatic start.
- **Matches**: The matches assigned to or being played on the table.

## Table Operations
- **Overview**: Administrators see a list of all tables and their current status (Free, Occupied). In the Tables and
  the Assign view, a table with a started match shows its current result (the Sets won and the points of each Set) and
  when it started and for how long it has been running (`startTime`).
- **Match Assignment**: A match can be assigned to a specific table.
- **Multiple Assignments**: Some tables may support multiple matches assigned in a sequence (Match List).

## Table Status
- **Free**: No match is assigned to the table and it is not locked.
- **Occupied**: A match is assigned to the table (being called) or being played on it.
- **Locked**: The table is taken out of use.

## Table Managers
Each table manager looks after a fixed set of tables (manager 1: tables 1-5, 2: 6-8, 11, 12, 3: 9, 10, 13-15,
4: 16-20, 5: 21-24) in the Table Manager View.

## API Endpoints

All paths are relative to the backend's `/api/v2` prefix (for example `GET /api/v2/players/all`). Commands answer
`{"success": true}`, or a 400 with `{"success": false, "message": ...}` when they are rejected. The OpenAPI description
is served by the backend itself (port 8080, not through nginx) at `/v3/api-docs`, with a Swagger UI at `/api-docs-ui`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/table/all` | All tables with their matches. |
| `GET` | `/table/free` | The tables without a match that are not locked. |
| `GET` | `/table/{id}` | One table by **id**; 404 if unknown. |
| `POST` | `/table/{nr}/lock` | Lock the table with the **number** `{nr}`. |
| `POST` | `/table/{nr}/unlock` | Unlock the table with the **number** `{nr}`. |
| `GET` | `/tables?table_manager={id}` | The tables and matches of one table manager (Table Manager View). |
| `POST` | `/match/matchtotable/{nr}` | Assign matches to the table with the **number** `{nr}`. Body: `[matchId, ...]`. |
| `POST` | `/match/matchtosecondtable/{nr}` | Let matches at a table wait at the table with the **number** `{nr}` as well (a group on two tables). Body: `[matchId, ...]`. |
| `POST` | `/match/remove/{tableId}` | Take matches that wait at two tables off the table with the **id** `{tableId}`; they keep waiting at the other. A match at one table only is rejected. Body: `[matchId, ...]`. |
| `GET` | `/match/allmatchtable` | Which match is on which table: `[{"matchId", "tableId"}]`. |

Locks are published on the `tables` topic (`TABLE_LOCKED`, `TABLE_UNLOCKED`); assignments on the `matches` topic.
