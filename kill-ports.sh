#!/bin/bash

# Kill all services running on project ports

echo "🛑 Killing processes on ports 8000, 8001, 5173..."

# Backend (8000)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✓ Killed process on port 8000 (Backend)"
else
    echo "- Port 8000 is free"
fi

# RAG Service (8001)
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:8001 | xargs kill -9 2>/dev/null
    echo "✓ Killed process on port 8001 (RAG Service)"
else
    echo "- Port 8001 is free"
fi

# Frontend (5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "✓ Killed process on port 5173 (Frontend)"
else
    echo "- Port 5173 is free"
fi

echo ""
echo "✅ All ports cleared! You can now start the services."
