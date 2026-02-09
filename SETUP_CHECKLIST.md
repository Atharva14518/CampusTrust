# TrustCampus Setup Checklist

## ✅ Pre-Setup Requirements

### 1. Software Installation
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MySQL 8+ installed and running (`mysql --version`)
- [ ] Git installed (optional)

### 2. Algorand Setup
- [ ] Lute Wallet extension installed (https://lute.app)
- [ ] Wallet created and mnemonic saved securely
- [ ] Switched to Testnet in Lute settings
- [ ] Testnet ALGO received (https://bank.testnet.algorand.network/)
- [ ] At least 5 ALGO in wallet for contract deployment

### 3. IPFS Setup
- [ ] Pinata account created (https://pinata.cloud)
- [ ] API Key generated
- [ ] Secret Key saved

## ✅ Installation Steps

### 1. Backend Setup
- [ ] Navigate to `trustcampus/backend`
- [ ] Run `npm install`
- [ ] Create `.env` file
- [ ] Fill in all environment variables:
  - [ ] Database credentials
  - [ ] Algorand node URL
  - [ ] Lute mnemonic (25 words)
  - [ ] Pinata API keys

### 2. Database Setup
- [ ] MySQL service running
- [ ] Database created: `CREATE DATABASE trustcampus;`
- [ ] Schema imported: `mysql -u root -p trustcampus < db_schema.sql`
- [ ] Tables verified: `SHOW TABLES;`

### 3. Frontend Setup
- [ ] Navigate to `trustcampus/frontend`
- [ ] Run `npm install`
- [ ] No additional configuration needed

## ✅ Deployment Steps

### 1. Deploy Smart Contracts
- [ ] Navigate to `trustcampus/backend`
- [ ] Run `npm run deploy`
- [ ] Verify output shows 3 contracts deployed
- [ ] Check artifact files exist:
  - [ ] `frontend/src/attendance_artifact.json`
  - [ ] `frontend/src/certificate_artifact.json`
  - [ ] `frontend/src/voting_artifact.json`
- [ ] Verify App IDs are not null in artifacts

### 2. Start Backend
- [ ] Navigate to `trustcampus/backend`
- [ ] Run `npm start`
- [ ] Verify: "Server running on port 3000"
- [ ] Test: Open http://localhost:3000 in browser
- [ ] Should see: "TrustCampus API is running"

### 3. Start Frontend
- [ ] Navigate to `trustcampus/frontend`
- [ ] Run `npm run dev`
- [ ] Verify: "Local: http://localhost:5173"
- [ ] Open http://localhost:5173 in browser
- [ ] Landing page loads successfully

## ✅ Testing Checklist

### 1. Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] Lute extension popup appears
- [ ] Approve connection
- [ ] Wallet address shows in navbar
- [ ] Can disconnect and reconnect

### 2. Attendance System (Teacher)
- [ ] Navigate to Attendance page
- [ ] Switch to "Teacher" tab
- [ ] Enter Class ID: "TEST101"
- [ ] Click "Generate QR Code"
- [ ] QR code displays
- [ ] Attendance list section appears

### 3. Attendance System (Student)
- [ ] Switch to "Student" tab
- [ ] Click "Scan QR Code"
- [ ] Enter Class ID: "TEST101"
- [ ] Lute wallet popup appears
- [ ] Sign transaction
- [ ] Wait for confirmation (10-15 seconds)
- [ ] Success message appears
- [ ] Transaction ID displayed
- [ ] Click transaction link → AlgoExplorer opens
- [ ] Transaction confirmed on blockchain

### 4. Attendance Verification
- [ ] Switch back to "Teacher" tab
- [ ] Refresh or wait 5 seconds
- [ ] Your wallet address appears in attendance list
- [ ] Timestamp is correct
- [ ] Green checkmark shows

### 5. Certificate Minting
- [ ] Navigate to Certificates page
- [ ] Fill in form:
  - [ ] Title: "Test Certificate"
  - [ ] Course: "Blockchain 101"
  - [ ] Date: Today's date
  - [ ] Description: "Test description"
- [ ] Upload an image (PNG/JPG)
- [ ] Click "Mint Certificate NFT"
- [ ] Lute wallet popup appears
- [ ] Sign transaction
- [ ] Wait for confirmation (10-15 seconds)
- [ ] Success alert with Asset ID
- [ ] Certificate appears in "My Certificates" tab

### 6. Certificate Verification
- [ ] Certificate card shows in gallery
- [ ] Title and course display correctly
- [ ] Status shows "Verified"
- [ ] Asset ID is displayed
- [ ] Click "Explorer" link → AlgoExplorer opens
- [ ] Asset details show on AlgoExplorer
- [ ] Click "IPFS" link → Metadata loads
- [ ] Image displays from IPFS

### 7. Dashboard
- [ ] Navigate to Student Dashboard
- [ ] Statistics show:
  - [ ] Classes Attended: 1 (or more)
  - [ ] NFT Certificates: 1 (or more)
  - [ ] ALGO Balance: Your actual balance
- [ ] Recent Activity shows:
  - [ ] Attendance record with tx link
  - [ ] Certificate mint with asset link
- [ ] Digital ID card shows:
  - [ ] Your wallet address
  - [ ] "VERIFIED" badge
  - [ ] Link to AlgoExplorer works

### 8. Multiple Users Test
- [ ] Create second Lute wallet
- [ ] Fund with testnet ALGO
- [ ] Connect with second wallet
- [ ] Mark attendance for same class
- [ ] Verify both addresses show in teacher view
- [ ] Mint certificate from second wallet
- [ ] Verify in "All Certificates" tab

## ✅ Verification Checklist

### Blockchain Verification
- [ ] All transactions visible on AlgoExplorer
- [ ] Smart contracts deployed and active
- [ ] NFTs show correct metadata
- [ ] Attendance transactions confirmed

### IPFS Verification
- [ ] Certificate images accessible via IPFS
- [ ] Metadata JSON accessible via IPFS
- [ ] Links work from multiple gateways

### Database Verification
```sql
-- Check attendance records
SELECT * FROM attendance;

-- Check certificates
SELECT * FROM certificates;

-- Verify indexes
SHOW INDEX FROM attendance;
SHOW INDEX FROM certificates;
```

## ✅ Common Issues Resolution

### Issue: "Cannot connect to database"
- [ ] MySQL service running: `sudo service mysql start`
- [ ] Credentials correct in `.env`
- [ ] Database exists: `SHOW DATABASES;`
- [ ] User has permissions

### Issue: "App ID not found"
- [ ] Contracts deployed: `npm run deploy`
- [ ] Artifact files exist in frontend/src/
- [ ] App IDs not null in JSON files
- [ ] Frontend restarted after deployment

### Issue: "Transaction failed"
- [ ] Wallet has sufficient ALGO (>0.5)
- [ ] Connected to testnet
- [ ] Contract deployed successfully
- [ ] Network connection stable

### Issue: "IPFS upload failed"
- [ ] Pinata API keys correct
- [ ] File size under 100MB
- [ ] Pinata account active
- [ ] Check Pinata dashboard for errors

### Issue: "Lute wallet not detected"
- [ ] Extension installed
- [ ] Browser restarted
- [ ] Page refreshed
- [ ] Extension enabled

## ✅ Production Readiness

### Before Going Live
- [ ] All tests passing
- [ ] Multiple users tested
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation complete

### Mainnet Deployment
- [ ] Contracts deployed to mainnet
- [ ] Environment variables updated
- [ ] Real ALGO funded
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] CORS configured
- [ ] Rate limiting enabled

## 📊 Success Metrics

After completing this checklist, you should have:
- ✅ 3 smart contracts deployed on Algorand Testnet
- ✅ Functional attendance system with QR codes
- ✅ Working NFT certificate minting
- ✅ Real-time dashboard with blockchain data
- ✅ All transactions verifiable on AlgoExplorer
- ✅ All certificates stored on IPFS
- ✅ Database properly indexed and populated

## 🎉 You're Done!

If all items are checked, congratulations! You have a fully functional blockchain-based campus management system with:
- Real Lute wallet integration
- Actual smart contract deployment
- True NFT minting on Algorand
- IPFS storage for certificates
- Live blockchain verification

**Next Steps:**
1. Test with multiple users
2. Customize UI/branding
3. Add more features
4. Deploy to production
5. Share with your campus!

---

**Need Help?** Check:
- QUICK_START.md for fast setup
- DEPLOYMENT_GUIDE.md for detailed instructions
- IMPLEMENTATION_SUMMARY.md for technical details
