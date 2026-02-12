import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import AttendanceScan from './pages/AttendanceScan';
import Certificates from './pages/Certificates';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Verification from './pages/Verification';
import WalletTest from './pages/WalletTest';
import SigningTest from './pages/SigningTest';
import AIReports from './pages/AIReports';
import Feedback from './pages/Feedback';
import Leaderboard from './pages/Leaderboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Voting from './pages/Voting';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-[#0f172a] text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/hod" element={<Admin />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/scan" element={<AttendanceScan />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/verify/:id" element={<Verification />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reports" element={<AIReports />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/wallet-test" element={<WalletTest />} />
            <Route path="/signing-test" element={<SigningTest />} />
            <Route path="/voting" element={<Voting />} />
          </Routes>
          <ChatBot />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
