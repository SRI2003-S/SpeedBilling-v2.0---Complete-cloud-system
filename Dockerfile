# ============================================================
# SpeedBilling Backend - Dockerfile for Render
# ============================================================

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache bash
WORKDIR /app
COPY --from=build /app/target/speedbilling-backend-2.0.0.jar app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY .env /app/.env
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
