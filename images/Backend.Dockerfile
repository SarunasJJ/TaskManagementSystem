FROM openjdk:21-jdk-slim

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

RUN chmod +x ./mvnw && \
    ./mvnw dependency:go-offline -B && \
    ./mvnw clean package -DskipTests && \
    mkdir -p /app/logs

EXPOSE 8080

CMD ["java", "-jar", "target/psk-app.jar"]