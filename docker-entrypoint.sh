#!/bin/sh
# Start both backend and frontend
echo "Starting SpeedBilling..."
echo "Starting Backend (Spring Boot) on port 8080..."
java -jar /app/app.jar --server.port=8080 &
echo "Starting Frontend (Next.js) on port 3000..."
cd /app/frontend && node server.js --port=3000 &
# Wait for any process to exit
wait
