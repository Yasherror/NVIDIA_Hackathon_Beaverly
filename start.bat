@echo off
echo =======================================
echo Starting Beaverly: Local-First AI Assistant
echo =======================================

echo 1. Starting FastAPI Backend...
start "Beaverly Backend" cmd /k "cd backend && uvicorn main:app --reload --port 8000"

echo 2. Starting React Frontend...
start "Beaverly Frontend" cmd /k "npm run dev"

echo Done! Both servers are starting in separate windows. You can close this window now.
