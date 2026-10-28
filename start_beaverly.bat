@echo off
title Beaverly Legal AI Platform
echo ========================================================
echo   Starting Beaverly Legal AI (Backend: 8000, Web: 5173)
echo ========================================================

cd /d "%~dp0backend"
start "Beaverly Backend (:8000)" cmd /k "python -m uvicorn main:app --port 8000 --reload"

cd /d "%~dp0"
start "Beaverly Frontend (:5173)" cmd /k "npm run dev"

echo Done. Backend and Frontend running in persistent Windows windows.
