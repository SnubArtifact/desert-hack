# Formalize - Hindi Slang to Corporate Communication

Transform Hindi slangs into professional corporate communication using AI.

## Features
- Speech-to-Text (Hindi)
- Multiple Tones (Formal, Friendly, Assertive)
- Channel-Specific (Email, LinkedIn, WhatsApp)
- Real-time Translation

## Quick Setup

### New Member?
```bash
git clone <repo-url>
cd desert-hack
bash setup-verify.sh
```

### Existing Member?
```bash
git pull
cd frontend
npm install  # if package.json changed
npm start
```

## 📋 What is setup-verify.sh?

This automated script checks if your system is ready to run the project. It verifies:
- ✅ Node.js & npm installed
- ✅ All required files exist
- ✅ Dependencies can be installed
- ✅ Project builds successfully
- ✅ All components are present

## 🔧 Setup-Verify Script Usage

### Run it:
```bash
cd /path/to/desert-hack
bash setup-verify.sh
```

### What it does:
1. **Checks Node.js/npm** - Verifies you have the right versions
2. **Checks files** - Ensures package.json, .env.example, etc. exist
3. **Checks environment** - Tests .env configuration
4. **Checks dependencies** - Installs and verifies packages
5. **Checks build** - Tests production build
6. **Checks components** - Verifies all UI components
7. **Checks services** - Validates API service
8. **Checks git** - Confirms repo initialized

### Expected output:
```
All checks passed!

Next steps:
1. cd frontend
2. npm install (if not already done)
3. npm start
```

## 🚨 If Any Check Fails

The script will tell you exactly what failed. Common fixes:
- **Dependencies error** → `rm -rf node_modules && npm install`
- **Port 3000 in use** → `PORT=3001 npm start`
- **.env missing** → `cd frontend && cp .env.example .env`

## Manual Setup (If Script Fails)

```bash
cd desert-hack/frontend
cp .env.example .env
# Add your API key to .env
npm install
npm start
```

Get API key: https://console.sarvam.ai/api-keys

## For Your Team

**First Time:**
1. Run `bash setup-verify.sh`
2. If all pass, you're ready!
3. If any fail, the script tells you what's wrong

**Daily Development:**
```bash
npm start
```

**Pushing Code:**
```bash
npm run build  # Test before pushing
git push
```

## Important Rules

**DO**
- Use `.env.example` as template
- Run `npm install` when `package.json` changes
- Test with `npm run build` before pushing

**DON'T**
- Commit `.env` file
- Commit `node_modules/`
- Share API keys

## Tech Stack
- React 18.3.1
- GSAP 3.14.2
- Sarvam AI API

---

**Status**: Production Ready  
**Tested**: Feb 6, 2026  
**All 8 verification tests passed**
