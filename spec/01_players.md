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
- **Adding Players**: New players are registered with their name, club, and TTR.
- **Active State**: Players can be marked as active or inactive. Only active players are eligible for match planning.
- **Paid State**: The system tracks whether a player has paid. This is typically managed by the tournament secretary.

## Doubles Formation
For double disciplines, players must be paired into teams.
- **Pairing**: Two players are assigned to a "Double" team.
- **Eligibility**: Both players must be registered and active.
- **Disciplines**: A double team is registered for a specific double discipline (e.g., Men's Doubles, Mixed Doubles).

## API Endpoints (from Backend)
- `GET /api/player/all`: Retrieve all players.
- `GET /api/player/:id`: Retrieve a specific player by ID.
- `POST /api/player/setPaid/:id/:paid`: Update the paid status of a player.
- `POST /api/player/active/:id/:active`: Update the active status of a player.
