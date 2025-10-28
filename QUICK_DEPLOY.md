# Quick Deploy Guide

## Changes Made

1. ✅ Created `.npmrc` with `legacy-peer-deps=true` to handle React 19 peer dependency conflicts
2. ✅ Added `overrides` section to `package.json` to force vaul to use React 19
3. ✅ Created `.nvmrc` specifying Node 20 (recommended for Firebase)
4. ✅ Reinstalled dependencies with legacy peer deps

## Deploy Now

Try deploying with the current Node 24 version (you'll get warnings but it should work):

```bash
firebase deploy --only hosting
```

Or use the npm script:

```bash
npm run deploy
```

## If Deployment Still Fails

### Install and Use Node 20

**Option 1: Install nvm**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal configuration
source ~/.bashrc

# Install and use Node 20
nvm install 20
nvm use 20

# Verify version
node --version  # Should show v20.x.x

# Deploy
firebase deploy --only hosting
```

**Option 2: Use fnm (Fast Node Manager)**

```bash
# Install fnm via package manager
yay -S fnm-bin  # or paru -S fnm-bin

# Install Node 20
fnm install 20
fnm use 20

# Deploy
firebase deploy --only hosting
```

## Expected Behavior

With the current setup (Node 24 + `.npmrc`):
- ⚠️ You'll see a warning about Node version
- ✅ The dependency conflicts should be resolved
- ✅ Deployment should proceed despite the warning

With Node 20:
- ✅ No warnings
- ✅ Full compatibility with Firebase Hosting
- ✅ Clean deployment

## Commands Reference

```bash
# Build and deploy
npm run deploy

# Just deploy (assumes already built)
npm run deploy:hosting

# Deploy with Firebase CLI directly
firebase deploy --only hosting

# Check deployment status
firebase hosting:clone

# Open site
firebase open hosting:site
```

