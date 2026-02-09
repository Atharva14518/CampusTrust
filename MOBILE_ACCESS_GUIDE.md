# Mobile Access Setup Guide

## 🔧 Issues Fixed

1. **Mock Wallet Address** - Removed mock data, now uses real Lute connection
2. **Network Access** - Configured Vite to listen on all interfaces
3. **API URL Detection** - Automatically detects correct API URL for mobile

## 📱 Setup for Mobile Access

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

Example IP: `192.168.1.100`

### Step 2: Restart Servers

**Backend:**
```bash
cd trustcampus/backend
npm start
```
Should show: `Server running on port 3000`

**Frontend:**
```bash
cd trustcampus/frontend
npm run dev
```
Should show:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Step 3: Access from Mobile

1. **Connect to Same WiFi**
   - Ensure your phone is on the same WiFi network as your computer

2. **Open Browser on Phone**
   - Open Chrome/Safari on your phone
   - Go to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

3. **Connect Lute Wallet**
   - Install Lute wallet on mobile (if not already)
   - Click "Connect Wallet"
   - Approve connection

## ✅ Verification Steps

### 1. Check Wallet Connection

After connecting, you should see:
- ✅ Real wallet address (starts with letters/numbers, not "ALGO_MOCK...")
- ✅ Actual ALGO balance (your real balance)
- ✅ Wallet address in navbar (shortened format)

### 2. Test on Desktop First

Before testing mobile:
```bash
# 1. Open http://localhost:5173
# 2. Click "Connect Wallet"
# 3. Check browser console (F12)
# 4. Should see: "Connected to wallet: YOUR_ADDRESS"
# 5. Should NOT see: "ALGO_MOCK_ADDRESS"
```

### 3. Test Mobile Access

```bash
# 1. Open http://YOUR_IP:5173 on phone
# 2. Click "Connect Wallet"
# 3. Lute wallet should open
# 4. Approve connection
# 5. See real wallet address
```

## 🐛 Troubleshooting

### Issue: Still Seeing Mock Address

**Solution:**
1. Clear browser cache and localStorage:
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   location.reload();
   ```

2. Check if Lute is installed:
   - Desktop: Check browser extensions
   - Mobile: Check if Lute app is installed

3. Check console for errors:
   ```javascript
   // Should see:
   "Lute initialized successfully"
   "Connected to wallet: YOUR_ADDRESS"
   
   // Should NOT see:
   "Lute not initialized"
   "No addresses returned"
   ```

### Issue: Cannot Access from Mobile

**Firewall:**
```bash
# Windows: Allow ports 3000 and 5173
# Check Windows Firewall settings

# Mac: System Preferences > Security > Firewall
# Allow incoming connections for Node
```

**Network:**
- Ensure phone and computer on same WiFi
- Try disabling VPN on either device
- Check router settings (some routers block device-to-device communication)

### Issue: API Calls Failing

**Check API URL:**
```javascript
// In browser console on mobile
console.log(window.location.hostname);
// Should show your IP, not "localhost"
```

**Backend CORS:**
- Backend is configured to accept all origins
- Check backend console for incoming requests

### Issue: Balance Shows 0

**Possible Causes:**
1. **Wrong Network:**
   - Ensure Lute is on Algorand Testnet
   - Check network in Lute settings

2. **No Funds:**
   - Get testnet ALGO: https://bank.testnet.algorand.network/
   - Need at least 0.5 ALGO for testing

3. **API Connection:**
   - Check if API URL is correct
   - Open `http://YOUR_IP:3000` in browser
   - Should see: "TrustCampus API is running"

## 🔍 Debug Checklist

### Desktop Testing
- [ ] Lute extension installed
- [ ] Extension unlocked
- [ ] On Algorand Testnet
- [ ] Has testnet ALGO
- [ ] Console shows "Connected to wallet"
- [ ] Real address displayed (not mock)
- [ ] Balance shows correctly

### Mobile Testing
- [ ] Phone on same WiFi as computer
- [ ] Can access `http://YOUR_IP:5173`
- [ ] Lute wallet app installed
- [ ] Wallet unlocked
- [ ] On Algorand Testnet
- [ ] Can connect wallet
- [ ] Real address displayed
- [ ] Balance shows correctly

### Network Testing
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access backend: `http://YOUR_IP:3000`
- [ ] Can access frontend: `http://YOUR_IP:5173`
- [ ] Firewall allows connections
- [ ] No VPN blocking connections

## 📊 Expected Behavior

### After Connecting Wallet

**Navbar:**
```
Connected: ABC123...XYZ9
[Disconnect]
```

**Dashboard:**
```
Classes Attended: 0 (or your actual count)
NFT Certificates: 0 (or your actual count)
ALGO Balance: 6.45 (your actual balance)
```

**Console Logs:**
```
Lute initialized successfully
API URL configured as: http://192.168.1.100:3000
Attempting to connect to Lute wallet...
Lute returned addresses: ["YOUR_REAL_ADDRESS"]
Connected to wallet: YOUR_REAL_ADDRESS
```

## 🚀 Production Deployment

For production (not localhost):

### 1. Update Environment Variables

Create `.env` in frontend:
```env
VITE_API_URL=https://api.trustcampus.com
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```

### 3. Deploy
- Frontend: Vercel, Netlify, etc.
- Backend: Heroku, Railway, DigitalOcean, etc.

### 4. Update CORS
In `backend/server.js`:
```javascript
app.use(cors({
    origin: 'https://trustcampus.com', // Your production domain
    credentials: true
}));
```

## 📱 Mobile App Alternative

For better mobile experience, consider:

1. **Progressive Web App (PWA)**
   - Add manifest.json
   - Service worker
   - Install prompt

2. **React Native App**
   - Native mobile app
   - Better performance
   - Native Lute integration

3. **Deep Links**
   - `trustcampus://scan?classId=CS101`
   - Opens app directly

## ✅ Success Criteria

You'll know it's working when:
- ✅ Real wallet address shows (not mock)
- ✅ Actual ALGO balance displays
- ✅ Can access from mobile browser
- ✅ QR codes work on mobile
- ✅ Transactions sign successfully
- ✅ Attendance marks correctly
- ✅ Certificates mint successfully

---

**Status**: ✅ CONFIGURED FOR MOBILE ACCESS

The system now properly connects to Lute wallet and can be accessed from mobile devices on the same network!
