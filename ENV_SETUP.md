# Environment Variables Setup Guide

## Overview

This project uses environment variables to store sensitive configuration like API endpoints and Firebase keys. **Never commit the `.env` file to version control.**

## Setup Instructions

### 1. Create Your `.env` File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### 2. Fill in Your Secrets

Edit the `.env` file and add your actual configuration values:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://app.radianthyve.com:8800
REACT_APP_API_IMG_URL=https://app.radianthyve.com:8800/

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Messaging VAPID Key
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key

# App Configuration
REACT_APP_ENV=development
```

## Available Environment Variables

### API Configuration

| Variable                 | Description           | Example                             |
| ------------------------ | --------------------- | ----------------------------------- |
| `REACT_APP_API_BASE_URL` | Backend API base URL  | `https://app.radianthyve.com:8800`  |
| `REACT_APP_API_IMG_URL`  | Image server base URL | `https://app.radianthyve.com:8800/` |

### Firebase Configuration

| Variable                                 | Description             | Source                             |
| ---------------------------------------- | ----------------------- | ---------------------------------- |
| `REACT_APP_FIREBASE_API_KEY`             | Firebase API Key        | Firebase Console → Settings        |
| `REACT_APP_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain    | Firebase Console → Settings        |
| `REACT_APP_FIREBASE_PROJECT_ID`          | Firebase Project ID     | Firebase Console → Settings        |
| `REACT_APP_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket | Firebase Console → Storage         |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID     | Firebase Console → Cloud Messaging |
| `REACT_APP_FIREBASE_APP_ID`              | Firebase App ID         | Firebase Console → Settings        |
| `REACT_APP_FIREBASE_MEASUREMENT_ID`      | Google Analytics ID     | Firebase Console → Settings        |
| `REACT_APP_FIREBASE_VAPID_KEY`           | FCM VAPID Key           | Firebase Console → Cloud Messaging |

### App Configuration

| Variable        | Description | Values                                 |
| --------------- | ----------- | -------------------------------------- |
| `REACT_APP_ENV` | Environment | `development`, `staging`, `production` |

## How Variables Are Used

### In Code

All variables are accessed via `process.env`:

```javascript
// API Configuration
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
  // ... etc
};

// Firebase Messaging VAPID
const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
```

### Current Usage Locations

| File                       | Variables Used                                    |
| -------------------------- | ------------------------------------------------- |
| `src/services/api.js`      | `REACT_APP_API_BASE_URL`, `REACT_APP_API_IMG_URL` |
| `src/firebase/Firebase.js` | All Firebase variables                            |
| `src/pages/Login/Login.js` | `REACT_APP_FIREBASE_VAPID_KEY`                    |

## Security Best Practices

✅ **DO:**

- Add `.env` to `.gitignore` (already done)
- Use `.env.example` as a template
- Commit `.env.example` with empty values
- Rotate secrets periodically
- Use strong API keys and VAPID keys
- Store sensitive keys securely (use password manager)

❌ **DON'T:**

- Commit `.env` file to version control
- Share `.env` file via email or chat
- Hardcode secrets in code
- Use the same secrets across environments
- Log environment variables in console

## Environment-Specific Configuration

### Development (`.env.development.local`)

```env
REACT_APP_ENV=development
REACT_APP_API_BASE_URL=http://localhost:8800
REACT_APP_FIREBASE_API_KEY=dev_key_here
```

### Staging (`.env.staging.local`)

```env
REACT_APP_ENV=staging
REACT_APP_API_BASE_URL=https://staging.radianthyve.com:8800
REACT_APP_FIREBASE_API_KEY=staging_key_here
```

### Production (`.env.production.local`)

```env
REACT_APP_ENV=production
REACT_APP_API_BASE_URL=https://app.radianthyve.com:8800
REACT_APP_FIREBASE_API_KEY=prod_key_here
```

React will automatically load the correct file based on your environment.

## Troubleshooting

### Variables Not Loading

**Problem**: `process.env.REACT_APP_*` returns `undefined`

**Solutions**:

1. Ensure variable names start with `REACT_APP_`
2. Restart dev server after changing `.env`
3. Check `.env` file exists in project root
4. Verify syntax (no spaces around `=`)

### Firebase Not Initializing

**Problem**: "Firebase: Error (auth/invalid-api-key)"

**Solutions**:

1. Verify Firebase credentials in `.env`
2. Check Firebase project is active
3. Ensure API key has appropriate permissions
4. Restart dev server

### VAPID Key Error

**Problem**: "Invalid VAPID key"

**Solutions**:

1. Check VAPID key is correctly copied from Firebase Console
2. Ensure no extra spaces or line breaks
3. Verify key hasn't been revoked

## Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click Settings ⚙️ → Project Settings
4. Copy the config values
5. Add to `.env`

## Deployment

### Vercel

Environment variables are set in:

- Settings → Environment Variables

Paste your `.env` content there (excluding the `REACT_APP_ENV=production` line).

### Netlify

Environment variables are set in:

- Site Settings → Build & Deploy → Environment

### GitHub Pages / Self-Hosted

Create `.env.production.local` on your server with production values.

## Team Collaboration

1. **Team member gets the repo:**

   ```bash
   git clone repo
   cp .env.example .env
   # Ask team lead for .env values
   npm install
   npm start
   ```

2. **Team lead provides credentials** (not via git):
   - Share `.env` values via secure password manager
   - Or configure in deployment platform

## Next Steps

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in your API and Firebase credentials
- [ ] Test login functionality
- [ ] Verify Firebase messaging works
- [ ] Commit `.env.example` (values empty)
- [ ] Add `.env` to `.gitignore` (already done)

---

**Security Note**: The `.env` file contains sensitive information. Treat it like a password and never share it publicly.
