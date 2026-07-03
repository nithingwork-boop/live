@echo off
setlocal

rem ============================================================
rem  FLOW - Run All Services (Windows)
rem  Starts the backend API, frontend dashboard, and CrewAI service
rem  in separate terminal windows.
rem ============================================================

set "ROOT=%~dp0"
set "VENV=%ROOT%venvFinOps"

cd /d "%ROOT%"

echo ============================================
echo  FLOW - Starting all services
echo ============================================

if not exist "%ROOT%backend\package.json" (
    echo [ERROR] backend\package.json not found. Run this script from the project root.
    pause
    exit /b 1
)

if not exist "%ROOT%frontend\package.json" (
    echo [ERROR] frontend\package.json not found. Run this script from the project root.
    pause
    exit /b 1
)

if not exist "%ROOT%backend\services\crew\app\main.py" (
    echo [ERROR] backend\services\crew\app\main.py not found.
    pause
    exit /b 1
)

if not exist "%VENV%\Scripts\activate.bat" (
    echo [ERROR] venvFinOps not found.
    echo Run setup.bat before starting FLOW.
    pause
    exit /b 1
)

echo.
echo [INFO] Launching Backend API on http://localhost:8081
start "FLOW - Backend API (8081)" cmd /k "cd /d ""%ROOT%backend"" && call npm run start:dev"

echo [INFO] Launching Frontend Dashboard on http://localhost:5173
start "FLOW - Frontend (5173)" cmd /k "cd /d ""%ROOT%frontend"" && call npm run dev"

echo [INFO] Launching CrewAI Service on http://localhost:8000
start "FLOW - CrewAI Service (8000)" cmd /k "cd /d ""%ROOT%backend\services\crew"" && call ""%VENV%\Scripts\activate.bat"" && python -m uvicorn app.main:app --reload --port 8000"

echo.
echo ============================================
echo  Services are starting in separate windows.
echo.
echo   Web Dashboard : http://localhost:5173
echo   API REST      : http://localhost:8081/v1/costs
echo   GraphQL       : http://localhost:8081/graphql
echo   CrewAI Health : http://localhost:8000/health
echo ============================================
pause

endlocal
