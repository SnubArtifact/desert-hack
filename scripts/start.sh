#!/bin/bash

# Start Entire Project Script
# Usage: ./scripts/start.sh

set -e

echo "🚀 Starting Desert Hack Project"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Port configuration - change these if ports are busy
FRONTEND_PORT=4000
BACKEND_PORT=4001

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop Docker containers
    cd "$PROJECT_ROOT/backend"
    docker compose down 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap for cleanup on exit
trap cleanup SIGINT SIGTERM

# Step 1: Start Database
echo ""
echo -e "${BLUE}📊 Starting PostgreSQL Database...${NC}"
cd "$PROJECT_ROOT/backend"
docker compose up -d

echo "Waiting for database to be ready..."
sleep 5

# Step 2: Run Prisma migrations
echo ""
echo -e "${BLUE}🔧 Running database migrations...${NC}"
npm run db:push 2>/dev/null || npx prisma db push

# Step 3: Generate Prisma client
echo ""
echo -e "${BLUE}⚙️ Generating Prisma client...${NC}"
npx prisma generate

# Step 4: Start Backend on custom port
echo ""
echo -e "${BLUE}🖥️ Starting Backend Server on port ${BACKEND_PORT}...${NC}"
PORT=$BACKEND_PORT npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Step 5: Start Frontend on custom port
echo ""
echo -e "${BLUE}🎨 Starting Frontend on port ${FRONTEND_PORT}...${NC}"
cd "$PROJECT_ROOT/frontend"

# Set the API URL for frontend to connect to backend
export REACT_APP_API_URL="http://localhost:${BACKEND_PORT}/api"
PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Display info
echo ""
echo "================================"
echo -e "${GREEN}🎉 Project Started Successfully!${NC}"
echo "================================"
echo ""
echo "Services running:"
echo "  📊 Database:  PostgreSQL on port 5436"
echo "  🖥️  Backend:   http://localhost:${BACKEND_PORT}"
echo "  🎨 Frontend:  http://localhost:${FRONTEND_PORT}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for processes
wait

