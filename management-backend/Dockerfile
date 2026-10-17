# Builder stage
FROM bellsoft/liberica-openjdk-alpine:25 AS builder

# Install Maven
RUN apk add --no-cache maven

WORKDIR /home/app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Final stage
FROM bellsoft/liberica-openjre-alpine:25
WORKDIR /home/app

# Copy the executable fat jar
COPY --from=builder /home/app/target/*.jar app.jar

# Expose port (default Spring Boot port)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
