@echo off
REM Windows batch script to start the Garmin Service

REM Get the directory where this script is located
set mypath=%~dp0
cd /d "%mypath:~0,-1%"

echo Current directory: %cd%

REM Check Python version (requires 3.12+)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python version: %PYTHON_VERSION%

REM Extract version number
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PY_VERSION=%%i
for /f "tokens=1 delims=." %%a in ('echo %PY_VERSION%') do set PY_MAJOR=%%a
for /f "tokens=2 delims=." %%b in ('echo %PY_VERSION%') do set PY_MINOR=%%b

REM Check if version is 3.12 or higher
if %PY_MAJOR% LSS 3 (
    echo ERROR: Python 3.12 or higher is required. Found: %PY_VERSION%
    pause
    exit /b 1
)
if %PY_MAJOR% EQU 3 if %PY_MINOR% LSS 12 (
    echo ERROR: Python 3.12 or higher is required. Found: %PY_VERSION%
    pause
    exit /b 1
)

echo Python version check passed.
echo.
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
