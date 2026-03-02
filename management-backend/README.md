# Management Backend

Next-generation table tennis tournament management backend built with **Spring Boot 4.x**, **Kotlin**, and **Spring Modulith**.

## Architecture

This project follows a **Modular Monolith** architecture using **Spring Modulith**. It is designed to be highly maintainable and easily decomposable into microservices if needed.

### Key Technologies
- **Java 25**: Leveraging the latest JVM features.
- **Kotlin 2.3.x**: Modern, expressive language with strong null-safety.
- **Spring Boot 4.0.3**: Bleeding-edge Spring Boot features.
- **Spring Modulith 2.0.x**: Domain-driven design with verified module boundaries.
- **MariaDB**: Robust relational database for persistence.
- **JPA / Hibernate**: For data mapping.
- **WebSocket**: Real-time tournament updates.

### Modules
- `registration`: Manages player and team registrations for disciplines.
- `table`: Handles match assignments and table management.

## Getting Started

### Prerequisites
- JDK 25
- Maven 3.9+
- MariaDB (Local or Docker)

### Environment Variables
Configure your database connection using the following environment variables:
- `SPRING_DATASOURCE_URL`: JDBC URL for MariaDB (e.g., `jdbc:mariadb://localhost:3306/ttt`)
- `SPRING_DATASOURCE_USERNAME`: Database user
- `SPRING_DATASOURCE_PASSWORD`: Database password

### Running the Application
```bash
./mvnw spring-boot:run
```

### Running Tests
The project uses **ArchUnit** and **Spring Modulith Test** to verify architectural boundaries.
```bash
./mvnw test
```

## Modular Monolith Verification
You can verify the module structure and generate documentation by running:
```bash
./mvnw test -Dtest=ModularityTests
```
*(Ensure you have a test class that calls `ApplicationModules.of(ManagementBackendApplication::class.java).verify()`)

## API Documentation
Once running, the Swagger/OpenAPI UI is available at:
`http://localhost:8080/swagger-ui.html` (if configured)

## Deployment
The backend can be containerized using the provided Dockerfile:
```bash
docker build -t ttt-management-backend .
```
