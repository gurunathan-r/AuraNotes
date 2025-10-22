#!/bin/bash
echo "Starting AuraNotes..."
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt --break-system-packages
echo ""
echo "Starting the application..."
echo "Open your browser and go to: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""
python app.py
