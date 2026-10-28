#!/bin/bash
set -e

echo "======================================="
echo "Starting Beaverly: Local-First AI Assistant"
echo "======================================="

# 1. Start FastAPI Backend in background
echo "1. Starting FastAPI Backend on port 8000..."
cd "$(dirname "$0")/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start React Frontend
echo "2. Starting React Frontend on port 5173..."
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

