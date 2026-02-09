# TrustCampus - Complete Deployment Guide

## Overview
TrustCampus is a blockchain-based attendance and certificate management system built on Algorand. It features:
- **Lute Wallet Integration** for seamless transaction signing
- **Real NFT Certificates** stored on IPFS and minted as Algorand ASAs
- **Smart Contract Attendance** with QR code scanning
- **Live Dashboard** with real blockchain data

## Prerequisites

### 1. Algorand Testnet Setup
- Install Lute Wallet browser extension: https://lute.app
- Create a wallet and save your mnemonic
- Get testnet ALGO from faucet: https://bank.testnet.algorand.network/

### 2. IPFS/Pinata Setup
- Create account at https://pinata.cloud
- Get API Key and Secret Key from dashboard

### 3. Database Setup
- MySQL 8.0+ installed
- Create database and user

## Step 1: Environment Configuration

### Backend (.env)
```bash
cd trustcampus/backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trustcampus

# Algorand Testnet
ALGO_ALGOD_TOKEN=
ALGO_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
ALGO_ALGOD_PORT=

# Your Lute Wallet Mnemonic (for contract deployment only)
LUTE_MNEMONIC=your 25 word mnemonic here

# Pinata IPFS
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
```

## Step 2: Database Setup

```bash
cd trustcampus/backend
mysql -u root -p < db_schema.sql
```

Or manually:
```sql
CREATE DATABASE trustcampus;
USE trustcampus;
-- Run the SQL from db_schema.sql
```

## Step 3: Install Dependencies

### Backend
```bash
cd trustcampus/backend
npm install
```

### Frontend
```bash
cd trustcampus/frontend
npm install
```

## Step 4: Deploy Smart Contracts

**IMPORTANT**: Make sure your wallet has at least 5 ALGO for contract deployment.

```bash
cd trustcampus/backend
npm run deploy
```

You should see output like:
```
Deploying with account: YOUR_ADDRESS

Deploying attendance...
attendance compiled. Hash: ...
Transaction sent: ...
✓ attendance deployed with App ID: 755213391

Deploying certificate...
✓ certificate deployed with App ID: 755213392

Deploying voting...
✓ voting deployed with App ID: 755213403

Deployment complete!
```

The App IDs are automatically saved to:
- `frontend/src/attendance_artifact.json`
- `frontend/src/certificate_artifact.json`
- `frontend/src/voting_artifact.json`

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd trustcampus/backend
node server.js
```

Should see: `Server running on port 3000`

### Terminal 2 - Frontend
```bash
cd trustcampus/frontend
npm run dev
```

Should see: `Local: http://localhost:5173`

## Step 6: Using the Application

### Connect Wallet
1. Open http://localhost:5173
2. Click "Connect Wallet" in navbar
3. Approve connection in Lute Wallet extension

### Mark Attendance (Teacher Flow)
1. Go to "Attendance" page
2. Switch to "Teacher" tab
3. Enter Class ID (e.g., "CS101")
4. Click "Generate QR Code"
5. Students scan this QR (or enter Class ID manually in demo)
6. View live attendance list on the right

### Mark Attendance (Student Flow)
1. Go to "Attendance" page
2. Stay on "Student" tab
3. Click "Scan QR Code"
4. Enter the Class ID from teacher's screen
5. Sign transaction in Lute Wallet
6. Wait for confirmation
7. View transaction on AlgoExplorer

### Mint Certificate NFT
1. Go to "Certificates" page
2. Fill in certificate details:
   - Title (e.g., "Hackathon Winner")
   - Course/Event (e.g., "AlgoHack 2025")
   - Date
   - Description
3. Upload certificate image (PNG/JPG)
4. Click "Mint Certificate NFT"
5. Sign transaction in Lute Wallet
6. Wait for confirmation
7. Certificate appears in "My Certificates" tab
8. View on AlgoExplorer and IPFS

### View Dashboard
1. Go to "Student Dashboard"
2. See real-time stats:
   - Classes attended
   - NFT certificates owned
   - ALGO balance
3. View recent activity with blockchain links
4. Quick actions to mark attendance or mint certificates

## Troubleshooting

### "App ID not found" Error
- Make sure you ran `npm run deploy` successfully
- Check that artifact files exist in `frontend/src/`
- Verify App IDs are not null in the JSON files

### "Transaction failed" Error
- Ensure wallet has sufficient ALGO (at least 0.1 ALGO)
- Check that you're connected to testnet
- Verify contract is deployed correctly

### "IPFS upload failed" Error
- Verify Pinata API keys in `.env`
- Check Pinata dashboard for rate limits
- Ensure file size is under 100MB

### Database Connection Error
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Lute Wallet Not Connecting
- Install Lute extension from https://lute.app
- Refresh the page
- Check browser console for errors
- Make sure you're on testnet in Lute settings

## Testing with Multiple Users

### Get Testnet ALGO
1. Visit https://bank.testnet.algorand.network/
2. Enter your wallet address
3. Click "Dispense"
4. Wait for confirmation

### Create Multiple Wallets
1. Create additional Lute wallets
2. Fund each with testnet ALGO
3. Test attendance marking from different accounts
4. View all attendance records in teacher view

## Production Deployment

### Backend (Node.js)
- Use PM2 or similar process manager
- Set up HTTPS with SSL certificate
- Use environment variables for secrets
- Set up database backups
- Configure CORS for production domain

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update API URLs to production backend
- Configure environment variables

### Smart Contracts
- Deploy to Algorand Mainnet
- Update `.env` with mainnet node URLs
- Use production wallet with real ALGO
- Test thoroughly on testnet first

## Architecture

```
┌─────────────────┐
│   React App     │
│  (Lute Wallet)  │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼────┐    ┌────▼────────┐
    │ Backend │    │  Algorand   │
    │ Node.js │    │  Testnet    │
    └────┬────┘    └─────────────┘
         │
    ┌────▼────┐
    │  MySQL  │
    └─────────┘
         │
    ┌────▼────┐
    │  IPFS   │
    │ Pinata  │
    └─────────┘
```

## Key Features Implemented

✅ Lute Wallet Integration
✅ Real Smart Contract Deployment
✅ NFT Certificate Minting (Algorand ASAs)
✅ IPFS Storage for Certificate Images
✅ QR Code Attendance System
✅ Live Attendance Tracking
✅ Real-time Dashboard with Blockchain Data
✅ Transaction Verification
✅ Database Indexing for Fast Queries

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Algorand docs: https://developer.algorand.org
3. Check Lute docs: https://docs.lute.app
4. Review Pinata docs: https://docs.pinata.cloud

## License

MIT
