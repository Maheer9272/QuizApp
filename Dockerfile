FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /app
# Copy Maven descriptor and resolve dependencies first for better caching
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy the application source code and build the jar
COPY src ./src
RUN mvn clean package -DskipTests
# -------- Run Stage --------
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/QuizApp-0.0.1-SNAPSHOT.jar .

EXPOSE 8080
# Start the application
ENTRYPOINT ["java", "-jar", "/app/QuizApp-0.0.1-SNAPSHOT.jar"]