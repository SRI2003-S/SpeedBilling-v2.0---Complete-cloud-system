#!/bin/sh
# ============================================================
# SpeedBilling Backend - Docker Entrypoint
# Loads .env file and passes variables to Spring Boot
# ============================================================

# Load .env file if present next to the jar
ENV_DIR="$(dirname "$0")"
if [ -f "$ENV_DIR/.env" ]; then
    echo "Loading environment from $ENV_DIR/.env"
    set -a
    . "$ENV_DIR/.env"
    set +a
elif [ -f /app/.env ]; then
    echo "Loading environment from /app/.env"
    set -a
    . /app/.env
    set +a
fi

echo "Starting SpeedBilling Backend..."
echo "DB URL: ${SUPABASE_DB_URL:-using application.yml default}"

exec java -jar /app/app.jar --server.port=8080
