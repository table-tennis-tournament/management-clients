# Table Management

This document specifies the functionality for managing tournament tables.

## Table Attributes
- **ID**: Internal unique identifier.
- **Table Number**: The physical table number in the venue.
- **Match ID**: Optional. The ID of the current match being played on this table.

## Table Operations
- **Overview**: Administrators see a list of all tables and their current status (Free, Occupied).
- **Match Assignment**: A match can be assigned to a specific table.
- **Multiple Assignments**: Some tables may support multiple matches assigned in a sequence (Match List).

## Table Status
- **Free**: No match is currently active on this table.
- **Occupied**: A match is being played.
- **Reserved**: A table can be reserved for a specific match even before the players are called.

## API Endpoints (from Backend)
- `GET /api/table/all`: Retrieve all table information.
- `POST /api/match/setMatchToTable/:tableName`: Assign matches to a table by number.
- `POST /api/match/removeMatchesFromTable/:tableId`: Free up a table by removing matches.
