@echo off
REM Windows batch script to start the Garmin Service

REM Get the directory where this script is located
set mypath=%~dp0
cd /d "%mypath:~0,-1%"

echo Current directory: %cd%

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error creating virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error activating virtual environment
    pause
    exit /b 1
)

echo Installing dependencies...
pip install --upgrade pip
pip install -e .
pip install uvicorn[standard]

if errorlevel 1 (
    echo Error installing dependencies
    pause
    exit /b 1
)

REM Start the FastAPI server
echo.
echo Starting Garmin Service...
echo Access API docs at: http://127.0.0.1:8000/docs
echo.
python -m uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload

pause
