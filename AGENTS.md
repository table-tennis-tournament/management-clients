# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Architecture Overview

This is a table tennis tournament management system with a microservices architecture:

- **Backend**: Scala 2.13.14 on Play Framework 3.0.x (Pekko-based), using MariaDB/MySQL for persistence
- **Frontend Applications**: Three separate Angular 21 SPAs using ngrx for state management
  - `admin-view`: Tournament management interface (port 4201)
  - `result-view`: Results display interface (port 4202)
  - `tablemanager-view`: Table-specific management interface (port 4200)

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
npm test         # Run unit tests (Vitest)
npm run test-ci  # Run tests in CI mode
npm run lint     # Run linting
npm run e2e      # Run Playwright end-to-end tests
```

**Table Manager View:**
```bash
cd tablemanager-view
npm start        # Start dev server on port 4200
npm run build    # Build for production
npm run lint     # Run linting
npm run e2e      # Run Playwright end-to-end tests
```

### Full System
```bash
docker compose up  # Start MariaDB and the backend; the clients are commented out in docker-compose.yml
```

## Key Technologies

- **Backend**: Scala 2.13, Play Framework 3.0.x, Slick ORM, Pekko Actors, MySQL/MariaDB
- **Frontend**: Angular 21, ngrx/store, Angular Material, Bootstrap, RxJS, TypeScript 5.9
- **Testing**: ScalaTest/spec2 (backend), Karma/Jasmine (Admin View), Vitest (Result View), Playwright (Result View and Table Manager View)
- **Real-time**: WebSockets via SockJS and custom WebSocket actors
- **PDF Generation**: Flying Saucer / PDFBox
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