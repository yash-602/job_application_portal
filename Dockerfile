# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
# Runtime env vars are injected by Render and passed directly as JVM args
# This guarantees MongoDB URI is used regardless of what is baked into the JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "-c", "exec java -jar /app/app.jar --spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI} --spring.mail.username=${SPRING_MAIL_USERNAME} --spring.mail.password=${SPRING_MAIL_PASSWORD} --jwt.secret=${JWT_SECRET} --cookie.secure=${COOKIE_SECURE} --cookie.same-site=${COOKIE_SAMESITE}"]
