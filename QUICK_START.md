# TrustCampus - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MySQL 8+ installed and running
- Lute Wallet extension installed
- Testnet ALGO in your wallet

### Step 1: Clone and Install (2 minutes)

```bash
# Navigate to project
cd trustcampus

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment (1 minute)

Create `backend/.env`:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trustcampus

ALGO_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
ALGO_ALGOD_PORT=
LUTE_MNEMONIC=your 25 word mnemonic from lute wallet

IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
```

### Step 3: Setup Database (30 seconds)

```bash
cd backend
mysql -u root -p -e "CREATE DATABASE trustcampus;"
mysql -u root -p trustcampus < db_schema.sql
```

### Step 4: Deploy Contracts (1 minute)

```bash
cd backend
npm run deploy
```

✅ You should see 3 contracts deployed with App IDs

### Step 5: Start Application (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Use the App! 🎉

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Try marking attendance or minting a certificate!

---

## 🎯 Quick Test Flow

### Test Attendance
1. Go to Attendance page
2. Switch to "Teacher" tab
3. Enter "CS101" as Class ID
4. Generate QR
5. Switch to "Student" tab
6. Click "Scan QR Code"
7. Enter "CS101"
8. Sign transaction in Lute
9. See confirmation!

### Test Certificate
1. Go to Certificates page
2. Fill form:
   - Title: "Test Certificate"
   - Course: "Blockchain 101"
   - Upload any image
3. Click "Mint Certificate NFT"
4. Sign transaction
5. View your NFT on AlgoExplorer!

---

## 🔧 Common Issues

**"Cannot connect to database"**
- Start MySQL: `sudo service mysql start`
- Check credentials in `.env`

**"App ID not found"**
- Run `npm run deploy` in backend folder
- Check `frontend/src/*_artifact.json` files exist

**"Insufficient balance"**
- Get testnet ALGO: https://bank.testnet.algorand.network/
- Need at least 0.5 ALGO for testing

**"Lute wallet not detected"**
- Install from https://lute.app
- Refresh page after installation

---

## 📚 Next Steps

- Read full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Explore the dashboard
- Mint multiple certificates
- Test with multiple wallets
- Check transactions on AlgoExplorer

## 🎓 What You Built

✅ Decentralized attendance system
✅ NFT certificate minting
✅ IPFS storage integration
✅ Real-time blockchain verification
✅ Lute wallet integration
✅ Live dashboard with real data

Congratulations! You now have a fully functional blockchain-based campus management system! 🎉
