# Discipline Management

This document specifies the functionality for managing tournament disciplines.

## Discipline Attributes
Each discipline (e.g., Men's Single, Women's Double) has several attributes:
- **Name**: Human-readable name (e.g., "Herren A").
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
- **Creation**: Administrators can create new disciplines with specific rules.
- **Registration**: Players or doubles are registered for specific disciplines.
- **Grouping**: The system automatically or manually assigns players to groups.
- **Seeding**: Players are seeded in groups or the KO bracket based on their TTR.

## API Endpoints (from Backend)
- `GET /api/type/all`: Retrieve all disciplines.
- `GET /api/type/active`: Retrieve only active disciplines.
- `DELETE /api/type/:id`: Delete a discipline by ID.
