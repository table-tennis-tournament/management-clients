# AGENTS.MD

This file provides guidance to AI agents (like Gemini CLI, Claude Code, etc.) when working with the **management-backend** module.

## Project Context
- **Language**: Kotlin 2.3.x (with `kotlin-maven-allopen` and `spring` plugins)
- **Framework**: Spring Boot 4.x (Next-generation)
- **Architecture**: Spring Modulith (Modular Monolith)
- **Database**: MariaDB (Relational)
- **JVM**: Java 25 (Latest LTS-like release)

## Architecture & Design Patterns

### Spring Modulith Rules
- The root package is `de.ttt.management`.
- Modules are located directly under the root package (e.g., `registration`, `table`).
- **Internal Visibility**: Classes in sub-packages of a module (e.g., `registration.infrastructure`) should be internal or not exported unless they are part of the module's API.
- **Inter-module Communication**: Prefer **Spring ApplicationEvents** for loose coupling between modules. Avoid direct dependencies between modules if possible.
- **Verification**: Always run `ApplicationModules.of(ManagementBackendApplication::class.java).verify()` in a test to ensure architectural integrity.

### Kotlin Conventions
- Use `data class` for DTOs and simple domain models.
- Use `val` by default for immutability.
- Leverage Kotlin's null-safety; avoid `!!` at all costs.
- Prefer `inline` and `reified` where appropriate.
- Use `runCatching` or specific exception handling instead of Java-style try-catch for better idiomatic code.

### JPA & Database (MariaDB)
- Use `Spring Data JPA` repositories.
- Map entities with standard JPA annotations, but consider Kotlin's properties.
- Use `LocalDateTime` for timestamps.
- Ensure all repository methods are tested with `@DataJpaTest` or `@SpringBootTest`.

## Development Workflow for Agents

### 1. Researching the Codebase
- Use `grep_search` to find module boundaries and shared components.
- Inspect `pom.xml` for version updates before adding new dependencies.

### 2. Implementation Strategy
- When adding a new feature, first identify which **Modulith module** it belongs to.
- If it spans multiple modules, create an **Event-driven** bridge.
- Follow the **Domain-Driven Design (DDD)** approach within each module:
    - `domain`: Pure business logic, entities, value objects.
    - `application`: Use cases, services, port interfaces.
    - `infrastructure`: JPA repositories, external adapters, controllers.

### 3. Testing & Verification
- **Always run `mvn clean install`** before completing a task to ensure:
    - Domain logic unit tests pass.
    - `ApplicationModuleTest` integration tests (which respect module boundaries) pass.
    - **Spring Modulith** architectural verification succeeds.
- Use `@MockkBean` for mocking in Kotlin tests.
- Verify that new modules or modified boundaries do not violate the Modulith structure.

## Key Files to Watch
- `management-backend/pom.xml`: Dependency management.
- `management-backend/src/main/kotlin/de/ttt/management/ManagementBackendApplication.kt`: Application entry point.
- `management-backend/src/test/kotlin/de/ttt/management/ModularityTests.kt`: Architectural verification.


# Spring Modulith Guidelines

This project uses [Spring Modulith](https://docs.spring.io/spring-modulith/reference/) to enforce architectural boundaries and maintain a clean, modular monolith.

## Module Structure

Each top-level package under `de.ttt.management` is considered a **Modulith Module**.

### Onion Architecture
Within each module, we follow the Onion Architecture:

1.  **`domain`**: Contains the core business logic.
  *   **Entities/Models**: Domain objects (e.g., `TournamentMatch`).
  *   **Repository Interfaces**: Abstractions for data access (e.g., `TournamentMatchRepository`).
2.  **`application`**: Orchestrates business logic and transactions.
  *   **Services**: Application logic (e.g., `MatchService`, `TableService`, `MatchListService`).
3.  **`infrastructure`**: Implementation details.
  *   **`database`**: Concrete repository implementations (e.g., `JdbcTournamentMatchRepository`).
  *   **`web`**: REST Controllers (e.g., `TournamentMatchController`).

## Module Interaction Rules

To maintain decoupling and allow for easier evolution (or eventual microservices split):

### 1. No Class Sharing between Modules
Modules **MUST NOT** share domain classes or services directly.
*   If the `tournament` module needs player information, it defines its own `TournamentPlayer` class.
*   Do not import classes from `de.ttt.management.registration` into `de.ttt.management.tournament`.

### 2. Event-Based Communication
Interaction between modules should primarily happen via **Events**.
*   Use Spring's `ApplicationEventPublisher` to publish events.
*   Use `@ApplicationModuleListener` to react to events from other modules.
*   Events are the only "shared" classes, but they should be placed in a package visible to other modules or be simple POJOs.

### 3. Visibility
*   By default, only the top-level package of a module is visible to other modules.
*   Internal packages like `infrastructure` and `application` are hidden.
*   To expose a specific sub-package, use Spring Modulith's `NamedInterface` or move shared contracts to the module root.

## Verification

Run the following command to verify module boundaries and generate documentation:

```bash
mvn test -Dtest=ApplicationTests
```

This test uses `ApplicationModules.of(ManagementBackendApplication::class.java).verify()` to ensure no illegal dependencies exist between modules.
