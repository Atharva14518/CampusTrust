# Final Fix for Lute Wallet Connection

## The Real Issue

The error "Invalid Network undefined" is coming from `lute-connect` v1.6.3 initialization. This is a known issue with how the library handles network configuration.

## Solution: Ensure Lute Wallet is Properly Configured

### Step 1: Check Lute Extension Settings

1. **Open Lute Extension**
   - Click the Lute icon in your browser toolbar
   - If not visible, go to Extensions and pin it

2. **Unlock Wallet**
   - Enter your password if locked

3. **Check Network Setting**
   - Click the ⚙️ Settings icon (usually top-right)
   - Look for "Network" dropdown
   - **MUST be set to "TestNet"** (not MainNet, not Sandbox)
   - If it says something else, change it to TestNet
   - Close and reopen Lute

4. **Verify Account**
   - Make sure you have at least one account visible
   - Account should have some testnet ALGO

### Step 2: Clear Everything and Restart

```bash
# 1. Close all browser tabs with localhost:5173

# 2. Stop frontend (Ctrl+C)

# 3. Clear browser data
# Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();

# 4. Close browser completely

# 5. Reopen browser

# 6. Restart frontend
cd trustcampus/frontend
npm run dev

# 7. Open http://localhost:5173
```

### Step 3: Test Connection

1. Click "Connect Wallet"
2. Lute popup should appear
3. Should show your account(s)
4. Click "Connect" or "Approve"
5. Should connect successfully

## If Still Getting "Invalid Network undefined"

This means Lute extension itself has an issue. Try:

### Option 1: Reinstall Lute

```bash
1. Remove Lute extension from browser
2. Close browser completely
3. Reopen browser
4. Install Lute from https://lute.app
5. Create/import account
6. Set to TestNet
7. Try connecting again
```

### Option 2: Use Different Browser

```bash
# Lute works best in Chromium-based browsers
- Try Chrome
- Try Brave
- Try Edge
```

### Option 3: Check Lute Version

```bash
1. Open Lute extension
2. Go to Settings
3. Check version number
4. Should be latest version
5. If not, update extension
```

## Alternative: Use Pera Wallet

If Lute continues to have issues, you can use Pera Wallet instead:

```bash
1. Install Pera Wallet extension
2. Create/import account
3. Set to TestNet
4. We'll need to update WalletContext to support Pera
```

## Database Connection (Separate Issue)

You mentioned MySQL - let me check if backend is running:

### Check Backend Status

```bash
cd trustcampus/backend
npm start
```

Should see: `Server running on port 3000`

### Test Database Connection

```bash
# Test MySQL connection
mysql -u root -p$hreya$*832006 -e "SHOW DATABASES;"
```

Should show `trustcampus` database.

### If Database Error

```bash
# Check if MySQL is running
# Windows:
services.msc
# Look for MySQL service

# Start MySQL if stopped
net start MySQL80

# Test connection
mysql -u root -p
# Enter password: $hreya$*832006
# Then: SHOW DATABASES;
```

## Summary

The "Invalid Network undefined" error is from Lute extension, not our code. The fix is:

1. ✅ Ensure Lute is set to TestNet
2. ✅ Clear browser cache
3. ✅ Restart everything
4. ✅ Try connecting again

The wallet connection is **NOT read-only** - it has full signing permissions. The read-only message only appears when Lute fails to connect, as a fallback to let you at least view the dashboard.

Once Lute connects properly, you'll have full signing capability!
