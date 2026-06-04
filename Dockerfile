# ============================================================
# SpeedBilling - Docker Multi-Stage Build
# ============================================================

# ---- Backend Stage ----
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# ---- Frontend Stage ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Production Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install Node for Next.js standalone
RUN apk add --no-cache nodejs npm

# Copy backend JAR
COPY --from=backend-build /app/backend/target/speedbilling-backend-2.0.0.jar app.jar

# Copy frontend standalone output
COPY --from=frontend-build /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-build /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-build /app/frontend/public ./frontend/public

# Expose ports
EXPOSE 8080 3000

# Start both services using a script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
