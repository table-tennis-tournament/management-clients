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

# Extract layers
RUN java -Djarmode=layertools -jar target/*.jar extract

# Final stage
FROM bellsoft/liberica-openjre-alpine:25
WORKDIR /home/app

# Copy layers from builder
COPY --from=builder /home/app/dependencies/ ./
COPY --from=builder /home/app/spring-boot-loader/ ./
COPY --from=builder /home/app/snapshot-dependencies/ ./
COPY --from=builder /home/app/application/ ./

# Expose port (default Spring Boot port)
EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
