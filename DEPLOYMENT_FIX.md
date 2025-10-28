# Firebase Deployment - Fix Guide

## Issues Identified

1. **Node Version**: Firebase expects Node 16, 18, or 20, but you're running Node 24
2. **Dependency Conflict**: `vaul@0.9.9` has peer dependency conflicts with React 19

## Solutions Implemented

### 1. Created `.npmrc` file
- Added `legacy-peer-deps=true` to bypass peer dependency conflicts during Firebase deploy
- This allows npm to ignore the React version mismatch

### 2. Created `.nvmrc` file  
- Specifies Node 20 as the required version
- Firebase Hosting supports Node 20

### 3. Updated `package.json` scripts
- Added `deploy:hosting` script

## Deployment Options

### Option 1: Use NVM (Recommended)

If you have nvm installed:

```bash
# Switch to Node 20
nvm install 20
nvm use 20

# Verify version
node --version  # Should show v20.x.x

# Deploy
npm run deploy
```

If you don't have nvm:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node 20


nvm use 20

# Deploy
npm run deploy
```

### Option 2: Install Node 20 via Package Manager (Arch Linux)

```bash
# Install nvm via yay or paru
yay -S nvm
# or
paru -S nvm

# Then follow Option 1 steps
```

### Option 3: Use Arch Linux's nodejs 20 LTS

```bash
# Check available versions
pacman -Ss nodejs

# If Node 20 is available, install it
sudo pacman -S nodejs-lts-hydrogen  # or similar

# Verify
node --version
```

### Option 4: Use Docker (Alternative)

If you want to isolate the deployment environment:

```bash
# Create a Dockerfile for deployment
docker run --rm -it -v "$(pwd)":/app -w /app node:20 bash

# Inside container
npm install
npm run build
npx firebase deploy --only hosting
```

## Quick Deploy (Bypassing Issues)

If you want to proceed with Node 24 (with warnings):

```bash
# The .npmrc file will handle the peer dependency issue
firebase deploy --only hosting
```

However, Firebase may still warn about the Node version.

## Troubleshooting

### If esbuild installation fails

The error occurs because Firebase tries to bundle the app for Cloud Functions. The `.npmrc` file should fix this, but if it doesn't:

```bash
# Manually install esbuild
npm install esbuild@^0.19.2 --save-dev

# Then try deploy again
firebase deploy --only hosting
```

### If you get "An unexpected error has occurred"

1. Clear Firebase cache:
   ```bash
   rm -rf .firebase
   firebase deploy --only hosting
   ```

2. Try with debug flag:
   ```bash
   firebase deploy --only hosting --debug
   ```

## Recommended Approach

**Best approach** for clean deployment:

1. **Install and use Node 20** (via nvm - see Option 1)
2. **Deploy** using: `npm run deploy`
3. The `.npmrc` file will handle the vaul/React peer dependency issue

This will eliminate all warnings and ensure compatibility with Firebase Hosting.

