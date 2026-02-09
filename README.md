# 🎓 TrustCampus - Blockchain-Powered Campus Management

A revolutionary **blockchain-based attendance and certificate management system** built on **Algorand**, featuring tamper-proof records, NFT certificates, AI-powered insights, and gamified engagement.

> 🏆 **Hackathon-Ready** | Built with React + Node.js + Algorand + Lute Wallet

![Algorand](https://img.shields.io/badge/Algorand-TestNet-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4)

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **📱 QR Attendance** | Teachers generate QR codes; students scan to mark geo-fenced attendance |
| **🌍 Geolocation Verified** | 100m radius verification ensures physical presence |
| **🔗 Blockchain Records** | Every attendance stored immutably on Algorand |
| **🏅 NFT Certificates** | Mint achievement certificates as tradeable NFTs |
| **🏆 Gamified Leaderboard** | Points, streaks, badges for student engagement |
| **🤖 AI Insights** | Ollama-powered chatbot and attendance analytics |
| **📲 SMS Notifications** | Twilio integration for parent notifications |
| **🛡️ Tamper-Proof Feedback** | Blockchain-verified student feedback system |

---

## 📦 Project Structure

```
trustcampus/
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/     # Navbar, ChatBot
│   │   ├── pages/          # All app pages
│   │   ├── context/        # Wallet context
│   │   └── config.js       # API configuration
│   └── .env                # Frontend env vars
│
├── backend/                # Node.js + Express + MySQL
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   ├── services/           # AI, Notifications
│   └── .env                # Backend env vars (DO NOT COMMIT)
│
└── contracts/              # PyTeal smart contracts
```

---

## 🛠️ Quick Start Guide

### Prerequisites

- **Node.js 18+** and npm
- **MySQL** (local or cloud)
- **Lute Wallet** browser extension
- **Ollama** (optional, for AI features)
- **Twilio Account** (optional, for SMS)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Atharva14518/CampusTrust.git
cd CampusTrust
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` with:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trustcampus

# Algorand (TestNet)
ALGOD_SERVER=https://testnet-api.4160.nodely.dev
ALGOD_PORT=
ALGOD_TOKEN=

# Pinata (for NFT IPFS)
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key

# Twilio (optional - for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Ollama (optional - for AI)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
```

Create the database:

```sql
CREATE DATABASE trustcampus;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id VARCHAR(50),
    wallet_address VARCHAR(100),
    student_name VARCHAR(100),
    tx_id VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_address VARCHAR(100),
    title VARCHAR(200),
    description TEXT,
    ipfs_hash VARCHAR(100),
    asset_id BIGINT,
    tx_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_address VARCHAR(100),
    class_id VARCHAR(50),
    teacher_id VARCHAR(50),
    feedback_text TEXT,
    hash VARCHAR(100),
    tx_id VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    sentiment_score FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Start the backend:

```bash
npm start
# Server runs on http://localhost:3000
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
# App runs on http://localhost:5173
```

### 4️⃣ Connect Wallet

1. Install **Lute Wallet** browser extension
2. Create/import a wallet on **Algorand TestNet**
3. Get test ALGO from [TestNet Dispenser](https://bank.testnet.algorand.network/)
4. Click "Connect" in the navbar

---

## 📱 Core Pages & Features

### 🏠 Landing Page (`/`)
- Hero section with feature highlights
- Connect wallet CTA
- Stats and feature cards

### 📊 Student Dashboard (`/student`)
- Attendance count, certificates, wallet balance
- Digital ID card with wallet address
- Recent activity feed
- Quick action links

### 📋 Attendance (`/attendance`)
**For Teachers:**
- Set classroom location on interactive map
- Generate time-limited QR codes (5 min expiry)
- View live attendance count

**For Students (`/scan`):**
- Scan QR code
- Geolocation verification (100m radius)
- Sign transaction with Lute wallet
- Optional: Send SMS to parent

### 🏅 Certificates (`/certificates`)
- View earned certificates
- Mint new NFT certificates (teachers)
- IPFS metadata storage via Pinata
- View on Algo Explorer

### 🏆 Leaderboard (`/leaderboard`)
- Points-based ranking
- Daily streak tracking
- Badge system (Perfect Week, Streak Master, etc.)
- Personal stats card

### 🤖 AI Reports (`/reports`)
- Attendance statistics dashboard
- Generate AI insights (Ollama)
- Class-specific reports
- Charts by class and day

### 💬 Feedback (`/feedback`)
- Submit blockchain-verified feedback
- Sentiment analysis
- Tamper-proof verification
- Public feedback wall

### 🤖 AI ChatBot (floating)
- Ask about attendance, certificates
- Powered by Ollama (local LLM)
- Suggested questions

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | ✅ | MySQL host |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_NAME` | ✅ | Database name |
| `ALGOD_SERVER` | ✅ | Algorand node URL |
| `PINATA_API_KEY` | ⚠️ | For NFT uploads |
| `PINATA_SECRET_KEY` | ⚠️ | For NFT uploads |
| `TWILIO_ACCOUNT_SID` | ❌ | For SMS notifications |
| `TWILIO_AUTH_TOKEN` | ❌ | For SMS notifications |
| `TWILIO_PHONE_NUMBER` | ❌ | Twilio sender number |
| `OLLAMA_HOST` | ❌ | Local Ollama URL |
| `OLLAMA_MODEL` | ❌ | LLM model name |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |

---

## 🎨 UI/UX Design

The app uses a **Gen-Z inspired** design with:

- **Neon gradients** (Pink → Purple → Cyan)
- **Glassmorphism** cards with blur effects
- **Glow effects** on interactive elements
- **Space Grotesk** typography
- **Smooth animations** and transitions
- **Dark theme** optimized for modern aesthetics

---

## 🔗 API Endpoints

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/my?address=` - Get user's attendance
- `GET /api/attendance/report` - Get all records

### Certificates
- `POST /api/certificate/mint` - Mint NFT certificate
- `GET /api/certificate/my?address=` - Get user's certificates

### Reports
- `GET /api/reports/stats` - Statistics summary
- `GET /api/reports/ai-insights` - AI-generated insights
- `GET /api/reports/class/:classId` - Class-specific report

### Feedback
- `POST /api/feedback/submit` - Submit feedback
- `GET /api/feedback/all` - Get all feedback
- `GET /api/feedback/verify/:id` - Verify feedback

### Chat
- `POST /api/chat/ask` - AI chatbot query

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Connect Lute wallet on TestNet
- [ ] Mark attendance via QR scan
- [ ] Verify attendance on Algo Explorer
- [ ] Mint a test certificate
- [ ] Check leaderboard points
- [ ] Submit feedback
- [ ] Generate AI report

### Common Issues

| Issue | Solution |
|-------|----------|
| Wallet won't connect | Ensure Lute is on TestNet |
| Transaction fails | Check wallet has test ALGO |
| QR expired | Generate new QR (5 min limit) |
| Location denied | Enable browser location |
| AI not working | Start Ollama: `ollama serve` |
| SMS not sending | Verify Twilio number in console |

---

## 🚀 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy from `backend/` directory

### Frontend (Vercel/Netlify)

1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add `VITE_API_URL` env variable

---

## 📚 Resources

- [Algorand Developer Portal](https://dev.algorand.co/)
- [Lute Wallet](https://lute.app/)
- [Pinata IPFS](https://pinata.cloud/)
- [Twilio SMS](https://twilio.com/)
- [Ollama LLM](https://ollama.ai/)
- [AlgoKit Workshops](https://algorand.co/algokit-workshops)
- [Algodevs YouTube](https://www.youtube.com/@algodevs)

---

## 👥 Team

Built with ❤️ for the future of education.

---

## 📄 License

MIT License - Feel free to use and modify!
