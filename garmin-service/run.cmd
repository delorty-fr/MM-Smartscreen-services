@echo off
REM Windows batch script to start the Garmin Service

REM Get the directory where this script is located
set mypath=%~dp0
cd /d "%mypath:~0,-1%"

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Creating it...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -e .
)

REM Install/update dependencies
pip install -e . --quiet

REM Start the FastAPI server
echo Starting Garmin Service...
uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload
