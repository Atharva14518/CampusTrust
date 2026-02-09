# TrustCampus - Blockchain-Based Campus Management System

A decentralized platform for attendance tracking and certificate management built on Algorand blockchain with Lute wallet integration.

## 🌟 Features

### ✅ Implemented & Working

- **🔐 Lute Wallet Integration** - Secure transaction signing
- **📱 Mobile QR Attendance** - Scan with phone camera
- **🎓 NFT Certificates** - Real Algorand ASAs stored on IPFS
- **⛓️ Smart Contracts** - Deployed on Algorand Testnet
- **📊 Live Dashboard** - Real-time blockchain data
- **👥 Student Names** - Visible in attendance tracking
- **🔄 Auto-Refresh** - Live attendance updates every 3 seconds
- **✅ Blockchain Verification** - All transactions on AlgoExplorer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- Lute Wallet extension
- Testnet ALGO (from faucet)

### Installation (5 minutes)

```bash
# 1. Install dependencies
cd trustcampus/backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cd ../backend
cp .env.example .env
# Edit .env with your credentials

# 3. Setup database
mysql -u root -p < db_schema.sql
mysql -u root -p trustcampus < migration_add_student_name.sql

# 4. Deploy contracts
npm run deploy

# 5. Start servers
# Terminal 1
npm start

# Terminal 2
cd ../frontend
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📱 How to Use

### For Teachers (Attendance)

1. Go to **Attendance** page
2. Enter Class ID (e.g., "CS101")
3. Click **Generate QR Code**
4. Display QR on screen/projector
5. Watch live attendance roll in!

### For Students (Attendance)

1. **Scan QR** with phone camera
2. Browser opens attendance page
3. **Connect Lute Wallet**
4. **Enter your name**
5. **Sign transaction**
6. Done! ✅

### For Students (Certificates)

1. Go to **Certificates** page
2. Fill in certificate details
3. Upload certificate image
4. Click **Mint Certificate NFT**
5. Sign transaction
6. View on AlgoExplorer!

## 🏗️ Architecture

```
┌─────────────┐
│   React     │ ← Lute Wallet Integration
│  Frontend   │
└──────┬──────┘
       │
   ┌───┴────┬──────────┐
   │        │          │
┌──▼──┐  ┌──▼────┐  ┌─▼────────┐
│ API │  │Algorand│  │  IPFS    │
│Node │  │Testnet │  │ Pinata   │
└──┬──┘  └────────┘  └──────────┘
   │
┌──▼──┐
│MySQL│
└─────┘
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete setup guide
- **[MOBILE_ATTENDANCE_GUIDE.md](./MOBILE_ATTENDANCE_GUIDE.md)** - Mobile QR scanning
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Recent bug fixes

## 🔧 Tech Stack

### Frontend
- React 19.2.0
- Vite 7.2.4
- TailwindCSS 4.1.18
- lute-connect 1.6.3
- algosdk 3.5.2
- qrcode.react 4.2.0

### Backend
- Node.js + Express 5.2.1
- algosdk 2.7.0
- MySQL 8+
- Multer (file uploads)
- Axios (IPFS)

### Blockchain
- Algorand Testnet
- Smart Contracts (TEAL)
- Lute Wallet
- IPFS (Pinata)

## 🎯 Smart Contracts

Deployed on Algorand Testnet:

- **Attendance Contract**: App ID 755213391
- **Certificate Contract**: App ID 755213392
- **Voting Contract**: App ID 755213403

View on [AlgoExplorer](https://testnet.algoexplorer.io)

## 🔐 Environment Variables

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trustcampus

# Algorand
ALGO_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
LUTE_MNEMONIC=your 25 word mnemonic

# IPFS
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
```

## 📊 Database Schema

```sql
-- Attendance with student names
CREATE TABLE attendance (
    id INT PRIMARY KEY,
    class_id VARCHAR(100),
    wallet_address VARCHAR(255),
    student_name VARCHAR(255),
    tx_id VARCHAR(255),
    timestamp TIMESTAMP
);

-- NFT Certificates
CREATE TABLE certificates (
    id INT PRIMARY KEY,
    student_address VARCHAR(255),
    title VARCHAR(255),
    course VARCHAR(255),
    metadata_cid VARCHAR(255),
    image_cid VARCHAR(255),
    asset_id BIGINT,
    tx_id VARCHAR(255),
    status VARCHAR(50)
);
```

## 🧪 Testing

### Test Attendance
```bash
# 1. Generate QR for "TEST101"
# 2. Scan with phone or copy link
# 3. Connect wallet
# 4. Enter name: "Test Student"
# 5. Sign transaction
# 6. Verify on teacher view
```

### Test Certificate
```bash
# 1. Upload certificate image
# 2. Fill details
# 3. Mint NFT
# 4. Check AlgoExplorer
# 5. View on IPFS
```

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if MySQL is running
# Verify .env credentials
# Run: npm install
```

### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules
npm install
```

### Database Issues
```bash
# Run migrations
mysql -u root -p trustcampus < migration_add_student_name.sql
```

### Wallet Connection Failed
- Install Lute extension
- Switch to Testnet
- Refresh page

## 🎓 Use Cases

### Educational Institutions
- ✅ Automated attendance tracking
- ✅ Tamper-proof records
- ✅ Digital certificates
- ✅ Blockchain verification

### Corporate Training
- ✅ Training attendance
- ✅ Course completion certificates
- ✅ Verifiable credentials

### Events & Conferences
- ✅ Event check-in
- ✅ Participation certificates
- ✅ Proof of attendance

## 🔮 Roadmap

### Phase 1 (Completed) ✅
- [x] Lute wallet integration
- [x] Smart contract deployment
- [x] NFT certificate minting
- [x] Mobile QR attendance
- [x] Live dashboard

### Phase 2 (Planned)
- [ ] Geolocation verification
- [ ] Time-based QR expiry
- [ ] Attendance analytics
- [ ] Email notifications
- [ ] Bulk operations

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] LMS integration
- [ ] Multi-chain support
- [ ] DAO governance

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Algorand Foundation
- Lute Wallet Team
- Pinata IPFS
- Open source community

## 📞 Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Algorand: https://developer.algorand.org
- Lute: https://docs.lute.app

## 🎉 Success Metrics

After setup, you'll have:
- ✅ 3 smart contracts on Algorand
- ✅ Working mobile attendance
- ✅ NFT certificate minting
- ✅ Real-time blockchain verification
- ✅ Production-ready system

---

**Built with ❤️ using Algorand blockchain**

**Status**: ✅ Production Ready

All core features implemented and tested. Ready for deployment!
