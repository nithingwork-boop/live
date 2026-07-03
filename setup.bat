@echo off
setlocal

rem ============================================================
rem  FLOW - Setup (Windows)
rem  Creates venvFinOps and installs Python, backend, and frontend
rem  dependencies.
rem ============================================================

set "ROOT=%~dp0"
set "VENV=%ROOT%venvFinOps"

cd /d "%ROOT%"

echo ============================================
echo  FLOW - Setup
echo ============================================

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python was not found on PATH.
    echo Install Python 3.10+ and enable "Add python.exe to PATH".
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found on PATH.
    echo Install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

where uv >nul 2>nul
if errorlevel 1 (
    echo [INFO] uv was not found on PATH.
    echo [INFO] Installing uv...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"
    if errorlevel 1 (
        echo [ERROR] Failed to install uv.
        echo Install it manually from https://docs.astral.sh/uv/getting-started/installation/
        pause
        exit /b 1
    )
    set "PATH=%USERPROFILE%\.local\bin;%PATH%"
    where uv >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] uv installed, but was not found on PATH.
        echo Close this terminal and run setup.bat again.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Python:
python --version
echo [INFO] npm:
call npm --version
echo [INFO] uv:
uv --version

echo.
echo [1/4] Creating Python virtual environment...
if exist "%VENV%\Scripts\activate.bat" (
    echo [INFO] venvFinOps already exists.
) else (
    python -m venv "%VENV%"
    if errorlevel 1 (
        echo [ERROR] Failed to create venvFinOps.
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Installing Python dependencies...
if exist "%ROOT%requirements.txt" (
    uv pip install --python "%VENV%\Scripts\python.exe" -r "%ROOT%requirements.txt"
) else if exist "%ROOT%backend\services\crew\requirements.txt" (
    uv pip install --python "%VENV%\Scripts\python.exe" -r "%ROOT%backend\services\crew\requirements.txt"
) else (
    echo [WARN] No Python requirements file found.
)
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies with uv.
    pause
    exit /b 1
)

echo.
echo [3/4] Installing backend dependencies...
if not exist "%ROOT%backend\package.json" (
    echo [ERROR] backend\package.json not found.
    pause
    exit /b 1
)
pushd "%ROOT%backend"
call npm install
if errorlevel 1 (
    popd
    echo [ERROR] Backend npm install failed.
    pause
    exit /b 1
)
popd

echo.
echo [4/4] Installing frontend dependencies...
if not exist "%ROOT%frontend\package.json" (
    echo [ERROR] frontend\package.json not found.
    pause
    exit /b 1
)
pushd "%ROOT%frontend"
call npm install
if errorlevel 1 (
    popd
    echo [ERROR] Frontend npm install failed.
    pause
    exit /b 1
)
popd

echo.
echo ============================================
echo  Setup complete.
echo  Run run.bat to start FLOW.
echo ============================================
pause

endlocal
