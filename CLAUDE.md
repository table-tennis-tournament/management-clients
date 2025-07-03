# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a table tennis tournament management system with a microservices architecture:

- **Backend**: Scala Play Framework (2.13.14) with Play 2.9.x, using MariaDB/MySQL for persistence
- **Frontend Applications**: Three separate Angular SPAs using ngrx for state management
  - `admin-view`: Tournament management interface (Angular 19, port 4201)
  - `result-view`: Results display interface (Angular 14, port 4202)  
  - `tablemanager-view`: Table-specific management interface (Angular 14, default port)

The system uses WebSockets (SockJS) for real-time communication between components and Redux/ngrx for client-side state management across all Angular apps.

## Development Commands

### Backend (Scala/Play)
```bash
cd backend
sbt run          # Start development server
sbt test         # Run tests
sbt dist         # Build distribution package
sbt docker:publishLocal  # Build Docker image locally
```

### Frontend Applications

**Admin View:**
```bash
cd admin-view
npm start        # Start dev server on port 4201
npm run build    # Build for production
npm test         # Run tests
npm run lint     # Run linting
npm run e2e      # Run end-to-end tests
```

**Result View:**
```bash
cd result-view
npm start        # Start dev server on port 4202
npm run build    # Build for production
npm test         # Run tests
npm run test-ci  # Run tests in CI mode
npm run lint     # Run linting
```

**Table Manager View:**
```bash
cd tablemanager-view
npm start        # Start dev server
npm run build    # Build for production
npm test         # Run tests
npm run test-ci  # Run tests in CI mode
npm run lint     # Run linting
```

### Full System
```bash
docker-compose up  # Start all services (MariaDB, backend, frontend)
```

## Key Technologies

- **Backend**: Play Framework, Slick ORM, Pekko Actors, MySQL/MariaDB
- **Frontend**: Angular, ngrx/store, Angular Material, Bootstrap, RxJS
- **Real-time**: WebSockets via SockJS and custom WebSocket actors
- **PDF Generation**: Flying Saucer PDF renderer
- **Containerization**: Docker with multi-stage builds

## Architecture Notes

- Each Angular app has its own Redux store with effects, actions, and reducers
- WebSocket communication handles real-time updates across all clients
- The backend uses Pekko actors for concurrent processing and WebSocket management
- Database migrations are handled via Play Evolutions
- All frontend apps proxy API calls to the backend during development

## Database

The system uses MariaDB/MySQL with the following key models:
- Match management and assignment
- Player and team data
- Tournament results and stages
- Table assignments and scheduling

Connection configured via environment variables:
- `MYSQL_JDBC`: Database connection string
- `MYSQL_USER`: Database username  
- `MYSQL_PW`: Database password