#!/bin/bash
set -e

echo "======================================="
echo "Starting Beaverly: Local-First AI Assistant"
echo "======================================="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Install frontend dependencies if not installed
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$ROOT_DIR"
    npm install
fi

# 2. Start FastAPI Backend in background
echo "1. Starting FastAPI Backend on port 8000..."
cd "$ROOT_DIR/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 3. Start React Frontend
echo "2. Starting React Frontend on port 5173..."
cd "$ROOT_DIR"
npm run dev &
FRONTEND_PID=$!

echo "======================================="
echo "Beaverly is now running!"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to terminate both servers."
echo "======================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
