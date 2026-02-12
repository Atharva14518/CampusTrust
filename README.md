# 🎓 TrustCampus - Blockchain-Powered Campus Ecosystem

A revolutionary **Web3 campus management system** built on **Algorand**, featuring role-based access, tamper-proof attendance, NFT certificates, decentralized voting, and AI-powered insights.

> 🏆 **Hackathon-Ready** | React + Node.js + Algorand + Pera/Defly/Lute Wallets

![Algorand](https://img.shields.io/badge/Algorand-TestNet-000000?style=for-the-badge&logo=algorand)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=for-the-badge&logo=vite)

---

## 🚀 Key Features

### 🔐 **Role-Based Access Control (RBAC)**
*   **👨‍🎓 Student**: Mark attendance, view NFTs, vote, check leaderboard.
*   **👨‍🏫 Teacher**: Create classes, generate QR codes, mint certificates, manage proposals.
*   **👔 HOD (Admin)**: Department analytics, oversee teachers, advanced reporting.

### 📱 **Smart Attendance System**
*   **Camera-Based Scanning**: Built-in QR scanner for students (no external app needed).
*   **Geo-Fencing**: Validates student location within 100m of the classroom.
*   **Anti-Spoofing**: Prevents proxy attendance via IP tracking and device fingerprinting.
*   **Blockchain Record**: Every check-in is an immutable transaction on Algorand.

### 🗳️ **Decentralized Voting & Governance**
*   **Proposals**: Teachers/HODs create proposals for campus decisions.
*   **On-Chain Voting**: Students vote directly via wallet transactions.
*   **Transparent Results**: Real-time vote counts verifiable on the blockchain.

### 💼 **Multi-Wallet Support**
*   **Pera Wallet** (Mobile/Web)
*   **Defly Wallet**
*   **Lute Wallet**
*   **Kibisis**

### 🏅 **NFT Certificates & Rewards**
*   **Soulbound Tokens**: Non-transferable NFTs for course completion.
*   **Gamification**: Leaderboards, streaks, and badges to boost engagement.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, TailwindCSS, Framer Motion, html5-qrcode
*   **Backend**: Node.js, Express, MySQL
*   **Blockchain**: Algorand SDK, Pera Connect, Defly Connect
*   **AI/ML**: Ollama (Local LLM) for insights
*   **Storage**: Pinata IPFS (for NFT metadata)

---

## 📦 Project Structure

```
trustcampus/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Role-specific dashboards (Student/Teacher/HOD)
│   │   ├── components/     # QRScanner, Navbar, WalletConnect
│   │   ├── context/        # Wallet & Auth Context
│   │   └── contracts/      # TEAL Smart Contracts
│   └── .env                # API Config
│
├── backend/
│   ├── controllers/        # Attendance, Voting, Certificate Logic
│   ├── routes/             # API Endpoints
│   ├── init_db.js          # Database migrations
│   └── .env                # Secrets (DB, Algo, Pinata)
│
└── contracts/              # PyTeal Source Code
```

---

## 🚦 Quick Start

### 1️⃣ Clone & Install
```bash
git clone https://github.com/Atharva14518/CampusTrust.git
cd CampusTrust
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install

# Setup .env (Refer to .env.example)
# Ensure MySQL is running and create database 'trustcampus'

# Initialize Database & Migrations
node init_db.js

# Start Server
npm start
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install

# Start React App
npm run dev
```

---

## 📱 User Descriptions & Workflows

### 👨‍🎓 **Student Workflow**
1.  **Login**: Connect wallet -> Select "Student".
2.  **Mark Attendance**: Click "Scan QR" -> Point camera at teacher's screen -> Sign transaction.
3.  **Vote**: Go to "Vote" -> Browse proposals -> Cast "Yes/No/Abstain".
4.  **Profile**: View attendance stats, collected NFTs, and leaderboard rank.

### 👨‍🏫 **Teacher Workflow**
1.  **Login**: Connect wallet -> Select "Teacher".
2.  **Start Class**: Go to "Attendance" -> Set location -> Generate QR.
3.  **Manage**: Mint certificates for top students, create voting proposals.
4.  **Reports**: View class-wise analytics and AI insights.

### 👔 **HOD Workflow**
1.  **Login**: Connect wallet -> Select "HOD".
2.  **Oversight**: View department-wide statistics and teacher performance.
3.  **Governance**: Create high-level proposals and manage department settings.

---

## 🧪 Testing Guide

1.  **Wallet**: Use **TestNet** accounts. Get ALGO from [Dispenser](https://bank.testnet.algorand.network/).
2.  **Attendance**:
    *   Open Teacher Dashboard in one tab/browser (Generate QR).
    *   Open Student Dashboard in mobile/another window.
    *   Use "Scan QR" to scan the code.
3.  **Voting**:
    *   Create a proposal as Teacher.
    *   Vote as Student.
    *   Verify transaction on [AlgoExplorer](https://testnet.algoexplorer.io/).

---

## 📄 License
MIT License. Built for the **Algorand Global Hackathon**.
