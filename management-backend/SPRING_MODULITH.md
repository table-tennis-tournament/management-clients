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
    *   **Services**: Application logic (e.g., `TournamentService`).
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
