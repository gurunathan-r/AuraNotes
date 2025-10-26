@echo off
echo Checking for Administrator privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges confirmed.
) else (
    echo This script requires Administrator privileges to run on port 80.
    echo Please right-click and select "Run as administrator"
    pause
    exit
)

echo Starting AuraNotes...
echo.

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt
echo.

echo Starting the application...
echo Open your browser and go to: http://localhost
echo Press Ctrl+C to stop the server
echo.

python app.py
pause
