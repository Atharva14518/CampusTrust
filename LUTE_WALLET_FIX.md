# Lute Wallet Connection Fix

## 🐛 Error: "Invalid Network undefined"

This error occurs when Lute Connect is not properly initialized with network parameters.

## ✅ Solution

### Step 1: Update WalletContext

The WalletContext has been updated to properly initialize Lute with TestNet network.

**What was changed:**
```javascript
// OLD (incorrect)
const luteInstance = new LuteConnect('TrustCampus');

// NEW (correct)
const luteInstance = new LuteConnect('TrustCampus', {
    network: 'TestNet',
    siteName: 'TrustCampus',
    icon: window.location.origin + '/vite.svg'
});
```

### Step 2: Clear Browser Data

```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Verify Lute Installation

1. **Check Extension:**
   - Open browser extensions page
   - Verify "Lute Wallet" is installed and enabled
   - If not installed: https://lute.app

2. **Check Lute Settings:**
   - Open Lute extension
   - Click settings/gear icon
   - Verify network is set to "TestNet" (not MainNet)

3. **Check Account:**
   - Ensure you have at least one account created
   - Account should have some testnet ALGO

### Step 4: Restart Everything

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clear node_modules cache (optional)
cd trustcampus/frontend
rm -rf node_modules/.vite

# 3. Restart backend
cd ../backend
npm start

# 4. Restart frontend (new terminal)
cd ../frontend
npm run dev
```

### Step 5: Test Connection

1. Open http://localhost:5173
2. Open browser console (F12)
3. Click "Connect Wallet"
4. Check console for logs:
   ```
   ✓ Lute initialized successfully with TestNet
   ✓ Attempting to connect to Lute wallet...
   ✓ Lute returned addresses: ["YOUR_ADDRESS"]
   ✓ Connected to wallet: YOUR_ADDRESS
   ```

## 🔍 Alternative: Manual Lute Check

If still having issues, test Lute directly:

```javascript
// Open browser console (F12) and run:

// 1. Check if Lute is available
console.log('Lute available:', typeof window.lute !== 'undefined');

// 2. Try direct connection
if (window.lute) {
    window.lute.connect()
        .then(addresses => console.log('Connected:', addresses))
        .catch(err => console.error('Error:', err));
}
```

## 🛠️ Common Issues & Fixes

### Issue 1: Extension Not Detected

**Symptoms:**
- "Lute wallet not initialized"
- No popup when clicking connect

**Fix:**
```bash
1. Install Lute from https://lute.app
2. Restart browser completely
3. Refresh the page
4. Try connecting again
```

### Issue 2: Wrong Network

**Symptoms:**
- "Invalid Network"
- Connection fails silently

**Fix:**
```bash
1. Open Lute extension
2. Click settings (gear icon)
3. Select "TestNet" from network dropdown
4. Close and reopen extension
5. Try connecting again
```

### Issue 3: No Accounts

**Symptoms:**
- "No addresses returned"
- Empty addresses array

**Fix:**
```bash
1. Open Lute extension
2. Create a new account or import existing
3. Ensure account is visible in Lute
4. Try connecting again
```

### Issue 4: Wallet Locked

**Symptoms:**
- Connection popup doesn't appear
- "Wallet is locked" error

**Fix:**
```bash
1. Open Lute extension
2. Enter your password to unlock
3. Keep extension open
4. Try connecting again
```

## 📋 Verification Checklist

Before connecting, ensure:

- [ ] Lute extension installed
- [ ] Extension enabled in browser
- [ ] Wallet unlocked (password entered)
- [ ] Network set to TestNet
- [ ] At least one account created
- [ ] Account has testnet ALGO (optional but recommended)
- [ ] Browser console open (F12) to see logs
- [ ] No other wallet extensions interfering

## 🔄 If Still Not Working

### Option 1: Use Alternative Wallet Context

Replace the WalletContext with the v2 version:

```bash
cd trustcampus/frontend/src/context
mv WalletContext.jsx WalletContext_old.jsx
mv WalletContext_v2.jsx WalletContext.jsx
```

### Option 2: Reinstall Lute

```bash
1. Remove Lute extension from browser
2. Clear browser cache
3. Restart browser
4. Install Lute from https://lute.app
5. Create/import account
6. Set to TestNet
7. Try connecting
```

### Option 3: Try Different Browser

```bash
# Test in different browsers:
- Chrome/Brave (recommended)
- Firefox
- Edge

# Lute works best in Chromium-based browsers
```

## 📱 Mobile Lute Connection

For mobile devices:

1. **Install Lute Mobile App:**
   - iOS: App Store
   - Android: Play Store

2. **Use WalletConnect:**
   - Scan QR code from desktop
   - Approve connection on mobile
   - Sign transactions on mobile

3. **Or Use Mobile Browser:**
   - Access via `http://YOUR_IP:5173`
   - Lute mobile extension should work
   - Follow same connection flow

## 🎯 Expected Behavior

After successful connection:

**Console Logs:**
```
✓ Lute initialized successfully with TestNet
✓ Attempting to connect to Lute wallet...
✓ Lute returned addresses: ["ABC...XYZ"]
✓ Connected to wallet: ABC...XYZ
```

**UI Changes:**
```
Navbar: Connected: ABC123...XYZ9 [Disconnect]
Dashboard: Shows real balance (e.g., 6.45 ALGO)
```

**LocalStorage:**
```javascript
localStorage.getItem('walletAddress')
// Returns: "YOUR_58_CHARACTER_ADDRESS"
// NOT: "ALGO_MOCK_ADDRESS_123456789"
```

## 🆘 Still Having Issues?

1. **Check Lute Documentation:**
   - https://docs.lute.app

2. **Check Browser Console:**
   - Look for specific error messages
   - Share error logs for help

3. **Try Example Code:**
   ```javascript
   // Test Lute directly
   import LuteConnect from 'lute-connect';
   
   const lute = new LuteConnect('Test', { network: 'TestNet' });
   const addresses = await lute.connect();
   console.log(addresses);
   ```

4. **Contact Support:**
   - Lute Discord/Telegram
   - GitHub Issues
   - Community forums

---

**Status**: ✅ FIXED

The WalletContext now properly initializes Lute with TestNet network configuration!
