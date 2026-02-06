#!/bin/bash

# Run All Tests Script
# Usage: ./scripts/test-all.sh

set -e

echo "🧪 Running All Tests"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Track results
BACKEND_STATUS=0
FRONTEND_STATUS=0

# Backend Tests
echo ""
echo -e "${BLUE}📦 Running Backend Tests...${NC}"
echo "----------------------------"
cd "$PROJECT_ROOT/backend"

if npm test; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
    BACKEND_STATUS=1
fi

# Frontend Tests
echo ""
echo -e "${BLUE}🎨 Running Frontend Tests...${NC}"
echo "-----------------------------"
cd "$PROJECT_ROOT/frontend"

if CI=true npm test -- --testPathPattern="(Templates|Analytics|OrgSlangs)" --passWithNoTests; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
    FRONTEND_STATUS=1
fi

# Summary
echo ""
echo "===================="
echo "📊 Test Summary"
echo "===================="

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "Backend:  ${GREEN}✅ PASSED${NC}"
else
    echo -e "Backend:  ${RED}❌ FAILED${NC}"
fi

if [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "Frontend: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Frontend: ${RED}❌ FAILED${NC}"
fi

# Exit with error if any test failed
if [ $BACKEND_STATUS -ne 0 ] || [ $FRONTEND_STATUS -ne 0 ]; then
    echo ""
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
fi
