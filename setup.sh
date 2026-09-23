#!/bin/bash

# StudyAI Pro - MERN Stack Setup Script
# This script helps you set up the project quickly

echo "=================================="
echo "StudyAI Pro - MERN Stack Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3 from https://www.python.org/"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check if MongoDB is running (optional)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" &> /dev/null; then
        echo -e "${GREEN}✓ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠ MongoDB is installed but not running${NC}"
        echo "  Start it with: brew services start mongodb-community"
    fi
else
    echo -e "${YELLOW}⚠ MongoDB not found locally${NC}"
    echo "  You can use MongoDB Atlas instead: https://www.mongodb.com/atlas"
fi

echo ""
echo "=================================="
echo "Setting up Backend (Node.js)"
echo "=================================="

cd backend-node || exit

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit backend-node/.env and add your API keys${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo "Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..

echo ""
echo "=================================="
echo "Setting up RAG Microservice (Python)"
echo "=================================="

cd rag-service || exit

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ RAG service dependencies installed${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

deactivate
cd ..

echo ""
echo "=================================="
echo "Setting up Frontend (React)"
echo "=================================="

cd frontend || exit

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

echo "Installing React dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   ${YELLOW}backend-node/.env${NC} - Add MONGODB_URL, JWT_SECRET, GROQ_API_KEY"
echo ""
echo "2. Start MongoDB (if using local):"
echo "   ${GREEN}brew services start mongodb-community${NC}"
echo ""
echo "3. Start the RAG microservice:"
echo "   ${GREEN}cd rag-service && source venv/bin/activate && uvicorn main:app --port 8001 --reload${NC}"
echo ""
echo "4. Start the backend (in a new terminal):"
echo "   ${GREEN}cd backend-node && npm run dev${NC}"
echo ""
echo "5. Start the frontend (in a new terminal):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "6. Open your browser:"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "For more details, see: ${YELLOW}README.md${NC}"
echo ""
