#!/bin/bash
# macOS/Linux bash script to set up the Garmin Service

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"

# Check Python version (requires 3.12+)
PYTHON_VERSION=$(python3 --version 2>&1)
echo "Python version: $PYTHON_VERSION"

# Extract version number
PY_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)

# Check if version is 3.12 or higher
if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 12 ]); then
    echo "ERROR: Python 3.12 or higher is required. Found: $PY_VERSION"
    exit 1
fi

echo "Python version check passed."
echo

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error creating virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Error activating virtual environment"
    exit 1
fi

echo "Installing dependencies..."
pip install -e .
pip install uvicorn[standard]

if [ $? -ne 0 ]; then
    echo "Error installing dependencies"
    exit 1
fi

echo "Setup completed successfully!"
