# TrustCampus - Blockchain-Powered Campus Ecosystem (AlgoHub Hackathon Starter)

This comprehensive guide helps developers and evaluators quickly prototype, test, and deploy the TrustCampus decentralized campus management system on Algorand. You'll set up the full stack (React + Node.js + Algorand), configure smart contracts, and explore key features like Role-Based Access Control (RBAC), Smart Attendance, Decentralized Voting, and NFT Certificates.

**Repo to fork/clone:** `https://github.com/Atharva14518/CampusTrust` (source)
**Works with:** AlgoKit, Pera/Defly/Lute Wallets, React 18, Node.js

**Key Modules Included:**
*   **🔐 Role-Based Access:** Student, Teacher, and HOD dashboards with distinct permissions.
*   **� Smart Attendance:** Camera-based QR scanning with geo-fencing and anti-spoofing.
*   **�️ Decentralized Voting:** On-chain proposal creation and voting logic.
*   **🏅 NFT Certificates:** Minting soulbound tokens for academic achievements.
*   **🤖 AI Insights:** Local LLM integration for attendance analytics.

---

## 1) Project Setup

**Prerequisites:**
*   **Node.js 18+** and npm
*   **MySQL Server** (local or cloud)
*   **Algorand Wallet** (Pera Mobile, Defly, or Lute Extension)
*   **Git** installed

### Clone the Repository
```bash
git clone https://github.com/Atharva14518/CampusTrust.git
cd CampusTrust
```

### Backend Bootstrap (Database & API)
```bash
cd backend
npm install

# Create .env from example (see Section 2)
# Ensure MySQL is running

# Initialize Database Schema & Migrations
node init_db.js

# Start the Backend Server
npm start
# Server runs on http://localhost:3001
```

### Frontend Bootstrap (React UI)
```bash
cd ../frontend
npm install

# Start the Frontend
npm run dev
# App runs on http://localhost:5173
```

**Optional references:**
*   **Algorand Developer Portal:** https://dev.algorand.co/
*   **AlgoKit Workshops:** https://algorand.co/algokit-workshops
*   **Algodevs YouTube:** https://www.youtube.com/@algodevs

---

## 2) Required Environment Variables

### Backend (`backend/.env`)
Create `backend/.env` with the following values for TestNet and Database:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trustcampus

# Algorand TestNet Node (Free Tier)
ALGOD_SERVER=https://testnet-api.4160.nodely.dev
ALGOD_PORT=
ALGOD_TOKEN=

# Pinata IPFS (for NFT metadata)
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key

# Optional Integrations
TWILIO_ACCOUNT_SID=   # For SMS alerts
TWILIO_AUTH_TOKEN=
OLLAMA_HOST=http://localhost:11434 # For AI insights
```

### Frontend (`frontend/.env`)
Create `frontend/.env` to point to your backend API:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Algorand Network Config
VITE_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
VITE_ALGOD_NETWORK=testnet
```

**Notes:**
*   Pinata keys are required for Minting NFT Certificates.
*   Restart servers (`npm start` / `npm run dev`) after editing `.env` files.

---

## 3) Project Map (What to Tweak)

### Frontend Location: `frontend/src`

**Key Pages & Components:**
*   `src/pages/Login.jsx` — **Role Selection Logic**. Handles wallet connection and redirects based on role (Student/Teacher/HOD).
*   `src/pages/StudentDashboard.jsx` — **Student Hub**. Displays attendance stats, NFT gallery, and active proposals.
*   `src/pages/TeacherDashboard.jsx` — **Teacher Hub**. Class management, QR generation, and certificate minting.
*   `src/pages/QRScanner.jsx` — **Camera Intelligence**. Handles real-time QR scanning and decoding for attendance.
*   `src/pages/Voting.jsx` — **Governance**. Lists proposals and handles on-chain voting transactions.
*   `src/pages/AIReports.jsx` — **Analytics**. Renders charts and AI-generated insights based on user role.
*   `src/context/WalletContext.jsx` — **Wallet Connect**. Manages connections for Pera, Defly, and Lute wallets.

### Backend Location: `backend/`

**Key Controllers:**
*   `controllers/attendanceController.js` — Validates geo-location, marks attendance, prevents proxies.
*   `controllers/proposalController.js` — Manages proposal lifecycle and vote tallying.
*   `controllers/certificateController.js` — Handles IPFS metadata upload and NFT minting.

---

## 4) Feature Deep Dive & AI Redesign Prompts

How to work with AI to customize this template safely (keep logic intact).

### 4.1 Student Dashboard & QR Scanner
**File:** `frontend/src/pages/StudentDashboard.jsx` & `frontend/src/pages/QRScanner.jsx`

**Prompt:**
> I'm building a student portal for a blockchain campus app. Redesign the dashboard to focus on gamification:
> - Display "Attendance Streak" and "NFT Badges" prominently.
> - Use a card layout for "Recent Activity" and "Active Votes".
> - Ensure the "Scan QR" button is the primary Call-to-Action (CTA).
> - Keep all data fetching and wallet logic EXACTLY as is. Only update JSX and Tailwind classes.

### 4.2 Teacher Dashboard & Minting
**File:** `frontend/src/pages/TeacherDashboard.jsx`

**Prompt:**
> Enhance the Teacher Dashboard for better classroom management. Redesign the layout to include:
> - A "Quick Actions" bar for: Generate QR, Mint Certificate, Create Proposal.
> - A data table for "Recent Attendance" with export options.
> - A monitoring panel for "Active Sessions".
> - Keep all state management and API calls distinct. Modify only the visual structure.

### 4.3 Decentralized Voting System
**File:** `frontend/src/pages/Voting.jsx`

**Prompt:**
> I'm building a governance interface. Redesign the voting page to look like a DAO dashboard:
> - Display proposals in a list with "Time Remaining" progress bars.
> - Show live "Yes/No/Abstain" counts with visual graphs.
> - Style the "Vote" buttons to be distinct and provide feedback on click.
> - Maintain the on-chain transaction logic perfectly.

### 4.4 NFT Certificates (Pinata + IPFS)
**File:** `frontend/src/pages/Certificates.jsx`

**Prompt:**
> Redesign the Certificate Gallery to look like a digital trophy case:
> - Display NFTs in a grid with high-quality previews.
> - Add a "Mint New" modal for teachers with clear file upload inputs.
> - Show metadata (Course Name, Date) on hover.
> - Keep the Pinata IPFS upload logic intact.

---

## 5) Smart Contract Interaction Basics

*   **Attendance**: Each marked attendance is a `PaymentTransaction` (0 ALGO) with a compiled note containing Class ID, Student ID, and Timestamp. This creates an immutable on-chain record.
*   **Voting**: Votes are cast as transactions to a specific Voting App ID (or logged via notes for simpler implementation), allowing for transparent tallying.
*   **Certificates**: Standard Algorand Stars Assets (ASAs) are minted. Metadata is stored on IPFS, and the Asset ID is linked to the student's account.

---

## 6) Troubleshooting

**"Invalid QR Code" / Blank Screen on Scan**
*   Ensure the QR code was generated by the *current* Teacher Dashboard session.
*   Check if the QR has expired (default validity is 5 minutes).
*   Verify `VITE_API_URL` matches your backend address.

**Wallet Connection Fails**
*   Ensure your wallet (Pera/Defly) is on **TestNet**.
*   Check if you have enough ALGO for transaction fees (Dispenser: https://bank.testnet.algorand.network/).
*   Clear browser cache if switching between wallet providers.

**"Minting Failed"**
*   Verify Pinata keys in `backend/.env`.
*   Ensure the image file is not too large (>5MB).
*   Check if the creator account has sufficient minimum balance for asset creation (0.1 ALGO).

---

## 7) CI/CD & Deployment

### Backend (Render/Railway/Heroku)
1.  Push code to GitHub.
2.  Connect repo to hosting provider.
3.  Set environment variables (`DB_URL`, `ALGO_TOKEN`, `PINATA_KEY`).
4.  Build Command: `npm install`
5.  Start Command: `npm start`

### Frontend (Vercel/Netlify)
1.  Connect GitHub repo.
2.  Set Build Command: `npm run build`
3.  Set Publish Directory: `dist`
4.  Add `VITE_API_URL` environment variable pointing to your deployed backend.

---

## 8) Copy-Ready AI Prompt Snippets

**Home (Landing Page):**
> Redesign `frontend/src/pages/Landing.jsx` as a high-conversion Web3 landing page. Hero section with "Blockchain-Verified Education", feature grid for (Attendance, NFTs, Voting), and a "Connect Wallet" CTA. Keep logic intact.

**Voting:**
> Redesign `frontend/src/pages/Voting.jsx` to visualize governance. Show proposals with clear status (Active/Passed), progress bars for votes, and a clean "Create Proposal" form for teachers. Maintain all voting logic.

**QR Scanner:**
> Redesign `frontend/src/pages/QRScanner.jsx` for mobile-first usage. Large camera view, clear overlay instructions ("Align QR Code"), and immediate feedback upon scan success. Keep the html5-qrcode integration logic.

---

## 📄 License
MIT License - Built for the **Algorand Global Hackathon**.
