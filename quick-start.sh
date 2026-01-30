#!/bin/bash
# Quick Start Script for VondraLink Recommendation System

echo "🚀 VondraLink - Personalized Recommendations Setup"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f "VondraLink/backend/.env" ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env from template..."
    cp VondraLink/backend/.env.example VondraLink/backend/.env
    echo ""
    echo "✅ Created VondraLink/backend/.env"
    echo "⚠️  IMPORTANT: Edit this file and add your API keys:"
    echo "   - GROQ_API_KEY or OPENAI_API_KEY"
    echo "   - QDRANT_URL"
    echo "   - QDRANT_API_KEY"
    echo "   - QDRANT_COLLECTION"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo ""
echo "📦 Installing Frontend dependencies..."
cd VondraLink/frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ../..

echo ""
echo "========================================"
echo "  Setup Complete! Starting Servers..."
echo "========================================"
echo ""

# Start backend in background
echo "🚀 Starting Backend Server on http://localhost:8000"
cd VondraLink/backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ../..

# Wait for backend to initialize
sleep 3

# Start frontend in background
echo "🚀 Starting Frontend Server on http://localhost:5173"
cd VondraLink/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "========================================"
echo "  VondraLink is Running!"
echo "========================================"
echo ""
echo "Backend API:  http://localhost:8000"
echo "Frontend App: http://localhost:5173"
echo "API Docs:     http://localhost:8000/docs"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for user interrupt
wait
