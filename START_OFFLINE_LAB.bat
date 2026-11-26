@echo off
title AERO - SPACE SIMULATOR - Offline Laboratory
color 0b
cls

echo =========================================================================
echo       AERO - SPACE SIMULATOR - ADVANCED 3D VIRTUAL LABORATORY
echo                     OFFLINE LABORATORY LAUNCHER
echo =========================================================================
echo.
echo [INFO] Initializing offline 3D aerospace simulation engine...
echo [INFO] Zero internet connection required.
echo.

cd /d "%~dp0"

:: Check if dist exists, if not build it
if not exist "dist\index.html" (
    echo [INFO] Building standalone offline production bundle...
    call npm run build
    echo.
)

:: Option A: Check for Node.js / npm preview server
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [STARTING] Launching high-speed local offline simulator on port 4173...
    start http://localhost:4173
    call npm run preview -- --port 4173 --host
    goto END
)

:: Option B: Check for Python 3 built-in offline server
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [STARTING] Launching via Python local server on port 8080...
    cd dist
    start http://localhost:8080
    python -m http.server 8080
    goto END
)

:: Option C: Direct browser opening
echo [STARTING] Opening standalone offline bundle directly in default browser...
start dist\index.html

:END
pause
