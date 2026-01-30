@echo off
REM Quick Start Script for VondraLink Recommendation System (Windows)

echo.
echo ========================================
echo  VondraLink - Personalized Recommendations Setup
echo ========================================
echo.

REM Check if .env exists
if not exist "VondraLink\backend\.env" (
    echo [WARNING] No .env file found!
    echo [INFO] Creating .env from template...
    copy "VondraLink\backend\.env.example" "VondraLink\backend\.env"
    echo.
    echo [SUCCESS] Created VondraLink\backend\.env
    echo [IMPORTANT] Edit this file and add your API keys:
    echo    - GROQ_API_KEY or OPENAI_API_KEY
    echo    - QDRANT_URL
    echo    - QDRANT_API_KEY  
    echo    - QDRANT_COLLECTION
    echo.
    pause
)

echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [INFO] Installing Frontend dependencies...
cd VondraLink\frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo ========================================
echo  Setup Complete! Starting Servers...
echo ========================================
echo.

REM Start backend in a new window
echo [INFO] Starting Backend Server on http://localhost:8000
start "VondraLink Backend" cmd /k "cd VondraLink\backend && uvicorn main:app --reload --port 8000"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo [INFO] Starting Frontend Server on http://localhost:5173
start "VondraLink Frontend" cmd /k "cd VondraLink\frontend && npm run dev"

echo.
echo ========================================
echo  VondraLink is Starting!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:5173
echo API Docs:     http://localhost:8000/docs
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
