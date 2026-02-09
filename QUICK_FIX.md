# Quick Fix for "Invalid Network undefined" Error

## 🚀 Immediate Solution

### Step 1: Clear Browser Data (30 seconds)

Open browser console (Press F12), then run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: Verify Lute Settings (1 minute)

1. Click Lute extension icon in browser
2. Click ⚙️ Settings
3. Check Network dropdown shows **"TestNet"** (not MainNet)
4. If wrong, select TestNet and close extension

### Step 3: Restart Servers (1 minute)

```bash
# Stop both servers (Ctrl+C in both terminals)

# Terminal 1 - Backend
cd trustcampus/backend
npm start

# Terminal 2 - Frontend
cd trustcampus/frontend
npm run dev
```

### Step 4: Test Connection (30 seconds)

1. Go to http://localhost:5173/wallet-test
2. Click "Run Connection Tests"
3. Check results - should see all green checkmarks ✓

### Step 5: Connect Wallet (30 seconds)

1. Go to http://localhost:5173
2. Click "Connect Wallet"
3. Approve in Lute popup
4. Should see real address (not ALGO_MOCK...)

## ✅ Success Indicators

You'll know it's working when:
- ✓ Navbar shows: `Connected: ABC123...XYZ9`
- ✓ Dashboard shows real ALGO balance (e.g., 6.45)
- ✓ Console shows: `Connected to wallet: YOUR_ADDRESS`
- ✓ No "Invalid Network" errors

## 🐛 Still Not Working?

### Quick Checks:

1. **Lute Installed?**
   ```
   Check browser extensions → Should see "Lute Wallet"
   If not: Install from https://lute.app
   ```

2. **Wallet Unlocked?**
   ```
   Click Lute icon → Enter password if locked
   ```

3. **Account Created?**
   ```
   Open Lute → Should see at least one account
   If not: Create new account or import existing
   ```

4. **Right Network?**
   ```
   Lute Settings → Network → Should be "TestNet"
   ```

### Alternative: Use Test Page

Go to http://localhost:5173/wallet-test and run diagnostics.

The test will show exactly what's wrong:
- ✓ Green = Working
- ⚠ Yellow = Warning (may still work)
- ✗ Red = Problem (needs fixing)

## 📋 Complete Checklist

Before connecting:
- [ ] Lute extension installed
- [ ] Extension enabled
- [ ] Wallet unlocked
- [ ] Network = TestNet
- [ ] At least 1 account
- [ ] Browser data cleared
- [ ] Servers restarted
- [ ] Test page shows green

## 🆘 Emergency Reset

If nothing works, nuclear option:

```bash
# 1. Uninstall Lute extension
# 2. Clear all browser data
# 3. Restart browser
# 4. Install Lute from https://lute.app
# 5. Create/import account
# 6. Set to TestNet
# 7. Restart servers
# 8. Try connecting
```

## 📞 Get Help

If still stuck:
1. Check console for errors (F12)
2. Run wallet test page
3. Share error messages
4. Check LUTE_WALLET_FIX.md for detailed guide

---

**Time to fix: ~3 minutes**

The issue is now resolved with proper Lute initialization!
