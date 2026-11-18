# Management Backend

Next-generation table tennis tournament management backend built with **Spring Boot 4.1**, **Kotlin**, and **Spring Modulith**.

## Architecture

This project follows a **Modular Monolith** architecture using **Spring Modulith**. Each module follows an onion architecture (`domain` → `application` → `infrastructure`), is independently testable, and can be decomposed into a microservice if needed.

### Key Technologies
- **Java 25**
- **Kotlin 2.4**
- **Spring Boot 4.1.x**
- **Spring Modulith 2.1.x**: Domain-driven design with verified module boundaries.
- **MariaDB** in production, **H2** (MySQL mode) in tests.
- **JdbcClient + plain SQL**: no JPA, no Hibernate.

### Modules
- `registration`: players, clubs, doubles, disciplines and registration state (paid/active/seed).
- `grouping`: group standings when a group's last match is completed (formation and seeding stay in mktt; knockout placement is not migrated yet).
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
- `SPRING_DATASOURCE_URL`: JDBC URL (e.g., `jdbc:mariadb://localhost:3306/saturday_test`)
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.mariadb.jdbc.Driver` for MariaDB
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `DEFAULT_PRINTER`: printer used until one is selected (default `PDF`)

Without them the backend starts on an in-memory H2 database.

### Running
There is no Maven wrapper; use `mvn`.

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile starts MariaDB from `docker-compose.yml` in this folder (port 3307). That database has no mktt
tables; load a dump from `../testdata/` or use the root `docker compose up`, which seeds one.

### Tests
```bash
mvn test
```

- `OnionArchitectureTests` (ArchUnit) enforces the onion layering per module.
- `ApplicationTests` runs `ApplicationModules.verify()` to enforce Modulith module boundaries.
- `RegistrationModuleTest` and `TournamentModuleTest` are `@ApplicationModuleTest` module integration tests.
- `*IT` classes are `@SpringBootTest`s against an in-memory H2 database. The REST tests have one class per root
  resource under `/api/v2` (`MatchResourceIT` for `/match`, `TableResourceIT` for `/table`, …), all extending
  `ResourceIT`; their expected responses are in `src/test/resources/expected/<resource>/`.
- No integration test prints: `RecordingPrinterGateway` replaces the `lpr` gateway and records the jobs.

Integration tests are deterministic:

- `DatabaseHelper` (via `@Import(DatabaseHelperConfiguration::class)`) empties every table before each test;
  each test inserts exactly the rows it needs.
- `DeterministicTestConfiguration` replaces the `Clock` (2026-11-16 10:00, Europe/Berlin) and the
  `IdGenerator` (UUIDs `…0001`, `…0002`, … restarted by `DatabaseHelper.clean()`).

REST responses and WebSocket events are compared completely (every field, array order, no extra
fields) with the files in `src/test/resources/expected/`. After an intended change to a response or an
event, re-record the files and review the diff before committing:

```bash
mvn test -DupdateExpected=true
git diff src/test/resources/expected
```

Mutation testing of the `domain` packages runs on demand:
`mvn test-compile org.pitest:pitest-maven:mutationCoverage` (report in `target/pit-reports/index.html`).

## Deployment
```bash
docker build -t ttt-management-backend .
```
