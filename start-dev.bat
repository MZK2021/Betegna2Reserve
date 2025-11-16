@echo off
echo Starting Betegna Development Servers...
echo.

echo Starting Backend (port 4000)...
start "Betegna Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend (port 5173)...
start "Betegna Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting in separate windows
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
pause

