#!/bin/bash

echo "═══════════════════════════════════"
echo "  StudyAI Pro - Status Check"
echo "═══════════════════════════════════"
echo ""

# MongoDB Atlas is used (cloud)
echo "☁️  MongoDB:        Atlas (Cloud)"

# Check Backend (port 8000)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Backend:        Running (port 8000)"
else
    echo "❌ Backend:        Not Running"
fi

# Check RAG Service (port 8001)
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ RAG Service:    Running (port 8001)"
else
    echo "❌ RAG Service:    Not Running"
fi

# Check Frontend (port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Frontend:       Running (port 5173)"
else
    echo "❌ Frontend:       Not Running"
fi

echo ""
echo "═══════════════════════════════════"
