# Management Backend

Next-generation table tennis tournament management backend built with **Spring Boot 4.1**, **Kotlin**, and **Spring Modulith**.

## Architecture

This project follows a **Modular Monolith** architecture using **Spring Modulith**. Each module follows an onion architecture (`domain` → `application` → `infrastructure`), is independently testable, and can be decomposed into a microservice if needed.

### Key Technologies
- **Java 25**
- **Kotlin 2.3.x**
- **Spring Boot 4.1.x**
- **Spring Modulith 2.1.x**: Domain-driven design with verified module boundaries.
- **MariaDB** in production, **H2** (MySQL mode) in tests.
- **JdbcClient + plain SQL**: no JPA, no Hibernate.

### Modules
- `registration`: players, clubs, doubles, disciplines and registration state (paid/active/seed).
- `grouping`: group formation and seeding (scaffolded, not yet implemented).
- `tournament`: match lifecycle, Queue/MatchList, table assignment, results, caller and table-manager operations.
- `settings`: system settings and printing (referee sheets, certificates).
- `outbound`: the single WebSocket publisher, consuming domain events.

### Onion layering per module
- `domain`: aggregates, value objects and repository ports (interfaces).
- `application`: use-case orchestration and event publication.
- `infrastructure.database`: JdbcClient repository adapters.
- `infrastructure.web`: REST controllers.
- `infrastructure.messaging`: event listeners/publishers.

Dependencies point inward: `infrastructure → application → domain`.

## Getting Started

### Prerequisites
- JDK 25
- Maven 3.9+

### Environment Variables
- `SPRING_DATASOURCE_URL`: JDBC URL (e.g., `jdbc:mariadb://localhost:3306/ttt`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Running
```bash
./mvnw spring-boot:run
```

### Tests
```bash
./mvnw test
```

- `OnionArchitectureTests` (ArchUnit) enforces the onion layering per module.
- `ApplicationTests` runs `ApplicationModules.verify()` to enforce Modulith module boundaries.
- `RegistrationModuleTest` is a `@ApplicationModuleTest` module integration test.
- `OutboundModuleIT` is a `@SpringBootTest` that verifies a WebSocket message on player registration.

## Deployment
```bash
docker build -t ttt-management-backend .
```
