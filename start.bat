@echo off
cd /d "%~dp0"
echo =======================================
echo Starting Beaverly: Local-First AI Assistant
echo =======================================

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo 1. Starting FastAPI Backend on port 8000...
start "Beaverly Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

echo 2. Starting React Frontend on port 5173...
start "Beaverly Frontend" cmd /k "npm run dev"

echo Done! Both servers are starting in separate windows.
