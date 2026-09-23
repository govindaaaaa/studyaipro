#!/bin/bash

echo "🛑 Stopping all services..."
echo ""

# Kill services using PID files
if [ -f "logs/backend.pid" ]; then
    kill $(cat logs/backend.pid) 2>/dev/null
    rm logs/backend.pid
    echo "✓ Backend stopped"
fi

if [ -f "logs/rag.pid" ]; then
    kill $(cat logs/rag.pid) 2>/dev/null
    rm logs/rag.pid
    echo "✓ RAG Service stopped"
fi

if [ -f "logs/frontend.pid" ]; then
    kill $(cat logs/frontend.pid) 2>/dev/null
    rm logs/frontend.pid
    echo "✓ Frontend stopped"
fi

# Fallback: kill by process name
killall node 2>/dev/null
pkill -f uvicorn 2>/dev/null

echo ""
echo "✅ All services stopped"
