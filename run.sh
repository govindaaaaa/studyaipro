#!/bin/bash

# StudyAI Pro - Simple Terminal Runner
# Just run: ./run.sh

echo "🚀 StudyAI Pro - Starting..."
echo ""

# MongoDB Atlas is used - no local installation needed
echo "📊 Using MongoDB Atlas (cloud database)"

# Check if .env exists
if [ ! -f "backend-node/.env" ]; then
    echo "📝 Creating .env file..."
    cd backend-node
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i '' "s/your_super_secret_jwt_key_change_this_in_production_min_32_chars/$JWT_SECRET/" .env
    sed -i '' "s|mongodb://localhost:27017/studyai_pro|REPLACE_WITH_MONGODB_ATLAS_URL|" .env
    
    cd ..
    
    echo ""
    echo "⚠️  IMPORTANT: Edit backend-node/.env and add:"
    echo "   1. MONGODB_URL (MongoDB Atlas connection string)"
    echo "   2. GROQ_API_KEY (from console.groq.com)"
    echo ""
    echo "See MONGODB_ATLAS_SETUP.md for detailed MongoDB setup guide"
    echo ""
    read -p "Press Enter after configuring .env to continue..."
fi

# Check dependencies
if [ ! -d "backend-node/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend-node && npm install --silent && cd ..
fi

if [ ! -d "rag-service/venv" ]; then
    echo "📦 Installing RAG service dependencies..."
    cd rag-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    deactivate
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install --silent && cd ..
fi

# Create logs directory
mkdir -p logs

echo ""
echo "✅ Everything ready! Starting services..."
echo ""

# Start RAG service
echo "🐍 Starting RAG Service (port 8001)..."
cd rag-service
source venv/bin/activate
nohup uvicorn main:app --port 8001 --reload > ../logs/rag.log 2>&1 &
RAG_PID=$!
echo $RAG_PID > ../logs/rag.pid
deactivate
cd ..

sleep 2

# Start backend
echo "⚙️  Starting Backend (port 8000)..."
cd backend-node
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

sleep 3

# Start frontend
echo "⚛️  Starting Frontend (port 5173)..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

sleep 3

echo ""
echo "════════════════════════════════════════"
echo "✅ All services are running!"
echo "════════════════════════════════════════"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "⚙️  Backend:   http://localhost:8000"
echo "🐍 RAG API:   http://localhost:8001"
echo ""
echo "📋 View logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/rag.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop.sh"
echo ""

# Open browser
sleep 2
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null || echo "Open http://localhost:5173 in your browser"
