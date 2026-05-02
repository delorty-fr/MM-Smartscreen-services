#!/bin/bash
# macOS/Linux bash script to run the Garmin Service

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"

# Activate virtual environment
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Error activating virtual environment"
    exit 1
fi

# Start the FastAPI server
echo
echo "Starting Garmin Service..."
echo "Access API docs at: http://127.0.0.1:8000/docs"
echo

python -m uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload
