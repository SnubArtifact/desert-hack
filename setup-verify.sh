#!/bin/bash

# Project Setup Verification Script
# This script tests if the project is properly configured and ready to run

echo "Desert Hack - Project Setup Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print success
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
  echo -e "${RED}❌ $1${NC}"
  ERRORS=$((ERRORS + 1))
}

# Function to print warning
warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# 1. Check Node.js and npm
echo "1️⃣ Checking Node.js & npm..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  success "Node.js installed: $NODE_VERSION"
else
  error "Node.js not installed"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  success "npm installed: $NPM_VERSION"
else
  error "npm not installed"
fi
echo ""

# 2. Check essential files
echo "2️⃣ Checking essential files..."
files=("frontend/package.json" "frontend/.env.example" ".gitignore" "README.md" "package.json")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    success "$file"
  else
    error "$file missing"
  fi
done
echo ""

# 3. Check .env configuration
echo "3️⃣ Checking environment configuration..."
if [ -f "frontend/.env" ]; then
  if grep -q "REACT_APP_SARVAM_API_KEY" frontend/.env; then
    API_KEY=$(grep "REACT_APP_SARVAM_API_KEY" frontend/.env | cut -d= -f2)
    if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_api_key_here" ]; then
      warning "API key not configured - development mode only"
    else
      success ".env properly configured with API key"
    fi
  fi
else
  warning ".env not found - copy from .env.example and add your API key"
fi
echo ""

# 4. Check node_modules
echo "4️⃣ Checking dependencies..."
if [ -d "frontend/node_modules" ]; then
  success "node_modules exists"
  cd frontend
  DEPS=$(npm ls --depth=0 2>/dev/null | grep -c "react\|gsap")
  if [ "$DEPS" -gt 0 ]; then
    success "Main dependencies installed"
  else
    warning "Some dependencies may be missing"
  fi
  cd ..
else
  warning "node_modules not found - run: cd frontend && npm install"
fi
echo ""

# 5. Check build
echo "5️⃣ Checking build capability..."
cd frontend
if npm run build > /dev/null 2>&1; then
  success "Project builds successfully"
  if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build | cut -f1)
    success "Build output size: $BUILD_SIZE"
  fi
else
  error "Build failed - check console for errors"
fi
cd ..
echo ""

# 6. Check source code
echo "6️⃣ Checking source code structure..."
COMPONENTS=("Header" "Hero" "Input" "Result" "Controls" "Features")
for comp in "${COMPONENTS[@]}"; do
  if [ -d "frontend/src/components/$comp" ]; then
    success "Component: $comp"
  else
    warning "Component missing: $comp"
  fi
done
echo ""

# 7. Check services
echo "7️⃣ Checking services..."
if [ -f "frontend/src/services/SarvamAIService.js" ]; then
  success "SarvamAIService.js exists"
else
  error "SarvamAIService.js missing"
fi
echo ""

# 8. Check git configuration
echo "8️⃣ Checking git configuration..."
if [ -d ".git" ]; then
  success "Git repository initialized"
else
  warning "Not a git repository"
fi
echo ""

# Final summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN} All checks passed!${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found - review above${NC}"
  fi
  echo ""
  echo "Next steps:"
  echo "1. cd frontend"
  echo "2. npm install (if not already done)"
  echo "3. npm start"
  exit 0
else
  echo -e "${RED} $ERRORS error(s) found - fix above${NC}"
  exit 1
fi
