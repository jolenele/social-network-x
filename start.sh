#!/bin/sh

echo "Starting application..."

# Set default port if not provided by App Engine
export PORT=${PORT:-8080}
export EXPRESS_PORT=${EXPRESS_PORT:-3001}
export EXPRESS_API_URL=${EXPRESS_API_URL:-http://localhost:3001}
export NODE_ENV=${NODE_ENV:-production}

echo "Environment:"
echo "  PORT=$PORT"
echo "  EXPRESS_PORT=$EXPRESS_PORT"
echo "  EXPRESS_API_URL=$EXPRESS_API_URL"
echo "  NODE_ENV=$NODE_ENV"

# Start Express server in background
echo "Starting Express server on port $EXPRESS_PORT..."
node dist/server/index.js &
EXPRESS_PID=$!

# Wait for Express to be ready
echo "Waiting for Express server to start..."
EXPRESS_READY=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -f http://localhost:$EXPRESS_PORT/health > /dev/null 2>&1; then
    echo "✓ Express server is ready"
    EXPRESS_READY=1
    break
  fi
  echo "  Waiting... ($i/10)"
  sleep 1
done

if [ $EXPRESS_READY -eq 0 ]; then
  echo "✗ Express server failed to start"
  kill $EXPRESS_PID 2>/dev/null || true
  exit 1
fi

# Function to handle shutdown
cleanup() {
  echo "Shutting down..."
  kill $EXPRESS_PID $NEXT_PID 2>/dev/null || true
  wait $EXPRESS_PID $NEXT_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGTERM SIGINT

# Start Next.js on the port provided by App Engine (foreground process)
echo "Starting Next.js on port $PORT..."
PORT=$PORT npm start &
NEXT_PID=$!

# Wait for Next.js to be ready
echo "Waiting for Next.js to start..."
NEXT_READY=0
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -f http://localhost:$PORT/api/config > /dev/null 2>&1; then
    echo "✓ Next.js is ready"
    NEXT_READY=1
    break
  fi
  echo "  Waiting... ($i/15)"
  sleep 2
done

if [ $NEXT_READY -eq 0 ]; then
  echo "✗ Next.js failed to start"
  cleanup
  exit 1
fi

echo "✓ Application is ready and listening on port $PORT"

# Keep the script running and wait for both processes
# This ensures the container stays alive
while kill -0 $EXPRESS_PID 2>/dev/null && kill -0 $NEXT_PID 2>/dev/null; do
  sleep 1
done

# If we get here, one of the processes died
echo "One of the processes exited unexpectedly"
cleanup
exit 1

