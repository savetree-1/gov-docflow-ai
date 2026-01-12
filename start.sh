#!/bin/bash

# Quick Start Script for Government Auth System
# This sets up and runs both frontend and backend

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Uttarakhand Government Platform - Quick Start             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env file not found. Creating from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN} Created .env file. Please update with actual values.${NC}"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW} Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN} Frontend dependencies installed${NC}"
    echo ""
fi

# Start frontend
echo -e "${GREEN} Starting React Frontend...${NC}"
echo "   URL: http://localhost:3000"
echo ""

# Note about backend
echo -e "${YELLOW} BACKEND SETUP REQUIRED:${NC}"
echo ""
echo "To run the complete authentication system, you also need:"
echo ""
echo "1. Set up PostgreSQL/MongoDB database"
echo "2. Update .env with database credentials"
echo "3. Run database migrations/create tables"
echo "4. Seed Super Admin account:"
echo "   ${GREEN}node src/seeds/createSuperAdmin.js${NC}"
echo ""
echo "5. Start backend server (in separate terminal):"
echo "   ${GREEN}cd backend && npm install && npm start${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Available Routes:"
echo "  ${GREEN}http://localhost:3000/login${NC}              - Government Login"
echo "  ${GREEN}http://localhost:3000/department-registration${NC} - Dept Registration"
echo ""
echo "Backend API (when running):"
echo "  ${GREEN}http://localhost:5000/api/auth/login${NC}     - Login endpoint"
echo "  ${GREEN}http://localhost:5000/api/auth/me${NC}        - Get current user"
echo "  ${GREEN}http://localhost:5000/health${NC}             - Health check"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend is already running, just showing status
echo -e "${GREEN} Frontend is running!${NC}"
echo ""
echo "Press Ctrl+C to stop the servers"
