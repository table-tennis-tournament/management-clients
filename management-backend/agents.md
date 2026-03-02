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
